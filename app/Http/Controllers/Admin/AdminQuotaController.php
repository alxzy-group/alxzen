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
     * Update creation quotas for a specific sub-admin account.
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
            'server_create_limit' => 'nullable|integer|min:0|max:100000000',
            'memory_create_limit' => 'nullable|integer|min:0|max:100000000',
            'disk_create_limit' => 'nullable|integer|min:0|max:100000000',
            'cpu_create_limit' => 'nullable|integer|min:0|max:100000000',
        ]);

        $parseNullableInt = function (string $key) use ($request, $validated): ?int {
            $raw = $request->input($key);
            if ($raw === null || $raw === '') {
                return null;
            }

            return isset($validated[$key]) ? (int) $validated[$key] : null;
        };

        $user->forceFill([
            'server_create_limit' => $parseNullableInt('server_create_limit'),
            'memory_create_limit' => $parseNullableInt('memory_create_limit'),
            'disk_create_limit' => $parseNullableInt('disk_create_limit'),
            'cpu_create_limit' => $parseNullableInt('cpu_create_limit'),
        ])->save();

        Cache::forget('alx:admin_overview:all');

        $this->alert->success("Batas create untuk admin {$user->username} berhasil diperbarui.")->flash();

        return redirect()->back();
    }
}
