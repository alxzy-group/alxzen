<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $request = Illuminate\Http\Request::create('/admin/expiration', 'GET', ['filter' => ['name' => 'test']]);
    $controller = new \Pterodactyl\Http\Controllers\Admin\ExpirationController();
    
    ob_start();
    $response = $controller->index($request);
    ob_end_clean();
    
    echo "Success! Response class: " . get_class($response) . "\n";
} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
} catch (\Error $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
