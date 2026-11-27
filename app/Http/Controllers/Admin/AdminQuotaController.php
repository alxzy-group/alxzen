<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Pterodactyl\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cache;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Admin\AdminQuotaService;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class AdminQuotaController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private AdminQuotaService $quotaService,
    ) {
    }

    /**
     * Update total server creation limit for a specific sub-admin account.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        if (!$request->user() || $request->user()->id !== 1) {
            throw new AccessDeniedHttpException('Akses Ditolak: Hanya Super Admin (ID 1) yang boleh mengatur batas create admin.');
        }

        if (!$this->quotaService->hasSchemaColumns()) {
            $this->alert->danger('Kolom database kuota belum dimigrasi. Jalankan: php artisan migrate --force di VPS terlebih dahulu.')->flash();

            return redirect()->back();
        }

        if ($user->id === 1) {
            $this->alert->danger('Akun Owner Utama (ID 1) tidak memiliki batasan kuota.')->flash();

            return redirect()->back();
        }

        $validated = $request->validate([
            'server_create_limit' => 'nullable|integer|min:0|max:1000000',
        ]);

        $raw = $request->input('server_create_limit');
        $limit = ($raw === null || $raw === '') ? null : (int) $validated['server_create_limit'];

        $user->forceFill([
            'server_create_limit' => $limit,
        ])->save();

        Cache::forget('alx:admin_overview:all');

        $label = $limit === null ? 'Unlimited (∞)' : "{$limit} server";
        $this->alert->success("Batas create server untuk admin {$user->username} diatur ke {$label}.")->flash();

        return redirect()->back();
    }
}
