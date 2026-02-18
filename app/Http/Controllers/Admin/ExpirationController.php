<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Pterodactyl\Models\Server;
use Pterodactyl\Http\Controllers\Controller;

class ExpirationController extends Controller
{
    public function index()
    {
        // Ambil data server
        $servers = Server::query()
            ->select('id', 'name', 'expires_at', 'uuidShort', 'status', 'owner_id', 'node_id', 'allocation_id') // Select kolom yg dibutuhkan view
            ->with(['user', 'node', 'allocation']) // Eager load biar ga error di view saat panggil user/node
            ->paginate(50);

        return view('admin.expiration.index', compact('servers'));
    }

    public function update(Request $request, Server $server)
    {
        // Validasi input hari
        $days = (int) $request->input('days', 30);

        // Tentukan tanggal baru
        // Jika sudah ada expired date, tambah dari tanggal itu.
        // Jika belum (unlimited), tambah dari hari ini.
        if ($server->expires_at) {
            $newDate = $server->expires_at->copy()->addDays($days);
        } else {
            $newDate = Carbon::now()->addDays($days);
        }

        // Simpan ke database
        $server->forceFill([
            'expires_at' => $newDate,
        ])->save();

        return redirect()->back()->with('success', 'Waktu server berhasil diperpanjang ' . $days . ' hari.');
    }
}