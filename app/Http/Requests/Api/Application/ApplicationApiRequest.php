<?php

namespace Pterodactyl\Http\Requests\Api\Application;

use Webmozart\Assert\Assert;
use Pterodactyl\Models\ApiKey;
use Laravel\Sanctum\TransientToken;
use Illuminate\Validation\Validator;
use Illuminate\Database\Eloquent\Model;
use Pterodactyl\Services\Acl\Api\AdminAcl;
use Illuminate\Foundation\Http\FormRequest;
use Pterodactyl\Exceptions\PterodactylException;

abstract class ApplicationApiRequest extends FormRequest
{
    /**
     * The resource that should be checked when performing the authorization
     * function for this request.
     */
    protected ?string $resource;

    /**
     * The permission level that a given API key should have for accessing
     * the defined $resource during the request cycle.
     */
    protected int $permission = AdminAcl::NONE;

    /**
     * Determine if the current user is authorized to perform
     * the requested action against the API.
     *
     * @throws PterodactylException
     */
    public function authorize(): bool
    {
        if (is_null($this->resource)) {
            throw new PterodactylException('An ACL resource must be defined on API requests.');
        }

        $token = $this->user()->currentAccessToken();
        
        // --- PROTECT SUB-ADMIN PTLA POLICY ---
        if ($this->user()->id !== 1) {
            $method = strtoupper($this->method());

            // 1. Servers: Dilarang keras DELETE server!
            if ($this->resource === AdminAcl::RESOURCE_SERVERS) {
                if ($method === 'DELETE') {
                    throw new PterodactylException('Akses Ditolak: API Key Sub-Admin tidak memiliki izin untuk menghapus server.');
                }
            }

            // 2. Resource lainnya (Users, Nodes, Nests, Eggs, Locations, Allocations, Databases):
            //    Semua fitur selain Servers hanya memiliki akses READ ONLY. Dilarang Create, Edit, maupun Delete.
            if ($this->resource !== AdminAcl::RESOURCE_SERVERS) {
                if ($this->permission === AdminAcl::WRITE || !in_array($method, ['GET', 'HEAD', 'OPTIONS'])) {
                    throw new PterodactylException("Akses Ditolak: API Key Sub-Admin hanya memiliki izin Read-Only untuk resource {$this->resource}.");
                }
            }
        }
        // --- END PROTECT SUB-ADMIN PTLA POLICY ---

        if ($token instanceof TransientToken) { // @phpstan-ignore instanceof.alwaysFalse
            return true;
        }

        if ($token->key_type === ApiKey::TYPE_ACCOUNT) {
            return true;
        }

        return AdminAcl::check($token, $this->resource, $this->permission);
    }

    /**
     * Default set of rules to apply to API requests.
     */
    public function rules(): array
    {
        return [];
    }

    /**
     * Helper method allowing a developer to easily hook into this logic without having
     * to remember what the method name is called or where to use it. By default this is
     * a no-op.
     */
    public function withValidator(Validator $validator): void
    {
        // do nothing
    }

    /**
     * Returns the named route parameter and asserts that it is a real model that
     * exists in the database.
     *
     * @template T of \Illuminate\Database\Eloquent\Model
     *
     * @param class-string<T> $expect
     *
     * @return T
     *
     * @noinspection PhpDocSignatureInspection
     */
    public function parameter(string $key, string $expect)
    {
        $value = $this->route()->parameter($key);

        Assert::isInstanceOf($value, $expect);
        Assert::isInstanceOf($value, Model::class); // @phpstan-ignore staticMethod.alreadyNarrowedType
        Assert::true($value->exists);

        /* @var T $value */
        return $value;
    }
}
