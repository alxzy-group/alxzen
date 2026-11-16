<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\View\View;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Pterodactyl\Models\ApiKey;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Services\Acl\Api\AdminAcl;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Api\KeyCreationService;
use Pterodactyl\Http\Requests\Admin\Api\StoreApplicationApiKeyRequest;

class ApiController extends Controller
{
    /**
     * ApiController constructor.
     */
    public function __construct(
        private AlertsMessageBag $alert,
        private KeyCreationService $keyCreationService,
    ) {
    }

    /**
     * Render view showing all of a user's application API keys.
     */
    public function index(Request $request): View
    {
        $query = ApiKey::query()
            ->with('user')
            ->where('key_type', ApiKey::TYPE_APPLICATION);

        // Jika bukan Owner (ID 1), hanya tampilkan API keys milik admin yang sedang login
        if ($request->user()->id !== 1) {
            $query->where('user_id', $request->user()->id);
        }

        return view('admin.api.index', [
            'keys' => $query->latest()->get(),
            'isOwner' => $request->user()->id === 1,
        ]);
    }

    /**
     * Render view allowing an admin to create a new application API key.
     *
     * @throws \ReflectionException
     */
    public function create(Request $request): View
    {
        $resources = AdminAcl::getResourceList();
        sort($resources);

        return view('admin.api.new', [
            'resources' => $resources,
            'permissions' => [
                'r' => AdminAcl::READ,
                'rw' => AdminAcl::READ | AdminAcl::WRITE,
                'n' => AdminAcl::NONE,
            ],
            'isOwner' => $request->user()->id === 1,
        ]);
    }

    /**
     * Store the new key and redirect the user back to the application key listing.
     *
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     */
    public function store(StoreApplicationApiKeyRequest $request): RedirectResponse
    {
        $permissions = $request->getKeyPermissions();

        // Enforce Sub-Admin permission policy jika bukan ID 1:
        // Cuma boleh Write pada servers (untuk create server).
        // Semua resource lainnya WAJIB maksimal READ atau NONE.
        if ($request->user()->id !== 1) {
            foreach ($permissions as $key => &$perm) {
                if ($key !== AdminAcl::COLUMN_IDENTIFIER . AdminAcl::RESOURCE_SERVERS) {
                    if ((int) $perm > AdminAcl::READ) {
                        $perm = AdminAcl::READ;
                    }
                }
            }
        }

        $this->keyCreationService->setKeyType(ApiKey::TYPE_APPLICATION)->handle([
            'memo' => $request->input('memo'),
            'user_id' => $request->user()->id,
        ], $permissions);

        $this->alert->success('A new application API key has been generated for your account.')->flash();

        return redirect()->route('admin.api.index');
    }

    /**
     * Delete an application API key from the database.
     */
    public function delete(Request $request, string $identifier): Response
    {
        $query = ApiKey::query()
            ->where('key_type', ApiKey::TYPE_APPLICATION)
            ->where('identifier', $identifier);

        // Sub-admin hanya bisa me-revoke key miliknya sendiri
        if ($request->user()->id !== 1) {
            $query->where('user_id', $request->user()->id);
        }

        $query->delete();

        return response('', 204);
    }
}
