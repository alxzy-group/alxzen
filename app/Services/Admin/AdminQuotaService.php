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
     * Return live total created server count and limit for a given admin user.
     *
     * @return array{
     *     servers_used: int,
     *     server_limit: int|null,
     *     remaining: int|null
     * }
     */
    public function getUsage(User $admin): array
    {
        $hasSchema = $this->hasSchemaColumns();

        $query = Server::query();
        if ($hasSchema) {
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

        $used = (int) $query->count();
        $limit = $hasSchema ? $admin->server_create_limit : null;

        return [
            'servers_used' => $used,
            'server_limit' => $limit,
            'remaining' => $limit === null ? null : max(0, $limit - $used),
        ];
    }

    /**
     * Assert that an admin (non-ID-1) has not exceeded their total server creation limit.
     *
     * @throws DisplayException
     */
    public function assertCanCreateServer(User $actor, array $serverData = []): void
    {
        if ($actor->id === 1 || !$this->hasSchemaColumns()) {
            return;
        }

        $usage = $this->getUsage($actor);

        if ($usage['server_limit'] === null) {
            return;
        }

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
}
