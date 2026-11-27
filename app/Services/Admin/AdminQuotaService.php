<?php

namespace Pterodactyl\Services\Admin;

use Pterodactyl\Models\User;
use Pterodactyl\Models\Server;
use Illuminate\Support\Facades\Schema;
use Pterodactyl\Exceptions\DisplayException;

class AdminQuotaService
{
    private static ?bool $schemaReady = null;

    /**
     * Check once per request whether quota columns exist (safe before migration runs).
     */
    public function hasSchemaColumns(): bool
    {
        if (static::$schemaReady === null) {
            static::$schemaReady = Schema::hasColumn('users', 'server_create_limit')
                && Schema::hasColumn('servers', 'created_by');
        }

        return static::$schemaReady;
    }

    /**
     * Return live usage and configured limits for a given admin user.
     *
     * @return array{
     *     servers_used: int,
     *     memory_used: int,
     *     disk_used: int,
     *     cpu_used: int,
     *     server_limit: int|null,
     *     memory_limit: int|null,
     *     disk_limit: int|null,
     *     cpu_limit: int|null
     * }
     */
    public function getUsage(User $admin): array
    {
        $hasCreatedBy = $this->hasSchemaColumns();

        $query = Server::query();
        if ($hasCreatedBy) {
            $query->where(function ($builder) use ($admin) {
                $builder->where('created_by', $admin->id)
                    ->orWhere(function ($legacy) use ($admin) {
                        $legacy->whereNull('created_by')
                            ->where('owner_id', $admin->id);
                    });
            });
        } else {
            $query->where('owner_id', $admin->id);
        }

        $stats = $query->selectRaw(
            'COUNT(*) as servers_used, COALESCE(SUM(memory), 0) as memory_used, COALESCE(SUM(disk), 0) as disk_used, COALESCE(SUM(cpu), 0) as cpu_used'
        )->first();

        return [
            'servers_used' => (int) ($stats->servers_used ?? 0),
            'memory_used' => (int) ($stats->memory_used ?? 0),
            'disk_used' => (int) ($stats->disk_used ?? 0),
            'cpu_used' => (int) ($stats->cpu_used ?? 0),
            'server_limit' => $hasCreatedBy ? $admin->server_create_limit : null,
            'memory_limit' => $hasCreatedBy ? $admin->memory_create_limit : null,
            'disk_limit' => $hasCreatedBy ? $admin->disk_create_limit : null,
            'cpu_limit' => $hasCreatedBy ? $admin->cpu_create_limit : null,
        ];
    }

    /**
     * Assert that an admin (non-ID-1) has sufficient quota to create a new server.
     *
     * @throws DisplayException
     */
    public function assertCanCreateServer(User $actor, array $serverData): void
    {
        if ($actor->id === 1 || !$this->hasSchemaColumns()) {
            return;
        }

        $usage = $this->getUsage($actor);

        if ($usage['server_limit'] !== null) {
            if ($usage['server_limit'] === 0) {
                throw new DisplayException('Kuota Buat Server: Akses pembuatan server untuk akun admin Anda dinonaktifkan (batas: 0).');
            }

            if ($usage['servers_used'] >= $usage['server_limit']) {
                throw new DisplayException(sprintf(
                    'Kuota Buat Server Penuh: Anda sudah mencapai batas maksimal %d server (%d/%d terpakai).',
                    $usage['server_limit'],
                    $usage['servers_used'],
                    $usage['server_limit']
                ));
            }
        }

        $reqMemory = (int) ($serverData['memory'] ?? 0);
        if ($usage['memory_limit'] !== null) {
            if ($reqMemory === 0) {
                throw new DisplayException('Kuota RAM: Anda tidak diizinkan membuat server dengan RAM Unlimited (0 MiB).');
            }
            if (($usage['memory_used'] + $reqMemory) > $usage['memory_limit']) {
                $remaining = max(0, $usage['memory_limit'] - $usage['memory_used']);
                throw new DisplayException(sprintf(
                    'Kuota RAM Melebihi Batas: Sisa kuota RAM Anda %d MiB dari batas %d MiB (diminta %d MiB).',
                    $remaining,
                    $usage['memory_limit'],
                    $reqMemory
                ));
            }
        }

        $reqDisk = (int) ($serverData['disk'] ?? 0);
        if ($usage['disk_limit'] !== null) {
            if ($reqDisk === 0) {
                throw new DisplayException('Kuota Disk: Anda tidak diizinkan membuat server dengan Disk Unlimited (0 MiB).');
            }
            if (($usage['disk_used'] + $reqDisk) > $usage['disk_limit']) {
                $remaining = max(0, $usage['disk_limit'] - $usage['disk_used']);
                throw new DisplayException(sprintf(
                    'Kuota Disk Melebihi Batas: Sisa kuota Disk Anda %d MiB dari batas %d MiB (diminta %d MiB).',
                    $remaining,
                    $usage['disk_limit'],
                    $reqDisk
                ));
            }
        }

        $reqCpu = (int) ($serverData['cpu'] ?? 0);
        if ($usage['cpu_limit'] !== null) {
            if ($reqCpu === 0) {
                throw new DisplayException('Kuota CPU: Anda tidak diizinkan membuat server dengan CPU Unlimited (0%).');
            }
            if (($usage['cpu_used'] + $reqCpu) > $usage['cpu_limit']) {
                $remaining = max(0, $usage['cpu_limit'] - $usage['cpu_used']);
                throw new DisplayException(sprintf(
                    'Kuota CPU Melebihi Batas: Sisa kuota CPU Anda %d%% dari batas %d%% (diminta %d%%).',
                    $remaining,
                    $usage['cpu_limit'],
                    $reqCpu
                ));
            }
        }
    }

    /**
     * Prevent quota bypass by upgrading server RAM/Disk/CPU after creation.
     *
     * @throws DisplayException
     */
    public function assertCanUpdateBuild(User $actor, Server $server, array $buildData): void
    {
        if ($actor->id === 1 || !$this->hasSchemaColumns()) {
            return;
        }

        $usage = $this->getUsage($actor);
        $countedInUsage = $server->created_by === $actor->id
            || ($server->created_by === null && $server->owner_id === $actor->id);

        $checks = [
            'memory' => ['limit_key' => 'memory_limit', 'used_key' => 'memory_used', 'label' => 'RAM', 'unit' => ' MiB'],
            'disk' => ['limit_key' => 'disk_limit', 'used_key' => 'disk_used', 'label' => 'Disk', 'unit' => ' MiB'],
            'cpu' => ['limit_key' => 'cpu_limit', 'used_key' => 'cpu_used', 'label' => 'CPU', 'unit' => '%'],
        ];

        foreach ($checks as $field => $meta) {
            if (!array_key_exists($field, $buildData) || $buildData[$field] === null) {
                continue;
            }

            $limit = $usage[$meta['limit_key']];
            if ($limit === null) {
                continue;
            }

            $oldVal = (int) $server->{$field};
            $newVal = (int) $buildData[$field];

            if ($newVal === $oldVal) {
                continue;
            }

            if ($newVal === 0) {
                throw new DisplayException("Kuota {$meta['label']}: Anda tidak diizinkan mengubah {$meta['label']} menjadi Unlimited (0{$meta['unit']}).");
            }

            if ($newVal < $oldVal) {
                continue;
            }

            $baseUsed = $usage[$meta['used_key']];
            $adjusted = $countedInUsage
                ? ($baseUsed - $oldVal + $newVal)
                : ($baseUsed + max(0, $newVal - $oldVal));

            if ($adjusted > $limit) {
                throw new DisplayException(sprintf(
                    'Kuota %s Melebihi Batas: Total %s (%d%s) akan melebihi batas kuota admin Anda (%d%s).',
                    $meta['label'],
                    $meta['label'],
                    $adjusted,
                    $meta['unit'],
                    $limit,
                    $meta['unit']
                ));
            }
        }
    }
}
