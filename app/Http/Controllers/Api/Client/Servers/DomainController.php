<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Http\Request;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\ServerDomain;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Pterodactyl\Transformers\Api\Client\ServerDomainTransformer;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;

class DomainController extends ClientApiController
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Validate that the user is the server owner or super admin (ID 1).
     */
    protected function validateOwner(Request $request, Server $server): void
    {
        if ($request->user()->id !== 1 && $server->owner_id !== $request->user()->id) {
            throw new AccessDeniedHttpException('Akses ditolak: Hanya pemilik server yang diizinkan mengelola subdomain.');
        }
    }

    public function index(Request $request, Server $server): array
    {
        $domains = $server->domains()->get();

        return $this->fractal->collection($domains)
            ->transformWith($this->getTransformer(ServerDomainTransformer::class))
            ->toArray();
    }

    public function store(Request $request, Server $server): array|JsonResponse
    {
        $this->validateOwner($request, $server);

        $request->validate([
            'domain' => 'required|string|min:3|max:63|regex:/^[a-zA-Z0-9-]+$/'
        ]);

        $prefix = strtolower($request->input('domain'));
        $baseDomain = config('app.subdomain_base');

        if (!$baseDomain) {
            return response()->json(['errors' => [['detail' => 'Subdomain Manager is not configured by the administrator.']]], 503);
        }

        if ($server->domain_limit <= 0) {
            return response()->json(['errors' => [['detail' => 'Subdomains cannot be created for this server as the domain limit is 0.']]], 422);
        }

        if ($server->domains()->count() >= $server->domain_limit) {
            return response()->json(['errors' => [['detail' => 'You have reached the maximum number of subdomains allowed for this server.']]], 422);
        }

        $fullDomain = $prefix . '.' . ltrim($baseDomain, '.');

        // Check if the exact subdomain is already taken across all servers
        $exists = ServerDomain::where('domain', $fullDomain)->exists();
        if ($exists) {
            return response()->json(['errors' => [['detail' => 'This subdomain is already taken.']]], 422);
        }

        // Subdomains are active immediately, no Cloudflare API needed
        $domain = $server->domains()->create([
            'domain'                    => $fullDomain,
            'status'                    => 'active',
            'cf_hostname_id'            => null,
            'verification_cname_name'   => null,
            'verification_cname_target' => null,
        ]);

        return $this->fractal->item($domain)
            ->transformWith($this->getTransformer(ServerDomainTransformer::class))
            ->toArray();
    }

    public function verify(Request $request, Server $server, ServerDomain $domain): array
    {
        $this->validateOwner($request, $server);

        if ($domain->server_id !== $server->id) {
            throw new NotFoundHttpException('Domain tidak ditemukan untuk server ini.');
        }

        // For subdomains, they are always active.
        if ($domain->status !== 'active') {
            $domain->update(['status' => 'active']);
        }

        return $this->fractal->item($domain)
            ->transformWith($this->getTransformer(ServerDomainTransformer::class))
            ->toArray();
    }

    public function delete(Request $request, Server $server, ServerDomain $domain): JsonResponse
    {
        $this->validateOwner($request, $server);

        if ($domain->server_id !== $server->id) {
            throw new NotFoundHttpException('Domain tidak ditemukan untuk server ini.');
        }

        $domain->delete();

        return response()->json([], 204);
    }
}
