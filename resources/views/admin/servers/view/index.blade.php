@extends('layouts.admin')

@section('title')
    Server — {{ $server->name }}
@endsection

@section('content-header')
    <h1>{{ $server->name }}<small>{{ str_limit($server->description) }}</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        @if(strpos(url()->previous(), '/admin/expiration') !== false)
            <li><a href="{{ route('admin.expiration') }}">Expiration Manager</a></li>
        @else
            <li><a href="{{ route('admin.servers') }}">Servers</a></li>
        @endif
        <li class="active">{{ $server->name }}</li>
    </ol>
@endsection

@section('content')
@include('admin.servers.partials.navigation')
<div class="row">
    <div class="col-md-8">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title"><i class="fa fa-server" style="color:#38bdf8; margin-right:8px;"></i>Instance Specifications &amp; Telemetry</h3>
                <div class="box-tools">
                    @if($server->isSuspended())
                        <span class="label label-danger">Suspended</span>
                    @elseif(!$server->isInstalled())
                        <span class="label label-warning">Installing</span>
                    @else
                        <span class="label label-success">Active</span>
                    @endif
                </div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <tr>
                        <td style="color:#a1a1aa; width:35%;">Internal Identifier</td>
                        <td><code>#{{ $server->id }}</code></td>
                    </tr>
                    <tr>
                        <td style="color:#a1a1aa;">External Identifier</td>
                        @if(is_null($server->external_id))
                            <td><span class="label label-default">Not Set</span></td>
                        @else
                            <td><code>{{ $server->external_id }}</code></td>
                        @endif
                    </tr>
                    <tr>
                        <td style="color:#a1a1aa;">UUID / Docker Container ID</td>
                        <td><code>{{ $server->uuid }}</code></td>
                    </tr>
                    <tr>
                        <td style="color:#a1a1aa;">Service Nest &amp; Egg</td>
                        <td>
                            <a href="{{ route('admin.nests.view', $server->nest_id) }}">{{ $server->nest->name }}</a>
                            <span style="color:#71717a; margin:0 6px;">/</span>
                            <a href="{{ route('admin.nests.egg.view', $server->egg_id) }}">{{ $server->egg->name }}</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="color:#a1a1aa;">Server Name</td>
                        <td style="font-weight:700; color:#fff;">{{ $server->name }}</td>
                    </tr>
                    <tr>
                        <td style="color:#a1a1aa;">CPU Limit &amp; Pinning</td>
                        <td>
                            <code>{{ $server->cpu === 0 ? 'Unlimited' : $server->cpu . '%' }}</code>
                            @if($server->threads != null)
                                <span style="color:#71717a; margin:0 6px;">·</span>
                                <code>Threads: {{ $server->threads }}</code>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td style="color:#a1a1aa;">Memory &amp; Swap</td>
                        <td>
                            <code>{{ $server->memory === 0 ? 'Unlimited' : $server->memory . ' MiB' }}</code>
                            <span style="color:#71717a; margin:0 6px;">/</span>
                            <code data-toggle="tooltip" title="Swap Space">
                                Swap: {{ $server->swap === 0 ? 'Disabled' : ($server->swap === -1 ? 'Unlimited' : $server->swap . ' MiB') }}
                            </code>
                        </td>
                    </tr>
                    <tr>
                        <td style="color:#a1a1aa;">Disk Storage Limit</td>
                        <td><code>{{ $server->disk === 0 ? 'Unlimited' : $server->disk . ' MiB' }}</code></td>
                    </tr>
                    <tr>
                        <td style="color:#a1a1aa;">Block IO Weight</td>
                        <td><code>{{ $server->io }}</code></td>
                    </tr>
                    <tr>
                        <td style="color:#a1a1aa;">Primary Allocation</td>
                        <td><code>{{ $server->allocation->ip }}:{{ $server->allocation->port }}</code></td>
                    </tr>
                    <tr>
                        <td style="color:#a1a1aa;">Connection Alias</td>
                        <td>
                            @if($server->allocation->alias !== $server->allocation->ip)
                                <code>{{ $server->allocation->alias }}:{{ $server->allocation->port }}</code>
                            @else
                                <span class="label label-default">No Alias Assigned</span>
                            @endif
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>

    <div class="col-md-4">
        {{-- Modern Owner Bento Card --}}
        <div class="box" style="padding:20px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
                <div>
                    <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#a1a1aa;">Instance Owner</div>
                    <div style="font-size:18px; font-weight:800; color:#ffffff; margin-top:2px;">{{ $server->user->username }}</div>
                    <div style="font-size:12px; color:#71717a;">{{ $server->user->email }}</div>
                </div>
                <div style="width:44px; height:44px; border-radius:12px; background:rgba(14,165,233,0.12); border:1px solid rgba(56,189,248,0.28); display:flex; align-items:center; justify-content:center; color:#38bdf8; font-size:18px;">
                    <i class="fa fa-user"></i>
                </div>
            </div>
            <a href="{{ route('admin.users.view', $server->user->id) }}" class="btn btn-default btn-sm" style="width:100%;">
                <i class="fa fa-id-card-o"></i> Inspect User Profile
            </a>
        </div>

        {{-- Modern Node Bento Card --}}
        <div class="box" style="padding:20px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
                <div>
                    <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#a1a1aa;">Host Daemon Node</div>
                    <div style="font-size:18px; font-weight:800; color:#ffffff; margin-top:2px;">{{ $server->node->name }}</div>
                    <div style="font-size:12px; color:#71717a;">{{ $server->node->fqdn }}</div>
                </div>
                <div style="width:44px; height:44px; border-radius:12px; background:rgba(16,185,129,0.12); border:1px solid rgba(52,211,153,0.28); display:flex; align-items:center; justify-content:center; color:#34d399; font-size:18px;">
                    <i class="fa fa-sitemap"></i>
                </div>
            </div>
            <a href="{{ route('admin.nodes.view', $server->node->id) }}" class="btn btn-default btn-sm" style="width:100%;">
                <i class="fa fa-server"></i> Inspect Daemon Node
            </a>
        </div>

        {{-- Direct Console Launch Card --}}
        <div class="box" style="padding:20px;">
            <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#a1a1aa; margin-bottom:8px;">Quick Actions</div>
            <a href="/server/{{ $server->uuidShort }}" target="_blank" class="btn btn-primary btn-sm" style="width:100%; margin-bottom:8px;">
                <i class="fa fa-terminal"></i> Launch Live Client Console
            </a>
            <a href="{{ route('admin.servers.view.manage', $server->id) }}" class="btn btn-default btn-sm" style="width:100%;">
                <i class="fa fa-wrench"></i> Reinstall / Suspend / Transfer
            </a>
        </div>
    </div>
</div>
@endsection
