@extends('layouts.admin')

@section('title')
    Expiration Manager
@endsection

@section('content-header')
    <h1>Expiration Manager<small>Manage server expiration dates.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Expiration Manager</li>
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
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
    padding: 16px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: #171717;
}
.alx-card-title { font-size:15px; font-weight:500; color:#e5e5e5; display:flex; align-items:center; gap:8px; margin:0; }
.alx-card-title i { color:#a3a3a3; }
.alx-search-group { display:flex; gap:8px; align-items:center; flex-wrap: wrap; }
.alx-search-group .form-control {
    background: #0a0a0a !important; border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 8px !important; color:#e5e5e5 !important; font-size:13px; height:34px;
    padding: 0 12px; min-width:180px; transition: border-color 0.2s; box-shadow: none !important;
}
.alx-search-group .form-control:focus { border-color:#0ea5e9 !important; box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2) !important; outline:none; }
.alx-search-group .form-control::placeholder { color:#737373; }
.alx-btn { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:8px; font-size:13px; font-weight:500; border:1px solid transparent; cursor:pointer; transition:all 0.2s; text-decoration:none; white-space:nowrap; box-shadow:none; }
.alx-btn-search { background: #262626; color:#e5e5e5; border:1px solid rgba(255, 255, 255, 0.15); }
.alx-btn-search:hover { background: #404040; }
.alx-table { width:100%; border-collapse:collapse; min-width: 700px; }
.alx-table thead tr { background: #171717; border-bottom:1px solid rgba(255, 255, 255, 0.08); }
.alx-table thead th { padding:12px 16px; font-size:12px; font-weight:500; text-transform:capitalize; color:#a3a3a3; white-space:nowrap; text-align:left; }
.alx-table tbody tr { border-bottom:1px solid rgba(255, 255, 255, 0.04); transition:background 0.15s; }
.alx-table tbody tr:last-child { border-bottom:none; }
.alx-table tbody tr:hover { background: rgba(255, 255, 255, 0.02); }
.alx-table td { padding:12px 16px; font-size:13px; color:#e5e5e5; vertical-align:middle; }
.alx-table td a { color:#a3a3a3; text-decoration:none; font-weight:500; transition:color 0.15s; }
.alx-table td a:hover { color:#e5e5e5; }
.alx-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:4px; font-size:11px; font-weight:500; white-space:nowrap; }
.alx-badge-unlimited { background:rgba(255, 255, 255, 0.1); color:#a3a3a3; border:1px solid rgba(255, 255, 255, 0.15); }
.alx-badge-expired { background:rgba(239, 68, 68, 0.1); color:#ef4444; border:1px solid rgba(239, 68, 68, 0.2); }
.alx-badge-active { background:rgba(16, 185, 129, 0.1); color:#10b981; border:1px solid rgba(16, 185, 129, 0.2); }
.alx-badge-soon { background:rgba(245, 158, 11, 0.1); color:#f59e0b; border:1px solid rgba(245, 158, 11, 0.2); }
.alx-action-group { display:flex; align-items:center; gap:6px; }
.alx-date-input {
    background: #0a0a0a !important; border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius:8px !important; color:#e5e5e5 !important; font-size:13px; height:32px;
    padding:0 10px; min-width:130px; transition:border-color 0.2s; box-shadow: none !important;
}
.alx-date-input:focus { border-color:#0ea5e9 !important; outline:none; }
.alx-btn-set { background:rgba(255, 255, 255, 0.1); color:#ffffff; border:1px solid rgba(255, 255, 255, 0.2); height:32px; padding:0 10px; border-radius:8px; font-size:12px; font-weight:500; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
.alx-btn-set:hover { background:rgba(255, 255, 255, 0.2); color:#ffffff; }
.alx-btn-add30 { background:rgba(16, 185, 129, 0.15); color:#34d399; border:1px solid rgba(16, 185, 129, 0.3); height:32px; padding:0 10px; border-radius:8px; font-size:12px; font-weight:500; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
.alx-btn-add30:hover { background:rgba(16, 185, 129, 0.25); }
.alx-btn-delete-all { background: #ef4444; color: #fff; border: 1px solid transparent; }
.alx-btn-delete-all:hover { background: #dc2626; color: #fff; }
.alx-pagination { display:flex; justify-content:center; padding:16px 24px; border-top:1px solid rgba(255, 255, 255, 0.08); }
.alx-server-name { font-weight:500; color:#e5e5e5; }
.alx-username { color:#a3a3a3; font-size:13px; }
.alx-email { color:#737373; font-size:11px; display:block; margin-top:2px; }
.alx-date-val { color:#e5e5e5; font-weight:500; font-size:13px; }
.alx-date-time { color:#737373; font-size:11px; display:block; margin-top:1px; }
</style>

<div class="row">
    <div class="col-xs-12">
        <div class="alx-card">
            <div class="alx-card-header">
                <h3 class="alx-card-title"><i class="fa fa-clock-o"></i> Expiration Manager</h3>
                <div class="alx-search-group" style="flex: 1; justify-content: flex-end;">
                    <form action="{{ route('admin.expiration') }}" method="GET" style="display:inline-flex; gap: 8px;">
                        <input type="text" name="filter[*]" class="form-control" value="{{ request()->input()['filter']['*'] ?? '' }}" placeholder="Search server name...">
                        <button type="submit" class="alx-btn alx-btn-search"><i class="fa fa-search"></i> Search</button>
                    </form>
                    <form action="{{ route('admin.expiration.deleteAll') }}" method="POST" style="display:inline-flex;" onsubmit="return confirm('Are you sure you want to delete all expired servers? This action cannot be undone and will delete server files and databases.');">
                        {!! csrf_field() !!}
                        <button type="submit" class="alx-btn alx-btn-delete-all"><i class="fa fa-trash"></i> Delete All Expired</button>
                    </form>
                </div>
            </div>

            <div style="overflow-x: auto;">
                <table class="alx-table">
                    <thead>
                        <tr>
                            <th>Server</th>
                            <th>Owner</th>
                            <th>Node</th>
                            <th>Expires At</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($servers as $server)
                            <tr>
                                <td>
                                    <a href="{{ route('admin.servers.view', $server->id) }}" class="alx-server-name">
                                        <i class="fa fa-server" style="color:#a3a3a3;margin-right:6px;font-size:11px;"></i>{{ $server->name }}
                                    </a>
                                </td>

                                <td>
                                    <a href="{{ route('admin.users.view', $server->user->id) }}" class="alx-username">{{ $server->user->username }}</a>
                                    <small class="alx-email">{{ $server->user->email }}</small>
                                </td>

                                <td>
                                    <span style="color:#94a3b8;">{{ $server->node->name }}</span>
                                </td>

                                <td>
                                    @if($server->expires_at)
                                        <span class="alx-date-val">{{ $server->expires_at->format('d M Y') }}</span>
                                        <small class="alx-date-time"><i class="fa fa-clock-o" style="font-size:10px;"></i> {{ $server->expires_at->format('H:i') }}</small>
                                    @else
                                        <span style="color:#475569;">—</span>
                                    @endif
                                </td>

                                <td>
                                    @if(!$server->expires_at)
                                        <span class="alx-badge alx-badge-unlimited"><i class="fa fa-infinity"></i> Unlimited</span>
                                    @elseif($server->expires_at->isPast())
                                        <span class="alx-badge alx-badge-expired"><i class="fa fa-exclamation-circle"></i> EXPIRED</span>
                                    @elseif($server->expires_at->diffInDays() <= 3)
                                        <span class="alx-badge alx-badge-soon"><i class="fa fa-clock-o"></i> {{ $server->expires_at->diffForHumans() }}</span>
                                    @else
                                        <span class="alx-badge alx-badge-active"><i class="fa fa-check-circle"></i> {{ $server->expires_at->diffForHumans() }}</span>
                                    @endif
                                </td>

                                <td>
                                    <form action="{{ route('admin.expiration.update', $server->id) }}" method="POST">
                                        {!! csrf_field() !!}
                                        <div class="alx-action-group">
                                            <input type="date" name="new_date" class="alx-date-input" title="Pick a specific date">
                                            <button type="submit" class="alx-btn-set" title="Set to selected date">
                                                <i class="fa fa-calendar-check-o"></i> Set
                                            </button>
                                            <button type="submit" name="days" value="30" class="alx-btn-add30" title="Add 30 Days from now/current expiry">
                                                +30D
                                            </button>
                                        </div>
                                    </form>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            @if($servers->hasPages())
                <div class="alx-pagination">
                    <div class="col-md-12 text-center">{!! $servers->render() !!}</div>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection