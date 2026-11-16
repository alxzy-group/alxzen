<?php

namespace Pterodactyl\Http\Middleware\Api\Client\Server;

use Illuminate\Http\Request;
use Pterodactyl\Models\Server;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Pterodactyl\Exceptions\Http\Server\ServerStateConflictException;

class AuthenticateServerAccess
{
    /**
     * Routes that this middleware should not apply to if the user is an admin.
     */
    protected array $except = [
        'api:client:server.ws',
    ];

    /**
     * AuthenticateServerAccess constructor.
     */
    public function __construct()
    {
    }

    /**
     * Authenticate that this server exists and is not suspended or marked as installing.
     */
    public function handle(Request $request, \Closure $next): mixed
    {
        /** @var \Pterodactyl\Models\User $user */
        $user = $request->user();
        $server = $request->route()->parameter('server');

        if (!$server instanceof Server) {
            throw new NotFoundHttpException(trans('exceptions.api.resource_not_found'));
        }

        // ANTI-INTIP: Hanya Super Admin (ID 1) atau Server Owner yang memiliki akses penuh langsung.
        // Sub-admin (ID != 1) HANYA diizinkan mengakses server miliknya sendiri atau jika menjadi subuser resmi!
        if ($user->id !== 1 && $user->id !== $server->owner_id) {
            // Check for subuser status.
            if (!$server->subusers->contains('user_id', $user->id)) {
                throw new NotFoundHttpException(trans('exceptions.api.resource_not_found'));
            }
        }

        try {
            $server->validateCurrentState();
        } catch (ServerStateConflictException $exception) {
            // Still allow users to get information about their server if it is installing or
            // being transferred.
            if (!$request->routeIs('api:client:server.view')) {
                if (($server->isSuspended() || $server->node->isUnderMaintenance()) && !$request->routeIs('api:client:server.resources')) {
                    throw $exception;
                }
                if ($user->id !== 1 || !$request->routeIs($this->except)) {
                    throw $exception;
                }
            }
        }

        $request->attributes->set('server', $server);

        return $next($request);
    }
}
