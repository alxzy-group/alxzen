<?php

namespace Pterodactyl\Http\Controllers\Api\Application\Servers;

use Pterodactyl\Models\Server;
use Pterodactyl\Transformers\Api\Application\ServerTransformer;
use Pterodactyl\Http\Controllers\Api\Application\ApplicationApiController;
use Pterodactyl\Http\Requests\Api\Application\Servers\GetExternalServerRequest;

class ExternalServerController extends ApplicationApiController
{
    /**
     * Retrieve a specific server from the database using its external ID.
     */
    public function index(GetExternalServerRequest $request, string $external_id): array
    {
        $query = Server::query()->where('external_id', $external_id);
        if ($request->user()->id !== 1) {
            $query->where('owner_id', $request->user()->id);
        }
        $server = $query->firstOrFail();

        return $this->fractal->item($server)
            ->transformWith($this->getTransformer(ServerTransformer::class))
            ->toArray();
    }
}
