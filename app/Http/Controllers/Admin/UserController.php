<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\View\View;
use Illuminate\Http\Request;
use Pterodactyl\Models\User;
use Pterodactyl\Models\Model;
use Illuminate\Support\Collection;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Spatie\QueryBuilder\QueryBuilder;
use Illuminate\View\Factory as ViewFactory;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Http\Controllers\Controller;
use Illuminate\Contracts\Translation\Translator;
use Pterodactyl\Services\Users\UserUpdateService;
use Pterodactyl\Traits\Helpers\AvailableLanguages;
use Pterodactyl\Services\Users\UserCreationService;
use Pterodactyl\Services\Users\UserDeletionService;
use Pterodactyl\Http\Requests\Admin\UserFormRequest;
use Pterodactyl\Http\Requests\Admin\NewUserFormRequest;
use Pterodactyl\Contracts\Repository\UserRepositoryInterface;

class UserController extends Controller
{
    use AvailableLanguages;

    /**
     * UserController constructor.
     */
    public function __construct(
        protected AlertsMessageBag $alert,
        protected UserCreationService $creationService,
        protected UserDeletionService $deletionService,
        protected Translator $translator,
        protected UserUpdateService $updateService,
        protected UserRepositoryInterface $repository,
        protected ViewFactory $view,
    ) {
    }

    /**
     * Display user index page.
     */
    public function index(Request $request): View
    {
        $users = QueryBuilder::for(
            User::query()->select('users.*')
                ->selectRaw('COUNT(DISTINCT(subusers.id)) as subuser_of_count')
                ->selectRaw('COUNT(DISTINCT(servers.id)) as servers_count')
                ->leftJoin('subusers', 'subusers.user_id', '=', 'users.id')
                ->leftJoin('servers', 'servers.owner_id', '=', 'users.id')
                ->groupBy('users.id')
        )
            ->allowedFilters(['username', 'email', 'uuid'])
            ->defaultSort('-root_admin')
            ->allowedSorts(['id', 'uuid'])
            ->paginate(50);

        return view('admin.users.index', ['users' => $users]);
    }

    /**
     * Display new user page.
     */
    public function create(): View
    {
        return view('admin.users.new', [
            'languages' => $this->getAvailableLanguages(true),
        ]);
    }

    /**
     * Display user view page.
     */
    public function view(User $user): View
    {
        $quotaService = app(\Pterodactyl\Services\Admin\AdminQuotaService::class);

        return view('admin.users.view', [
            'user' => $user,
            'languages' => $this->getAvailableLanguages(true),
            'quotaUsage' => $user->root_admin && $user->id !== 1 ? $quotaService->getUsage($user) : null,
            'quotaSchemaReady' => $quotaService->hasSchemaColumns(),
        ]);
    }

    /**
     * Delete a user from the system.
     * MODIFIED: Menjamin ID 1 aman & mencegah kudeta sesama admin.
     */
    public function delete(Request $request, User $user): RedirectResponse
    {
        // 1. Gak ada yang boleh hapus ID 1. Titik.
        if ($user->id === 1) {
            $this->alert->danger('Aksi Ilegal: Akun Owner Utama tidak dapat dihapus!')->flash();
            return redirect()->back();
        }

        // 2. Admin lain (ID != 1) dilarang hapus sesama Admin.
        // Ini biar mereka gak bisa bersih-bersih admin lain buat kuasai panel.
        if ($request->user()->id !== 1 && $user->root_admin) {
            $this->alert->danger('Akses Ditolak: Anda tidak memiliki izin untuk menghapus sesama Admin.')->flash();
            return redirect()->back();
        }

        if ($request->user()->is($user)) {
            throw new DisplayException(__('admin/user.exceptions.delete_self'));
        }

        $this->deletionService->handle($user);
        $this->alert->success('User berhasil dihapus dari sistem.')->flash();

        return redirect()->route('admin.users');
    }

    /**
     * Create a user.
     * IZINKAN: Supaya bot create panel (API) tetap jalan.
     */
    public function store(NewUserFormRequest $request): RedirectResponse
    {
        $data = $request->normalize();
        
        // Hanya Super Admin (ID 1) yang berhak membuat akun Root Admin baru
        if ($request->user()->id !== 1) {
            $data['root_admin'] = false;
            unset($data['server_create_limit']);
        }

        $user = $this->creationService->handle($data);
        $this->alert->success($this->translator->get('admin/user.notices.account_created'))->flash();

        return redirect()->route('admin.users.view', $user->id);
    }

    /**
     * Update a user on the system.
     * PROTECTED: Melindungi ID 1 dan mencegah kenaikan pangkat ilegal.
     */
    public function update(UserFormRequest $request, User $user): RedirectResponse
    {
        // 1. Hanya ID 1 yang boleh edit data ID 1.
        if ($user->id === 1 && $request->user()->id !== 1) {
            $this->alert->danger('Keamanan: Anda tidak diizinkan mengubah data Super Admin!')->flash();
            return redirect()->back();
        }

        // 2. Sub-admin tidak boleh mengubah akun Administrator lain.
        if ($request->user()->id !== 1 && $user->root_admin && $user->id !== $request->user()->id) {
            $this->alert->danger('Keamanan: Anda tidak diizinkan mengubah data sesama Administrator!')->flash();
            return redirect()->back();
        }

        // 3. Admin lain (ID != 1) dilarang membuat Admin baru atau mengubah status/kuota root_admin.
        $data = $request->normalize();
        if ($request->user()->id !== 1) {
            if (!empty($data['root_admin']) && !$user->root_admin) {
                $this->alert->danger('Aksi Ilegal: Hanya Owner Utama yang bisa mengangkat Admin baru!')->flash();
                return redirect()->back();
            }
            $data['root_admin'] = $user->root_admin;
            unset($data['server_create_limit']);
        } elseif (!app(\Pterodactyl\Services\Admin\AdminQuotaService::class)->hasSchemaColumns()) {
            unset($data['server_create_limit']);
        } else {
            if (array_key_exists('server_create_limit', $data) && ($data['server_create_limit'] === '' || $data['server_create_limit'] === null)) {
                $data['server_create_limit'] = null;
            }
        }

        $this->updateService
            ->setUserLevel(User::USER_LEVEL_ADMIN)
            ->handle($user, $data);

        $this->alert->success(trans('admin/user.notices.account_updated'))->flash();

        return redirect()->route('admin.users.view', $user->id);
    }

    /**
     * Get a JSON response of users on the system.
     */
    public function json(Request $request): Model|Collection
    {
        $users = QueryBuilder::for(User::query())->allowedFilters(['email'])->paginate(25);

        if ($request->query('user_id')) {
            $user = User::query()->findOrFail($request->input('user_id'));
            $user->md5 = md5(strtolower($user->email));

            return $user;
        }

        return $users->map(function ($item) {
            $item->md5 = md5(strtolower($item->email));
            return $item;
        });
    }
}
