<?php

namespace Pterodactyl\Http\Requests\Admin\Api;

use Pterodactyl\Models\ApiKey;
use Pterodactyl\Services\Acl\Api\AdminAcl;
use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class StoreApplicationApiKeyRequest extends AdminFormRequest
{
    /**
     * @throws \ReflectionException
     * @throws \ReflectionException
     */
    public function rules(): array
    {
        $modelRules = ApiKey::getRules();

        return collect(AdminAcl::getResourceList())->mapWithKeys(function ($resource) use ($modelRules) {
            return [AdminAcl::COLUMN_IDENTIFIER . $resource => $modelRules['r_' . $resource]];
        })->merge(['memo' => $modelRules['memo']])->toArray();
    }

    public function attributes(): array
    {
        return [
            'memo' => 'Description',
        ];
    }

    public function getKeyPermissions(): array
    {
        $permissions = collect($this->validated())->filter(function ($value, $key) {
            return substr($key, 0, strlen(AdminAcl::COLUMN_IDENTIFIER)) === AdminAcl::COLUMN_IDENTIFIER;
        })->toArray();

        // Jika bukan ID 1, hanya Servers dan Users yang boleh Write (untuk create server & create user bot).
        // Resource lain WAJIB dibatasi maksimal Read.
        if ($this->user()->id !== 1) {
            foreach ($permissions as $key => &$perm) {
                if (!in_array($key, [
                    AdminAcl::COLUMN_IDENTIFIER . AdminAcl::RESOURCE_SERVERS,
                    AdminAcl::COLUMN_IDENTIFIER . AdminAcl::RESOURCE_USERS,
                ])) {
                    if ((int) $perm > AdminAcl::READ) {
                        $perm = AdminAcl::READ;
                    }
                }
            }
        }

        return $permissions;
    }
}
