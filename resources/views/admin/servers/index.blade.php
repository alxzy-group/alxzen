@extends('layouts.admin')

@section('title')
    Server Management
@endsection

@section('content-header')
    <h1>Servers<small>All servers managed on this panel.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Servers</li>
    </ol>
@endsection

@section('content')
<style>
/* === Taste Skill Minimal Admin Server List === */
.alx-admin-card {
    background: #171717;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    overflow: hidden;
}

/* Header */
.alx-admin-header {
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
.alx-admin-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 500;
    color: #e5e5e5;
    margin: 0;
}
.alx-admin-title i { color: #a3a3a3; font-size: 14px; }
.alx-admin-count {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    font-size: 11px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 4px;
}

/* Search controls */
.alx-admin-controls { display: flex; gap: 8px; align-items: center; flex-wrap: nowrap; }
.alx-admin-input {
    background: #000000 !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 12px !important;
    color: #e5e5e5 !important;
    font-size: 13px;
    height: 34px;
    padding: 0 12px;
    width: 220px;
    transition: border-color 0.2s;
    box-shadow: none !important;
}
.alx-admin-input:focus {
    border-color: #0ea5e9 !important;
    box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2) !important;
    outline: none;
}
.alx-admin-input::placeholder { color: #737373; }

.alx-admin-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 500;
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    text-decoration: none !important;
    transition: all 0.2s;
}
.alx-admin-btn-search {
    background: #262626;
    color: #e5e5e5;
    border: 1px solid rgba(255, 255, 255, 0.15);
}
.alx-admin-btn-search:hover {
    background: #404040;
}
.alx-admin-btn-create {
    background: #0ea5e9;
    color: #fff;
    border-radius: 12px;
}
.alx-admin-btn-create:hover {
    background: #0284c7;
    color: #fff;
}

/* Table */
.alx-admin-table {
    width: 100%;
    border-collapse: collapse;
}
.alx-admin-table thead tr {
    background: #171717;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.alx-admin-table thead th {
    padding: 12px 16px;
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;
    color: #a3a3a3;
    text-align: left;
}
.alx-admin-table tbody tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    transition: background 0.15s;
}
.alx-admin-table tbody tr:last-child { border-bottom: none; }
.alx-admin-table tbody tr:hover {
    background: rgba(255, 255, 255, 0.02);
}
.alx-admin-table td {
    padding: 12px 16px;
    font-size: 13px;
    color: #e5e5e5;
    vertical-align: middle;
}
.alx-admin-table td.alx-primary {
    color: #e5e5e5;
    font-weight: 500;
}
.alx-admin-table td a {
    color: #a3a3a3;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.15s;
}
.alx-admin-table td a:hover { color: #e5e5e5; }
.alx-admin-table td code {
    background: #0a0a0a;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 12px;
    color: #a3a3a3;
}

/* Badges */
.alx-status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;
}
.alx-status .alx-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: currentColor;
}
.alx-status-active {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.2);
}
.alx-status-suspended {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
}
.alx-status-installing {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.2);
}

/* Action */
.alx-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px; height: 28px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: #ffffff;
    text-decoration: none;
    transition: all 0.2s;
    font-size: 12px;
}
.alx-action:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.4);
}

/* Pagination */
.alx-admin-pager {
    display: flex;
    justify-content: center;
    padding: 16px 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    background: #171717;
}
.alx-admin-pager .pagination > li > a,
.alx-admin-pager .pagination > li > span {
    background: #0a0a0a !important;
    border-color: rgba(255, 255, 255, 0.08) !important;
    color: #a3a3a3 !important;
    border-radius: 4px !important;
    margin: 0 2px;
}
.alx-admin-pager .pagination > .active > a,
.alx-admin-pager .pagination > .active > span {
    background: #0ea5e9 !important;
    border-color: #0ea5e9 !important;
    color: #fff !important;
}

/* Empty */
.alx-admin-empty {
    text-align: center;
    padding: 60px 20px;
    color: #737373;
}
.alx-admin-empty i { font-size: 36px; margin-bottom: 12px; display: block; color: #404040; }
.alx-admin-empty p { font-size: 13px; margin: 0; }
</style>

<div class="row">
    <div class="col-xs-12">
        <div class="alx-admin-card">
            <div class="alx-admin-header">
                <h3 class="alx-admin-title">
                    <i class="fa fa-server"></i>
                    Server Management
                    <span class="alx-admin-count">{{ $servers->total() }} TOTAL</span>
                </h3>
                <form action="{{ route('admin.servers') }}" method="GET">
                    <div class="alx-admin-controls">
                        <input
                            type="text"
                            name="filter[*]"
                            class="form-control alx-admin-input"
                            value="{{ request()->input()['filter']['*'] ?? '' }}"
                            placeholder="Search servers..."
                        >
                        <button type="submit" class="alx-admin-btn alx-admin-btn-search">
                            <i class="fa fa-search"></i> Search
                        </button>
                        <a href="{{ route('admin.servers.new') }}" class="alx-admin-btn alx-admin-btn-create">
                            <i class="fa fa-plus"></i> New Server
                        </a>
                    </div>
                </form>
            </div>

            <div style="overflow-x: auto;">
                <table class="alx-admin-table">
                    <thead>
                        <tr>
                            <th>Server</th>
                            <th>UUID</th>
                            <th>Owner</th>
                            <th>Node</th>
                            <th>Endpoint</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($servers as $server)
                            <tr>
                                <td class="alx-primary">
                                    <a href="{{ route('admin.servers.view', $server->id) }}">{{ $server->name }}</a>
                                </td>
                                <td><code title="{{ $server->uuid }}">{{ $server->uuidShort }}&hellip;</code></td>
                                <td>
                                    <a href="{{ route('admin.users.view', $server->user->id) }}">
                                        {{ $server->user->username }}
                                    </a>
                                </td>
                                <td>
                                    <a href="{{ route('admin.nodes.view', $server->node->id) }}">
                                        {{ $server->node->name }}
                                    </a>
                                </td>
                                <td><code>{{ $server->allocation->alias }}:{{ $server->allocation->port }}</code></td>
                                <td>
                                    @if($server->isSuspended())
                                        <span class="alx-status alx-status-suspended">
                                            <span class="alx-dot"></span> Suspended
                                        </span>
                                    @elseif(!$server->isInstalled())
                                        <span class="alx-status alx-status-installing">
                                            <span class="alx-dot"></span> Installing
                                        </span>
                                    @else
                                        <span class="alx-status alx-status-active">
                                            <span class="alx-dot"></span> Active
                                        </span>
                                    @endif
                                </td>
                                <td>
                                    <a class="alx-action" href="{{ route('admin.servers.view', $server->id) }}" title="Manage">
                                        <i class="fa fa-wrench"></i>
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="alx-admin-empty">
                                    <i class="fa fa-server"></i>
                                    <p>No servers found</p>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            @if($servers->hasPages())
                <div class="alx-admin-pager">
                    {!! $servers->appends(['filter' => Request::input('filter')])->render() !!}
                </div>
            @endif
        </div>
    </div>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        // Subtle hover row highlight
        document.querySelectorAll('.alx-admin-table tbody tr').forEach(function(row) {
            row.addEventListener('mouseenter', function() {
                this.style.borderLeft = '2px solid rgba(124,58,237,0.4)';
            });
            row.addEventListener('mouseleave', function() {
                this.style.borderLeft = '';
            });
        });
    </script>
@endsection
