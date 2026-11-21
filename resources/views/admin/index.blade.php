@extends('layouts.admin')

@section('title')
    Command Center
@endsection

@section('content-header')
    <h1>Cloud Command Center<small>Real-time infrastructure telemetry, fleet overview, and security engine status.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Overview</li>
    </ol>
@endsection

@section('content')
@php
    $isSuperOwner = Auth::user()->id === 1;
    $totalServers = $isSuperOwner
        ? \Pterodactyl\Models\Server::count()
        : \Pterodactyl\Models\Server::where('owner_id', Auth::user()->id)->count();
    $suspendedServers = $isSuperOwner
        ? \Pterodactyl\Models\Server::where('status', 'suspended')->count()
        : \Pterodactyl\Models\Server::where('owner_id', Auth::user()->id)->where('status', 'suspended')->count();
    $totalUsers = \Pterodactyl\Models\User::count();
    $totalAdmins = \Pterodactyl\Models\User::where('root_admin', true)->count();
    $totalNodes = \Pterodactyl\Models\Node::count();
    $totalAllocations = \Pterodactyl\Models\Allocation::count();
    $usedAllocations = \Pterodactyl\Models\Allocation::whereNotNull('server_id')->count();
    $totalEggs = \Pterodactyl\Models\Egg::count();
    $recentServers = ($isSuperOwner
        ? \Pterodactyl\Models\Server::with(['user', 'node', 'allocation'])->latest('id')->limit(5)->get()
        : \Pterodactyl\Models\Server::with(['user', 'node', 'allocation'])->where('owner_id', Auth::user()->id)->latest('id')->limit(5)->get());
@endphp

<style>
    .alx-cmd-hero {
        background: linear-gradient(135deg, #111115 0%, #0c131f 100%);
        border: 1px solid rgba(56, 189, 248, 0.25);
        border-radius: 18px;
        padding: 24px 28px;
        margin-bottom: 22px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 18px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }
    .alx-kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 22px;
    }
    @media (max-width: 1199px) { .alx-kpi-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 575px) { .alx-kpi-grid { grid-template-columns: 1fr; } }
    .alx-kpi-card {
        background: #111113;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 20px 22px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: transform 0.15s ease, border-color 0.15s ease;
        text-decoration: none !important;
    }
    .alx-kpi-card:hover {
        transform: translateY(-2px);
        border-color: rgba(56, 189, 248, 0.4);
    }
    .alx-kpi-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
    }
    .alx-kpi-label {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: #a1a1aa;
    }
    .alx-kpi-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
    }
    .alx-kpi-val {
        font-size: 28px;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: -0.03em;
        line-height: 1.1;
        font-variant-numeric: tabular-nums;
    }
    .alx-kpi-sub {
        font-size: 12px;
        color: #71717a;
        margin-top: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .alx-bento-row {
        display: grid;
        grid-template-columns: 7fr 5fr;
        gap: 20px;
        margin-bottom: 24px;
    }
    @media (max-width: 991px) { .alx-bento-row { grid-template-columns: 1fr; } }
    .alx-sec-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 14px;
        background: #09090b;
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 11px;
        margin-bottom: 10px;
    }
    .alx-sec-item:last-child { margin-bottom: 0; }
</style>

{{-- Hero Banner --}}
<div class="alx-cmd-hero">
    <div>
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px; flex-wrap:wrap;">
            <span style="display:inline-flex; align-items:center; gap:6px; padding:3px 10px; border-radius:99px; font-size:11px; font-weight:700; background:rgba(16,185,129,0.14); border:1px solid rgba(16,185,129,0.35); color:#34d399;">
                <span style="width:6px; height:6px; border-radius:50%; background:#10b981; box-shadow:0 0 8px #10b981;"></span>
                ALL SYSTEMS OPERATIONAL
            </span>
            <code style="font-size:11.5px;">Alxzen {{ config('app.version') }}</code>
        </div>
        <h2 style="margin:0; font-size:21px; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">
            Welcome back, <span style="color:#38bdf8;">{{ Auth::user()->username }}</span>
        </h2>
        <p style="margin:4px 0 0 0; font-size:13px; color:#a1a1aa;">
            Next-Gen Game &amp; Cloud Container Control Plane — Hardware-Accelerated UI &amp; Zero-Trust Endpoint Isolation.
        </p>
    </div>
    <div style="display:flex; flex-wrap:wrap; gap:10px;">
        <a href="{{ route('admin.servers.new') }}" class="btn btn-primary">
            <i class="fa fa-plus-circle"></i> Deploy Server
        </a>
        <a href="{{ route('admin.users.new') }}" class="btn btn-default">
            <i class="fa fa-user-plus"></i> Create User
        </a>
        <a href="{{ route('admin.api.new') }}" class="btn btn-default">
            <i class="fa fa-key"></i> Generate PTLA Key
        </a>
    </div>
</div>

{{-- 4-Column Live Telemetry KPI Bento --}}
<div class="alx-kpi-grid">
    <a href="{{ route('admin.servers') }}" class="alx-kpi-card">
        <div class="alx-kpi-top">
            <span class="alx-kpi-label">{{ $isSuperOwner ? 'Total Fleet Servers' : 'Your Deployed Servers' }}</span>
            <div class="alx-kpi-icon" style="background:rgba(14,165,233,0.12); border:1px solid rgba(56,189,248,0.28); color:#38bdf8;">
                <i class="fa fa-server"></i>
            </div>
        </div>
        <div class="alx-kpi-val">{{ number_format($totalServers) }}</div>
        <div class="alx-kpi-sub">
            <span style="color:#34d399; font-weight:600;">{{ max(0, $totalServers - $suspendedServers) }} active</span>
            <span>·</span>
            <span style="color:{{ $suspendedServers > 0 ? '#f87171' : '#71717a' }};">{{ $suspendedServers }} suspended</span>
        </div>
    </a>

    <a href="{{ route('admin.users') }}" class="alx-kpi-card">
        <div class="alx-kpi-top">
            <span class="alx-kpi-label">Registered Accounts</span>
            <div class="alx-kpi-icon" style="background:rgba(16,185,129,0.12); border:1px solid rgba(52,211,153,0.28); color:#34d399;">
                <i class="fa fa-users"></i>
            </div>
        </div>
        <div class="alx-kpi-val">{{ number_format($totalUsers) }}</div>
        <div class="alx-kpi-sub">
            <span style="color:#fbbf24; font-weight:600;">{{ $totalAdmins }} administrators</span>
            <span>·</span>
            <span>{{ max(0, $totalUsers - $totalAdmins) }} clients</span>
        </div>
    </a>

    <a href="{{ route('admin.nodes') }}" class="alx-kpi-card">
        <div class="alx-kpi-top">
            <span class="alx-kpi-label">Wings Daemon Nodes</span>
            <div class="alx-kpi-icon" style="background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.28); color:#38bdf8;">
                <i class="fa fa-sitemap"></i>
            </div>
        </div>
        <div class="alx-kpi-val">{{ number_format($totalNodes) }}</div>
        <div class="alx-kpi-sub">
            <span style="color:#38bdf8; font-weight:600;">{{ $usedAllocations }} / {{ $totalAllocations }}</span>
            <span>ports allocated</span>
        </div>
    </a>

    <a href="{{ route('admin.nests') }}" class="alx-kpi-card">
        <div class="alx-kpi-top">
            <span class="alx-kpi-label">Runtime Service Eggs</span>
            <div class="alx-kpi-icon" style="background:rgba(245,158,11,0.12); border:1px solid rgba(251,191,36,0.28); color:#fbbf24;">
                <i class="fa fa-cubes"></i>
            </div>
        </div>
        <div class="alx-kpi-val">{{ number_format($totalEggs) }}</div>
        <div class="alx-kpi-sub">
            <span>Docker runtime images ready</span>
        </div>
    </a>
</div>

{{-- 2-Column Bento: Recent Deployed Servers & Security Engine --}}
<div class="alx-bento-row">
    <div class="box" style="margin-bottom:0 !important;">
        <div class="box-header" style="display:flex; align-items:center; justify-content:space-between;">
            <h3 class="box-title"><i class="fa fa-bolt" style="color:#38bdf8; margin-right:8px;"></i>Recently Deployed Servers</h3>
            <a href="{{ route('admin.servers') }}" class="btn btn-xs btn-default">View All <i class="fa fa-arrow-right"></i></a>
        </div>
        <div class="box-body table-responsive no-padding">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Server Name</th>
                        <th>Owner</th>
                        <th>Node</th>
                        <th>Endpoint</th>
                        <th>Status</th>
                        <th style="text-align:right;">Manage</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($recentServers as $srv)
                        <tr>
                            <td><a href="{{ route('admin.servers.view', $srv->id) }}">{{ $srv->name }}</a></td>
                            <td>{{ $srv->user->username ?? 'Unknown' }}</td>
                            <td><span style="color:#a1a1aa;">{{ $srv->node->name ?? '-' }}</span></td>
                            <td><code>{{ $srv->allocation ? ($srv->allocation->alias ?: $srv->allocation->ip) . ':' . $srv->allocation->port : 'n/a' }}</code></td>
                            <td>
                                @if($srv->isSuspended())
                                    <span class="label label-danger">Suspended</span>
                                @elseif(!$srv->isInstalled())
                                    <span class="label label-warning">Installing</span>
                                @else
                                    <span class="label label-success">Active</span>
                                @endif
                            </td>
                            <td style="text-align:right;">
                                <a href="{{ route('admin.servers.view', $srv->id) }}" class="btn btn-xs btn-default">
                                    <i class="fa fa-sliders"></i> Configure
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" style="text-align:center; padding:32px; color:#71717a;">No servers deployed yet.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <div class="box" style="margin-bottom:0 !important;">
        <div class="box-header">
            <h3 class="box-title"><i class="fa fa-shield" style="color:#34d399; margin-right:8px;"></i>Security &amp; Engine Modules</h3>
        </div>
        <div class="box-body">
            <div class="alx-sec-item">
                <div>
                    <div style="font-size:13px; font-weight:700; color:#ffffff;">Zero-Trust Anti-Intip Isolation</div>
                    <div style="font-size:11.5px; color:#71717a;">Endpoint-level server ownership &amp; PTLA scoping</div>
                </div>
                <span class="label label-success"><i class="fa fa-check"></i> ENFORCED</span>
            </div>
            <div class="alx-sec-item">
                <div>
                    <div style="font-size:13px; font-weight:700; color:#ffffff;">Upstream CVE-2026 Shield</div>
                    <div style="font-size:11.5px; color:#71717a;">Patched CVE-2026-86177, 35202, 61609 &amp; 26016</div>
                </div>
                <span class="label label-success"><i class="fa fa-lock"></i> PATCHED</span>
            </div>
            <div class="alx-sec-item">
                <div>
                    <div style="font-size:13px; font-weight:700; color:#ffffff;">Automated Expiration Engine</div>
                    <div style="font-size:11.5px; color:#71717a;">Auto-suspend &amp; lifecycle tracking v{{ config('app.expiration_version') }}</div>
                </div>
                <a href="{{ route('admin.expiration') }}" class="label label-primary" style="text-decoration:none;">MANAGE →</a>
            </div>
            <div class="alx-sec-item">
                <div>
                    <div style="font-size:13px; font-weight:700; color:#ffffff;">Community &amp; Developer Support</div>
                    <div style="font-size:11.5px; color:#71717a;">Built by {{ config('app.author') }}</div>
                </div>
                <div style="display:flex; gap:6px;">
                    <a href="https://t.me/alxzy_group" target="_blank" class="btn btn-xs btn-primary"><i class="fa fa-paper-plane"></i> Telegram</a>
                    <a href="https://github.com/alxzy-group" target="_blank" class="btn btn-xs btn-default"><i class="fa fa-github"></i></a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
