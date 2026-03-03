<?php

namespace Pterodactyl\Console\Commands;

use Carbon\Carbon;
use Pterodactyl\Models\Server;
use Illuminate\Console\Command;
use Pterodactyl\Services\Servers\SuspensionService;

class CheckServerExpirations extends Command
{
    /**
     * Nama command yang dipanggil via terminal atau cronjob.
     * Contoh: php artisan ptero:check-expiration
     */
    protected $signature = 'ptero:check-expiration';

    /**
     * Deskripsi command yang muncul di daftar php artisan.
     */
    protected $description = 'Mengecek server yang melewati batas waktu expires_at dan men-suspend secara otomatis.';

    /**
     * @var \Pterodactyl\Services\Servers\SuspensionService
     */
    protected $suspensionService;

    /**
     * CheckServerExpirations constructor.
     */
    public function __construct(SuspensionService $suspensionService)
    {
        parent::__construct();
        $this->suspensionService = $suspensionService;
    }

    /**
     * Eksekusi logika utama.
     */
    public function handle()
    {
        $this->info('alxzen Protect v3.0: Memulai pemindaian server expired...');

        // 1. Ambil server yang: punya tanggal expire, sudah lewat waktunya, dan belum disuspend.
        $servers = Server::query()
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', Carbon::now())
            ->where('status', '!=', Server::STATUS_SUSPENDED)
            ->get();

        if ($servers->isEmpty()) {
            $this->info('Status: Aman. Tidak ada server expired yang aktif.');
            return;
        }

        $this->warn('Ditemukan ' . $servers->count() . ' server expired. Memproses suspension...');

        foreach ($servers as $server) {
            try {
                $this->line("Memproses Server: {$server->name} (ID: {$server->id})");

                /**
                 * Menggunakan SuspensionService bawaan Pterodactyl.
                 * Ini akan:
                 * 1. Mengubah status server di database menjadi 'suspended'.
                 * 2. Mengirim sinyal ke Wings (Node) untuk mematikan server.
                 * 3. Mengunci akses SFTP dan File Manager bagi user.
                 */
                $this->suspensionService->toggle($server, SuspensionService::ACTION_SUSPEND);

                $this->info("Hasil: Berhasil men-suspend {$server->name}.");

            } catch (\Exception $exception) {
                // Log jika terjadi kegagalan (misal: Node offline)
                $this->error("Gagal memproses {$server->name}: " . $exception->getMessage());
                
                // Fallback: Tetap paksa ubah status di database agar user tidak bisa start server
                $this->warn("Menjalankan fallback database status update...");
                $server->update([
                    'status' => Server::STATUS_SUSPENDED
                ]);
            }
        }

        $this->info('alxzen Expired v2.0: Seluruh proses selesai.');
    }
}
