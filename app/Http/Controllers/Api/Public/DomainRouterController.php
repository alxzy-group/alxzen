<?php

namespace Pterodactyl\Http\Controllers\Api\Public;

use Illuminate\Http\Request;
use Pterodactyl\Models\ServerDomain;
use Pterodactyl\Http\Controllers\Controller;

class DomainRouterController extends Controller
{
    public function resolve(Request $request)
    {
        // KEAMANAN: Cegah unauthenticated info disclosure (UUID, Node ID, internal IP & port).
        // Wajibkan secret key jika dikonfigurasi, atau batasi akses hanya dari localhost/loopback proxy.
        $routerKey = config('app.domain_router_key', env('DOMAIN_ROUTER_KEY'));
        $providedKey = $request->header('X-Router-Key') ?? $request->bearerToken() ?? $request->query('key');

        if (!empty($routerKey)) {
            if (!hash_equals((string) $routerKey, (string) $providedKey)) {
                return response()->json(['error' => 'Unauthorized: Invalid or missing router key.'], 401);
            }
        } else {
            $clientIp = $request->ip();
            if (!in_array($clientIp, ['127.0.0.1', '::1', 'localhost'], true)) {
                return response()->json(['error' => 'Unauthorized: Akses dibatasi untuk local reverse proxy atau membutuhkan DOMAIN_ROUTER_KEY.'], 403);
            }
        }

        $domainName = $request->input('domain');
        if (!$domainName) {
            return response()->json(['error' => 'Domain is required'], 400);
        }

        $serverDomain = ServerDomain::where('domain', strtolower($domainName))
            ->where('status', 'active')
            ->first();

        if (!$serverDomain) {
            return response()->json(['error' => 'Domain not found or not active'], 404);
        }

        $server = $serverDomain->server;
        if (!$server || !$server->allocation) {
            return response()->json(['error' => 'Server or allocation not found'], 404);
        }

        if ($server->isSuspended()) {
            return response()->json(['error' => 'Server is suspended'], 403);
        }

        $allocation = $server->allocation;
        // In local node environments, usually the IP is 0.0.0.0 or the node's local IP
        // Reverse proxies on the node can route to 127.0.0.1 or the allocation IP
        $ip = $allocation->ip === '0.0.0.0' ? '127.0.0.1' : $allocation->ip;

        return response()->json([
            'server_uuid' => $server->uuid,
            'node_id' => $server->node_id,
            'ip' => $ip,
            'port' => $allocation->port,
            'target' => $ip . ':' . $allocation->port
        ]);
    }
}
