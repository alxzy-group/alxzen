@extends('layouts.admin')

@section('title')
    Server Fleet
@endsection

@section('content-header')
    <h1>Server Fleet<small>Monitor, search, and manage all active instances deployed across your nodes.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Servers</li>
    </ol>
@endsection

@section('content')
<style>
.alx-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 700;
    border-radius: 999px;
    letter-spacing: 0.02em;
}
.alx-status .alx-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
}
.alx-status-active {
    background: rgba(16, 185, 129, 0.12);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.25);
}
.alx-status-suspended {
    background: rgba(239, 68, 68, 0.12);
    color: #fb7185;
    border: 1px solid rgba(239, 68, 68, 0.25);
}
.alx-status-installing {
    background: rgba(245, 158, 11, 0.12);
    color: #fbbf24;
    border: 1px solid rgba(245, 158, 11, 0.25);
}
.alx-toolbar-form {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}
.alx-toolbar-input {
    width: 220px !important;
    height: 34px !important;
    font-size: 13px !important;
}
</style>

<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">
                    <i class="fa fa-server" style="color:#38bdf8;margin-right:8px;"></i>Fleet Directory
                    <span style="margin-left:10px;padding:2px 9px;border-radius:999px;background:rgba(14,165,233,0.12);color:#38bdf8;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;">{{ $servers->total() }} Total</span>
                </h3>
                <div class="box-tools">
                    <form action="{{ route('admin.servers') }}" method="GET" class="alx-toolbar-form">
                        <input
                            type="text"
                            name="filter[*]"
                            class="form-control alx-toolbar-input"
                            value="{{ request()->input()['filter']['*'] ?? '' }}"
                            placeholder="Search servers or UUID..."
                        >
                        <button type="submit" class="btn btn-sm btn-default">
                            <i class="fa fa-search" style="margin-right:4px;"></i> Search
                        </button>
                        <a href="{{ route('admin.servers.new') }}" class="btn btn-sm btn-primary">
                            <i class="fa fa-plus" style="margin-right:5px;"></i> Deploy Server
                        </a>
                    </form>
                </div>
            </div>

            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Server Name</th>
                            <th>Short UUID</th>
                            <th>Owner</th>
                            <th>Daemon Node</th>
                            <th>Allocation</th>
                            <th class="text-center">Status</th>
                            <th class="text-right" style="width:110px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($servers as $server)
                            <tr>
                                <td>
                                    <a href="{{ route('admin.servers.view', $server->id) }}" style="font-weight:700;font-size:13.5px;color:#f4f4f5;">
                                        <i class="fa fa-server" style="color:#38bdf8;margin-right:6px;"></i>{{ $server->name }}
                                    </a>
                                </td>
                                <td><code title="{{ $server->uuid }}">{{ $server->uuidShort }}</code></td>
                                <td>
                                    <a href="{{ route('admin.users.view', $server->user->id) }}" style="font-weight:600;">
                                        <i class="fa fa-user-circle-o" style="color:#71717a;margin-right:5px;"></i>{{ $server->user->username }}
                                    </a>
                                </td>
                                <td>
                                    <a href="{{ route('admin.nodes.view', $server->node->id) }}" style="color:#d4d4d8;">
                                        <i class="fa fa-sitemap" style="color:#71717a;margin-right:5px;"></i>{{ $server->node->name }}
                                    </a>
                                </td>
                                <td><code style="font-variant-numeric:tabular-nums;">{{ $server->allocation->alias }}:{{ $server->allocation->port }}</code></td>
                                <td class="text-center">
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
                                <td class="text-right">
                                    <a class="btn btn-xs btn-default" href="{{ route('admin.servers.view', $server->id) }}" title="Manage Server">
                                        <i class="fa fa-sliders" style="margin-right:4px;"></i> Manage
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center" style="padding:40px 16px;color:#71717a;">
                                    <i class="fa fa-server" style="font-size:26px;display:block;margin-bottom:8px;color:#3f3f46;"></i>
                                    No servers match your current search filter.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            @if($servers->hasPages())
                <div class="box-footer with-border">
                    <div class="col-md-12 text-center">{!! $servers->appends(['filter' => Request::input('filter')])->render() !!}</div>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
