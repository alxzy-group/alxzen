<?php
require 'vendor/autoload.php';
 = require_once 'bootstrap/app.php';
 = ->make(Illuminate\Contracts\Console\Kernel::class);
->bootstrap();
\ = App\Models\Server::find(12);
echo "Status: " . \->status . "\n";
echo "Expires At: " . \->expires_at . "\n";
