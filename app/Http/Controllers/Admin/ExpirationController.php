<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Pterodactyl\Models\Server;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Servers\SuspensionService;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class ExpirationController extends Controller
{
    public function index(Request $request)
    {
        $query = Server::query()
            ->select('id', 'name', 'expires_at', 'uuidShort', 'status', 'owner_id', 'node_id', 'allocation_id')
            ->with(['user', 'node', 'allocation']);

        // ANTI-INTIP: Sub-admin (ID != 1) hanya boleh melihat masa aktif server miliknya sendiri
        if ($request->user()->id !== 1) {
            $query->where('servers.owner_id', $request->user()->id);
        }

        if ($request->filled('filter.name')) {
            $lower = mb_strtolower(trim((string) $request->input('filter.name')));
            if ($lower !== '') {
                $query->whereRaw('LOWER(servers.name) LIKE ?', ['%' . $lower . '%']);
            }
        }

        $servers = $query->orderBy('expires_at', 'asc') // Urutkan dari yang mau expired duluan
            ->paginate(config('pterodactyl.paginate.admin.servers', 25));

        return view('admin.expiration.index', compact('servers'));
    }

    public function update(Request $request, $id)
    {
        $server = Server::findOrFail($id);

        // ANTI-INTIP: Sub-admin (ID != 1) dilarang mengubah masa aktif server milik orang lain
        if ($request->user()->id !== 1 && $server->owner_id !== $request->user()->id) {
            throw new AccessDeniedHttpException('Akses ditolak: Anda tidak memiliki izin untuk memperpanjang server milik orang lain.');
        }

        $request->validate([
            'new_date' => 'nullable|date',
            'days' => 'nullable|integer|min:1|max:3650',
        ]);

        if ($request->filled('days')) {
            $days = (int) $request->input('days', 30);
            if ($server->expires_at && $server->expires_at->isFuture()) {
                $newDate = $server->expires_at->copy()->addDays($days);
            } else {
                $newDate = Carbon::now()->addDays($days);
            }
        } elseif ($request->filled('new_date')) {
            $newDate = Carbon::parse($request->input('new_date'))->endOfDay();
        } else {
            return redirect()->back()->with('error', 'Silakan pilih tanggal terlebih dahulu atau klik tombol +30D.');
        }

        // Simpan tanggal baru
        $server->update([
            'expires_at' => $newDate,
        ]);

        /**
         * OTOMATIS UNSUSPEND
         * Jika admin memperpanjang server yang sedang mati (suspended), 
         * kita panggil service untuk menyalakan aksesnya kembali di Wings.
         */
        if ($server->status === Server::STATUS_SUSPENDED) {
            try {
                // Menggunakan class SuspensionService secara formal agar lebih aman dari error
                app(SuspensionService::class)->toggle($server, SuspensionService::ACTION_UNSUSPEND);
            } catch (\Exception $e) {
                // Jika gagal (node offline), kita tetap beri notifikasi sukses perpanjang tapi warning unsuspend
                return redirect()->back()->with('error', "Tanggal diperbarui, tapi gagal unsuspend otomatis: " . $e->getMessage());
            }
        }

        return redirect()->back()->with('success', "Server {$server->name} diperpanjang sampai {$newDate->format('d-m-Y H:i')}.");
    }

    public function deleteAllExpired(Request $request)
    {
        // ANTI-INTIP / PROTEKSI: Hanya Super Admin (ID 1) yang berhak menghapus massal server expired
        if ($request->user()->id !== 1) {
            throw new AccessDeniedHttpException('Akses ditolak: Hanya Super Admin (ID 1) yang diizinkan menghapus server expired.');
        }

        $servers = Server::query()
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', Carbon::now())
            ->limit(5)
            ->get();

        if ($servers->isEmpty()) {
            return redirect()->back()->with('success', 'Tidak ada server expired yang perlu dihapus.');
        }

        $count = 0;
        foreach ($servers as $server) {
            try {
                app(\Pterodactyl\Services\Servers\ServerDeletionService::class)->withForce(false)->handle($server);
                $count++;
            } catch (\Exception $e) {
                \Log::error("Gagal menghapus server expired (ID: {$server->id}): " . $e->getMessage());
            }
        }

        if ($count > 0) {
            return redirect()->back()->with('success', "Berhasil menghapus {$count} server expired. Proses penghapusan berjalan di background.");
        }

        return redirect()->back()->with('error', 'Gagal menghapus server expired. Silakan periksa log sistem.');
    }
}
