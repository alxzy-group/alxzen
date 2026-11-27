<?php

namespace Pterodactyl\Http\Controllers\Admin\Nodes;

use Illuminate\Http\Request;
use Pterodactyl\Models\Node;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Pterodactyl\Http\Controllers\Controller;

class NodeSystemUsageController extends Controller
{
    /**
     * Fetch real-time active resource usage from Wings (/api/system?v=2 & /api/servers/{uuid}).
     */
    public function __invoke(Request $request, Node $node): JsonResponse
    {
        $forceRefresh = $request->boolean('refresh');
        $cacheKey = "admin.node.live_usage.{$node->id}";

        if ($forceRefresh) {
            Cache::forget($cacheKey);
        }

        $payload = Cache::remember($cacheKey, 4, function () use ($node) {
            $servers = $node->servers()->get(['id', 'uuid', 'uuidShort', 'name', 'owner_id', 'memory', 'disk', 'cpu']);

            $baseUrl = $node->getConnectionAddress();
            $token = $node->getDecryptedKey();
            $isProduction = app()->environment('production');

            $responses = Http::pool(function (Pool $pool) use ($servers, $baseUrl, $token, $isProduction) {
                $requests = [];

                $sysReq = $pool->as('system')->withToken($token)->acceptJson()->timeout(5);
                if (!$isProduction) {
                    $sysReq = $sysReq->withoutVerifying();
                }
                $requests[] = $sysReq->get("$baseUrl/api/system?v=2");

                foreach ($servers as $server) {
                    $req = $pool->as($server->uuid)->withToken($token)->acceptJson()->timeout(5);
                    if (!$isProduction) {
                        $req = $req->withoutVerifying();
                    }
                    $requests[] = $req->get("$baseUrl/api/servers/{$server->uuid}");
                }

                return $requests;
            });

            $reachable = false;
            $hostInfo = [
                'memory_bytes' => 0,
                'cpu_threads' => 0,
                'docker_version' => null,
                'containers' => [
                    'total' => 0,
                    'running' => 0,
                    'paused' => 0,
                    'stopped' => 0,
                ],
            ];

            $sysResponse = $responses['system'] ?? null;
            if ($sysResponse instanceof Response && $sysResponse->successful()) {
                $reachable = true;
                $sys = $sysResponse->json() ?: [];
                $sysHardware = is_array($sys['system'] ?? null) ? $sys['system'] : $sys;
                $hostInfo = [
                    'memory_bytes' => (int) ($sysHardware['memory_bytes'] ?? $sys['memory_bytes'] ?? 0),
                    'cpu_threads' => (int) ($sysHardware['cpu_threads'] ?? $sysHardware['cpu_count'] ?? $sys['cpu_threads'] ?? $sys['cpu_count'] ?? 0),
                    'docker_version' => $sys['docker']['version'] ?? null,
                    'containers' => [
                        'total' => (int) ($sys['docker']['containers']['total'] ?? 0),
                        'running' => (int) ($sys['docker']['containers']['running'] ?? 0),
                        'paused' => (int) ($sys['docker']['containers']['paused'] ?? 0),
                        'stopped' => (int) ($sys['docker']['containers']['stopped'] ?? 0),
                    ],
                ];
            }

            $cpuActive = 0.0;
            $memoryActive = 0;
            $diskActive = 0;
            $rxBytes = 0;
            $txBytes = 0;

            $runningCount = 0;
            $startingCount = 0;
            $offlineCount = 0;
            $serverItems = [];

            foreach ($servers as $server) {
                $resp = $responses[$server->uuid] ?? null;
                $state = 'offline';
                $cpu = 0.0;
                $mem = 0;
                $disk = 0;

                if ($resp instanceof Response && $resp->successful()) {
                    $reachable = true;
                    $data = $resp->json() ?: [];
                    $state = strtolower((string) ($data['state'] ?? 'offline'));
                    $util = $data['utilization'] ?? [];

                    $cpu = (float) ($util['cpu_absolute'] ?? 0);
                    $mem = (int) ($util['memory_bytes'] ?? 0);
                    $disk = (int) ($util['disk_bytes'] ?? 0);

                    $cpuActive += $cpu;
                    $memoryActive += $mem;
                    $diskActive += $disk;
                    $rxBytes += (int) ($util['network']['rx_bytes'] ?? 0);
                    $txBytes += (int) ($util['network']['tx_bytes'] ?? 0);
                }

                if ($state === 'running') {
                    $runningCount++;
                } elseif (in_array($state, ['starting', 'stopping'], true)) {
                    $startingCount++;
                } else {
                    $offlineCount++;
                }

                $serverItems[] = [
                    'id' => $server->id,
                    'name' => $server->name,
                    'uuidShort' => $server->uuidShort,
                    'owner_id' => $server->owner_id,
                    'state' => $state,
                    'cpu' => round($cpu, 1),
                    'memory_bytes' => $mem,
                    'memory_limit_mb' => (int) $server->memory,
                    'disk_bytes' => $disk,
                    'disk_limit_mb' => (int) $server->disk,
                ];
            }

            usort($serverItems, function (array $a, array $b) {
                if ($b['memory_bytes'] !== $a['memory_bytes']) {
                    return $b['memory_bytes'] <=> $a['memory_bytes'];
                }
                return $b['disk_bytes'] <=> $a['disk_bytes'];
            });

            return [
                'reachable' => $reachable,
                'real' => [
                    'cpu_percent' => round($cpuActive, 1),
                    'memory_bytes' => $memoryActive,
                    'disk_bytes' => $diskActive,
                    'network_rx_bytes' => $rxBytes,
                    'network_tx_bytes' => $txBytes,
                ],
                'allocated' => [
                    'memory_mb' => (int) $servers->sum('memory'),
                    'disk_mb' => (int) $servers->sum('disk'),
                    'node_memory_mb' => (int) $node->memory,
                    'node_disk_mb' => (int) $node->disk,
                ],
                'counts' => [
                    'total' => $servers->count(),
                    'running' => $runningCount,
                    'starting' => $startingCount,
                    'offline' => $offlineCount,
                ],
                'host' => $hostInfo,
                'all_servers' => $serverItems,
                'updated_at' => now()->toIso8601String(),
            ];
        });

        $userId = (int) $request->user()->id;
        $filteredServers = collect($payload['all_servers'])
            ->when($userId !== 1, fn ($col) => $col->where('owner_id', $userId))
            ->take(10)
            ->map(function (array $item) {
                unset($item['owner_id']);
                $item['url'] = route('admin.servers.view', $item['id'], false);
                return $item;
            })
            ->values()
            ->all();

        return new JsonResponse([
            'reachable' => $payload['reachable'],
            'real' => $payload['real'],
            'allocated' => $payload['allocated'],
            'counts' => $payload['counts'],
            'host' => $payload['host'],
            'servers' => $filteredServers,
            'updated_at' => $payload['updated_at'],
        ]);
    }
}
