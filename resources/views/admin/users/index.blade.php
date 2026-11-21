@extends('layouts.admin')

@section('title')
    User Accounts
@endsection

@section('content-header')
    <h1>User Accounts<small>Manage registered client accounts, administrator permissions, and 2FA compliance.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Users</li>
    </ol>
@endsection

@section('content')
<style>
.alx-avatar {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    border: 1px solid rgba(56, 189, 248, 0.25);
    object-fit: cover;
}
.alx-badge-admin {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 10.5px;
    font-weight: 700;
    background: rgba(245, 158, 11, 0.12);
    color: #fbbf24;
    border: 1px solid rgba(245, 158, 11, 0.28);
    margin-left: 6px;
}
.alx-stat-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 30px;
    height: 22px;
    padding: 0 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    font-variant-numeric: tabular-nums;
    background: rgba(14, 165, 233, 0.12);
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.25);
    text-decoration: none !important;
}
.alx-stat-pill:hover {
    background: rgba(14, 165, 233, 0.22);
    color: #7dd3fc;
}
.alx-toolbar-form {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}
.alx-toolbar-input {
    width: 210px !important;
    height: 34px !important;
    font-size: 13px !important;
}
</style>

<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">
                    <i class="fa fa-users" style="color:#38bdf8;margin-right:8px;"></i>Registered Accounts
                    <span style="margin-left:10px;padding:2px 9px;border-radius:999px;background:rgba(14,165,233,0.12);color:#38bdf8;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;">{{ $users->total() }} Total</span>
                </h3>
                <div class="box-tools">
                    <form action="{{ route('admin.users') }}" method="GET" class="alx-toolbar-form">
                        <input type="text" name="filter[email]" class="form-control alx-toolbar-input" value="{{ request()->input('filter.email') }}" placeholder="Search by email...">
                        <button type="submit" class="btn btn-sm btn-default">
                            <i class="fa fa-search" style="margin-right:4px;"></i> Search
                        </button>
                        <a href="{{ route('admin.users.new') }}" class="btn btn-sm btn-primary">
                            <i class="fa fa-user-plus" style="margin-right:5px;"></i> Create User
                        </a>
                    </form>
                </div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th style="width:52px;">Avatar</th>
                            <th style="width:70px;">ID</th>
                            <th>Email &amp; Role</th>
                            <th>Client Name</th>
                            <th>Username</th>
                            <th class="text-center">2FA</th>
                            <th class="text-center" data-toggle="tooltip" title="Servers owned by this user">Owned</th>
                            <th class="text-center" data-toggle="tooltip" title="Servers accessible as subuser">Subuser</th>
                            <th class="text-right" style="width:105px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($users as $user)
                            <tr>
                                <td>
                                    <img src="https://www.gravatar.com/avatar/{{ md5(strtolower($user->email)) }}?s=64&d=mp" class="alx-avatar" alt="{{ $user->username }}">
                                </td>
                                <td><code>#{{ $user->id }}</code></td>
                                <td>
                                    <a href="{{ route('admin.users.view', $user->id) }}" style="font-weight:700;color:#f4f4f5;">{{ $user->email }}</a>
                                    @if($user->root_admin)
                                        <span class="alx-badge-admin"><i class="fa fa-star"></i> Admin</span>
                                    @endif
                                </td>
                                <td style="color:#d4d4d8;">{{ $user->name_first }} {{ $user->name_last }}</td>
                                <td><span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#e4e4e7;">{{ $user->username }}</span></td>
                                <td class="text-center">
                                    @if($user->use_totp)
                                        <span class="label label-success" title="2FA Enabled" data-toggle="tooltip"><i class="fa fa-lock" style="margin-right:3px;"></i> On</span>
                                    @else
                                        <span class="label label-danger" title="2FA Disabled" data-toggle="tooltip"><i class="fa fa-unlock" style="margin-right:3px;"></i> Off</span>
                                    @endif
                                </td>
                                <td class="text-center">
                                    <a href="{{ route('admin.servers', ['filter[owner_id]' => $user->id]) }}" class="alx-stat-pill">{{ $user->servers_count }}</a>
                                </td>
                                <td class="text-center">
                                    <span class="alx-stat-pill" style="background:rgba(255,255,255,0.06);color:#d4d4d8;border-color:rgba(255,255,255,0.14);">{{ $user->subuser_of_count }}</span>
                                </td>
                                <td class="text-right">
                                    <a href="{{ route('admin.users.view', $user->id) }}" class="btn btn-xs btn-default">
                                        <i class="fa fa-sliders" style="margin-right:4px;"></i> Manage
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="9" class="text-center" style="padding:40px 16px;color:#71717a;">
                                    <i class="fa fa-users" style="font-size:26px;display:block;margin-bottom:8px;color:#3f3f46;"></i>
                                    No users found matching your filter.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            @if($users->hasPages())
                <div class="box-footer with-border">
                    <div class="col-md-12 text-center">{!! $users->appends(['query' => Request::input('query')])->render() !!}</div>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
