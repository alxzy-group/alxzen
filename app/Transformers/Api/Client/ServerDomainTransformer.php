<?php

namespace Pterodactyl\Transformers\Api\Client;

use Pterodactyl\Models\ServerDomain;

class ServerDomainTransformer extends BaseClientTransformer
{
    public function getResourceName(): string
    {
        return 'server_domain';
    }

    public function transform(ServerDomain $domain): array
    {
        return [
            'id' => $domain->id,
            'domain' => $domain->domain,
            'status' => $domain->status,
            'verification_cname_name' => $domain->verification_cname_name,
            'verification_cname_target' => $domain->verification_cname_target,
            'created_at' => $domain->created_at ? $domain->created_at->toIso8601String() : null,
        ];
    }
}
