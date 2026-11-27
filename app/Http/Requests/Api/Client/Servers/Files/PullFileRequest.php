<?php

namespace Pterodactyl\Http\Requests\Api\Client\Servers\Files;

use Pterodactyl\Models\Permission;
use Pterodactyl\Contracts\Http\ClientPermissionsRequest;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;

class PullFileRequest extends ClientApiRequest implements ClientPermissionsRequest
{
    public function permission(): string
    {
        return Permission::ACTION_FILE_CREATE;
    }

    public function rules(): array
    {
        return [
            'url' => [
                'required',
                'string',
                'url',
                function (string $attribute, mixed $value, \Closure $fail) {
                    $scheme = strtolower((string) parse_url((string) $value, PHP_URL_SCHEME));
                    if (!in_array($scheme, ['http', 'https'], true)) {
                        $fail('Only http:// and https:// URLs are allowed.');
                        return;
                    }

                    $host = strtolower((string) parse_url((string) $value, PHP_URL_HOST));
                    $host = trim($host, '[]');
                    if (
                        $host === ''
                        || $host === 'localhost'
                        || $host === '169.254.169.254'
                        || str_ends_with($host, '.local')
                        || str_ends_with($host, '.internal')
                    ) {
                        $fail('Remote pull requests cannot target internal or loopback addresses.');
                        return;
                    }

                    if (filter_var($host, FILTER_VALIDATE_IP)) {
                        if (!filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                            $fail('Remote pull requests cannot target private or reserved IP ranges.');
                        }
                    }
                },
            ],
            'directory' => 'nullable|string',
            'filename' => 'nullable|string',
            'use_header' => 'boolean',
            'foreground' => 'boolean',
        ];
    }
}
