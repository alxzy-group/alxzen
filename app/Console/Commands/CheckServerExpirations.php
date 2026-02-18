<?php

namespace Pterodactyl\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Pterodactyl\Models\Server;
use Pterodactyl\Services\Servers\SuspensionService;

class CheckServerExpirations extends Command
{
    /**
     * Nama command yang akan dipanggil di terminal/cronjob.
     */
    protected $signature = 'ptero:check-expiration';

    /**
     * Deskripsi command.
     */
    protected $description = 'Cek server expired dan suspend otomatis jika lewat tanggal.';

    /**
     * Service untuk melakukan suspend server dengan aman.
     */
    private $suspensionService;

    /**
     * Constructor untuk inject service.
     */
    public function __construct(SuspensionService $suspensionService)
    {
        parent::__construct();
        $this->suspensionService = $suspensionService;
    }

    /**
     * Logic utama dijalankan di sini.
     */
    public function handle()
    {
        $this->info('Memulai pengecekan server expired...');

        // Cari server yang:
        // 1. Punya tanggal expired (tidak null)
        // 2. Tanggal expired-nya KURANG DARI sekarang (sudah lewat)
        // 3. Statusnya BELUM suspended (biar ga suspend ulang server yang udah mati)
        $servers = Server::query()
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', Carbon::now())
            ->where('status', '!=', Server::STATUS_SUSPENDED)
            ->get();

        if ($servers->isEmpty()) {
            $this->info('Tidak ada server expired yang perlu disuspend.');
            return;
        }

        foreach ($servers as $server) {
            try {
                $this->info("Men-suspend server: {$server->name} (ID: {$server->id})");
                
                // Parameter 'suspend' artinya kita melakukan suspend.
                // Kalau mau unsupend, ganti jadi 'unsuspend'.
                $this->suspensionService->toggle($server, 'suspend');
                
                $this->info("Berhasil suspend {$server->name}.");
            } catch (\Exception $e) {
                $this->error("Gagal suspend {$server->name}: " . $e->getMessage());
            }
        }

        $this->info('Pengecekan selesai.');
    }
}