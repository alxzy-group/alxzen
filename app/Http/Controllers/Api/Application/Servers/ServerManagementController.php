<?php

namespace Pterodactyl\Http\Controllers\Api\Application\Servers;

use Illuminate\Http\Response;
use Pterodactyl\Models\Server;
use Pterodactyl\Services\Servers\SuspensionService;
use Pterodactyl\Services\Servers\ReinstallServerService;
use Pterodactyl\Http\Requests\Api\Application\Servers\ServerWriteRequest;
use Pterodactyl\Http\Controllers\Api\Application\ApplicationApiController;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class ServerManagementController extends ApplicationApiController
{
    /**
     * ServerManagementController constructor.
     */
    public function __construct(
        private ReinstallServerService $reinstallServerService,
        private SuspensionService $suspensionService,
    ) {
        parent::__construct();
    }

    /**
     * Suspend a server on the Panel.
     *
     * @throws \Throwable
     */
    public function suspend(ServerWriteRequest $request, Server $server): Response
    {
        if ($request->user()->id !== 1) {
            throw new AccessDeniedHttpException('Akses ditolak: Fitur suspend hanya diizinkan untuk Super Admin (ID 1).');
        }

        $this->suspensionService->toggle($server);

        return $this->returnNoContent();
    }

    /**
     * Unsuspend a server on the Panel.
     *
     * @throws \Throwable
     */
    public function unsuspend(ServerWriteRequest $request, Server $server): Response
    {
        if ($request->user()->id !== 1) {
            throw new AccessDeniedHttpException('Akses ditolak: Fitur unsuspend hanya diizinkan untuk Super Admin (ID 1).');
        }

        $this->suspensionService->toggle($server, SuspensionService::ACTION_UNSUSPEND);

        return $this->returnNoContent();
    }

    /**
     * Mark a server as needing to be reinstalled.
     *
     * @throws \Pterodactyl\Exceptions\DisplayException
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     * @throws \Pterodactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function reinstall(ServerWriteRequest $request, Server $server): Response
    {
        if ($request->user()->id !== 1) {
            throw new AccessDeniedHttpException('Akses ditolak: Fitur reinstall hanya diizinkan untuk Super Admin (ID 1).');
        }

        $this->reinstallServerService->handle($server);

        return $this->returnNoContent();
    }

    /**
     * Extend server expiration on the Panel.
     *
     * @throws \Throwable
     */
    public function extend(ServerWriteRequest $request, Server $server): Response
    {
        if ($request->user()->id !== 1 && $server->owner_id !== $request->user()->id) {
            throw new AccessDeniedHttpException('Akses ditolak: Anda tidak diizinkan memperpanjang masa aktif server milik pengguna lain.');
        }

        $days = min(max((int) $request->input('days', 30), 1), 3650);

        if ($server->expires_at && $server->expires_at->isFuture()) {
            $newDate = $server->expires_at->addDays($days);
        } else {
            $newDate = \Carbon\Carbon::now()->addDays($days);
        }

        $server->update([
            'expires_at' => $newDate,
        ]);

        return $this->returnNoContent();
    }
}
