@extends('layouts.admin')

@section('title')
    List Users
@endsection

@section('content-header')
    <h1>Users<small>All registered users on the system.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Users</li>
    </ol>
@endsection

@section('content')
<style>
.alx-card {
    background: #171717;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    box-shadow: none;
    overflow: hidden;
}
.alx-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 12px;
    padding: 16px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: #171717;
}
.alx-card-title {
    font-size: 15px; font-weight: 500; color: #e5e5e5;
    display: flex; align-items: center; gap: 8px; margin: 0;
}
.alx-card-title i { color: #a3a3a3; font-size: 14px; }
.alx-search-group { display: flex; gap: 8px; align-items: center; flex-wrap: nowrap; }
.alx-search-group .form-control {
    background: #000000 !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; border-radius: 12px !important; color: #e5e5e5 !important;
    font-size: 13px; height: 34px; padding: 0 12px; width: 200px; transition: border-color 0.2s; box-shadow: none !important;
}
.alx-search-group .form-control:focus {
    border-color: #0ea5e9 !important; box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2) !important; outline: none;
}
.alx-search-group .form-control::placeholder { color: #737373; }
.alx-btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px;
    border-radius: 8px; font-size: 13px; font-weight: 500; border: 1px solid transparent; cursor: pointer;
    transition: all 0.2s; text-decoration: none; box-shadow: none; text-transform: none;
}
.alx-btn-search { background: #262626; color: #e5e5e5; border: 1px solid rgba(255, 255, 255, 0.15); }
.alx-btn-search:hover { background: #404040; }
.alx-btn-create { background: #0ea5e9; color: #fff; border-radius: 12px; }
.alx-btn-create:hover { background: #0284c7; }
.alx-table { width: 100%; border-collapse: collapse; }
.alx-table thead tr { background: #171717; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
.alx-table thead th {
    padding: 12px 16px; font-size: 12px; font-weight: 500;
    text-transform: capitalize; color: #a3a3a3; text-align: left;
}
.alx-table tbody tr { border-bottom: 1px solid rgba(255, 255, 255, 0.04); transition: background 0.15s; }
.alx-table tbody tr:last-child { border-bottom: none; }
.alx-table tbody tr:hover { background: rgba(255, 255, 255, 0.02); }
.alx-table td { padding: 12px 16px; font-size: 13px; color: #e5e5e5; vertical-align: middle; }
.alx-table td a { color: #a3a3a3; text-decoration: none; font-weight: 500; transition: color 0.15s; }
.alx-table td a:hover { color: #e5e5e5; }
.alx-table td code {
    background: #0a0a0a; border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 4px; padding: 2px 6px; font-size: 12px; color: #a3a3a3;
}
.alx-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.15);
    object-fit: cover;
}
.alx-badge-admin {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;
    background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.2);
    margin-left: 6px;
}
.alx-stat-pill {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 28px; height: 22px; padding: 0 8px;
    border-radius: 4px; font-size: 12px; font-weight: 500;
    background: rgba(255, 255, 255, 0.1); color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.2);
}
.alx-stat-pill:hover { background: rgba(255, 255, 255, 0.2); color: #ffffff; }
.alx-2fa-on { color: #10b981; }
.alx-2fa-off { color: #ef4444; }
.alx-pagination { display: flex; justify-content: center; padding: 16px 24px; border-top: 1px solid rgba(255, 255, 255, 0.08); }
</style>

<div class="row">
    <div class="col-xs-12">
        <div class="alx-card">
            <div class="alx-card-header">
                <h3 class="alx-card-title"><i class="fa fa-users"></i> User List</h3>
                <form action="{{ route('admin.users') }}" method="GET">
                    <div class="alx-search-group">
                        <input type="text" name="filter[email]" class="form-control" value="{{ request()->input('filter.email') }}" placeholder="Search by email...">
                        <button type="submit" class="alx-btn alx-btn-search"><i class="fa fa-search"></i></button>
                        <a href="{{ route('admin.users.new') }}" class="alx-btn alx-btn-create"><i class="fa fa-plus"></i> Create New</a>
                    </div>
                </form>
            </div>
            <div style="overflow-x: auto;">
                <table class="alx-table">
                    <thead>
                        <tr>
                            <th>Avatar</th>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Name</th>
                            <th>Username</th>
                            <th style="text-align:center">2FA</th>
                            <th style="text-align:center" data-toggle="tooltip" title="Servers owned by this user">Servers</th>
                            <th style="text-align:center" data-toggle="tooltip" title="Servers accessible as subuser">Access</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($users as $user)
                            <tr>
                                <td style="width:50px">
                                    <img src="https://www.gravatar.com/avatar/{{ md5(strtolower($user->email)) }}?s=64&d=mp" class="alx-avatar" alt="{{ $user->username }}">
                                </td>
                                <td><code>{{ $user->id }}</code></td>
                                <td>
                                    <a href="{{ route('admin.users.view', $user->id) }}">{{ $user->email }}</a>
                                    @if($user->root_admin)
                                        <span class="alx-badge-admin"><i class="fa fa-star"></i> Admin</span>
                                    @endif
                                </td>
                                <td style="color:#e2e8f0">{{ $user->name_last }}, {{ $user->name_first }}</td>
                                <td>{{ $user->username }}</td>
                                <td style="text-align:center">
                                    @if($user->use_totp)
                                        <i class="fa fa-lock alx-2fa-on" title="2FA Enabled" data-toggle="tooltip"></i>
                                    @else
                                        <i class="fa fa-unlock alx-2fa-off" title="2FA Disabled" data-toggle="tooltip"></i>
                                    @endif
                                </td>
                                <td style="text-align:center">
                                    <a href="{{ route('admin.servers', ['filter[owner_id]' => $user->id]) }}" class="alx-stat-pill">{{ $user->servers_count }}</a>
                                </td>
                                <td style="text-align:center">
                                    <span class="alx-stat-pill">{{ $user->subuser_of_count }}</span>
                                </td>
                            </tr>
                        @empty
                            <tr><td colspan="8" style="text-align:center;padding:60px;color:#475569"><i class="fa fa-users" style="font-size:36px;display:block;margin-bottom:10px;color:#334155"></i>No users found.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            @if($users->hasPages())
                <div class="alx-pagination">
                    {!! $users->appends(['query' => Request::input('query')])->render() !!}
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
