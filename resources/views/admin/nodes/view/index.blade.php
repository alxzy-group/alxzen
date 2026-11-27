@extends('layouts.admin')

@section('title')
    {{ $node->name }}
@endsection

@section('content-header')
    <h1>{{ $node->name }}<small>Real-time compute telemetry, active container footprint, and daemon overview.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.nodes') }}">Nodes</a></li>
        <li class="active">{{ $node->name }}</li>
    </ol>
@endsection

@section('content')
@php
    $nodeTotalMemGiB = round($node->memory / 1024, 2);
    $nodeTotalDiskGiB = round($node->disk / 1024, 2);
    $memAllocatedGiB = round(((float) str_replace(',', '', $stats['memory']['value'])) / 1024, 2);
    $diskAllocatedGiB = round(((float) str_replace(',', '', $stats['disk']['value'])) / 1024, 2);
    $isSuperAdmin = Auth::user()->id === 1;
@endphp
<style>
.alx-node-kpis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(215px, 1fr));
    gap: 14px;
    margin-bottom: 18px;
}
.alx-kpi-card {
    background: #0f0f13;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 8px;
    transition: border-color 0.2s ease;
}
.alx-kpi-card:hover {
    border-color: rgba(56, 189, 248, 0.28);
}
.alx-kpi-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}
.alx-kpi-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #94a3b8;
}
.alx-kpi-icon {
    width: 30px;
    height: 30px;
    border-radius: 9px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
}
.alx-kpi-val {
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
    font-variant-numeric: tabular-nums;
    font-size: 24px;
    font-weight: 800;
    color: #f8fafc;
    line-height: 1.15;
}
.alx-kpi-sub {
    font-size: 12px;
    color: #71717a;
    font-variant-numeric: tabular-nums;
}

.alx-card {
    background: #0f0f13;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    margin-bottom: 20px;
}
.alx-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.015);
}
.alx-card-title {
    font-size: 14.5px;
    font-weight: 700;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 9px;
    margin: 0;
    letter-spacing: -0.01em;
}
.alx-card-title i { color: #38bdf8; font-size: 14px; }

.alx-live-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 999px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.05em;
}
.alx-live-pill.online {
    background: rgba(16, 185, 129, 0.12);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.28);
}
.alx-live-pill.offline {
    background: rgba(239, 68, 68, 0.12);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.28);
}
.alx-live-pill.syncing {
    background: rgba(245, 158, 11, 0.12);
    color: #fbbf24;
    border: 1px solid rgba(245, 158, 11, 0.28);
}
.alx-live-dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: currentColor;
}

.alx-gauges-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(245px, 1fr));
    gap: 18px;
}
.alx-gauge-box {
    background: #14141a;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 14px;
    padding: 20px 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}
.alx-gauge-heading {
    color: #e2e8f0;
    font-size: 13.5px;
    font-weight: 700;
    margin: 0 0 16px;
}
.alx-gauge-wrap {
    position: relative;
    width: 176px;
    height: 176px;
    margin: 0 auto;
}
.alx-gauge-center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}
.alx-gauge-num {
    font-family: 'JetBrains Mono', monospace;
    font-variant-numeric: tabular-nums;
    font-size: 20px;
    font-weight: 800;
    color: #f8fafc;
    line-height: 1.15;
}
.alx-gauge-tag {
    margin-top: 3px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #38bdf8;
}
.alx-gauge-meta {
    width: 100%;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 12px;
    color: #94a3b8;
    font-variant-numeric: tabular-nums;
}
.alx-bar-track {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 999px;
    overflow: hidden;
    margin-top: 8px;
}
.alx-bar-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.35s ease;
}

.alx-free-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px;
    margin-top: 18px;
}
.alx-free-card {
    background: #14141a;
    border: 1px solid rgba(56, 189, 248, 0.14);
    border-radius: 12px;
    padding: 15px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}
.alx-free-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #94a3b8;
}
.alx-free-sub {
    font-size: 11.5px;
    color: #64748b;
    margin-top: 3px;
}
.alx-free-num {
    font-family: 'JetBrains Mono', monospace;
    font-variant-numeric: tabular-nums;
    font-size: 21px;
    font-weight: 800;
    color: #34d399;
    white-space: nowrap;
}

.alx-info-table { width: 100%; border-collapse: collapse; min-width: 440px; }
.alx-info-table tr { border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.alx-info-table tr:last-child { border-bottom: none; }
.alx-info-table td { padding: 12px 20px; font-size: 13px; vertical-align: middle; }
.alx-info-table td:first-child { color: #a1a1aa; font-weight: 600; width: 40%; }
.alx-info-table td:last-child { color: #f4f4f5; }
.alx-info-table td code {
    background: #09090b; border: 1px solid rgba(56, 189, 248, 0.25);
    border-radius: 6px; padding: 2px 8px; font-size: 12px; color: #38bdf8;
}

.alx-srv-table { width: 100%; border-collapse: collapse; min-width: 640px; }
.alx-srv-table th {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #71717a;
    font-weight: 700;
    padding: 11px 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    text-align: left;
}
.alx-srv-table td {
    padding: 12px 18px;
    font-size: 13px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    vertical-align: middle;
}
.alx-srv-table tr:last-child td { border-bottom: none; }
.alx-state-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 9px; border-radius: 999px;
    font-size: 11px; font-weight: 700; text-transform: uppercase;
}
.alx-state-running { background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.26); }
.alx-state-starting { background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.26); }
.alx-state-offline { background: rgba(113, 113, 122, 0.16); color: #a1a1aa; border: 1px solid rgba(255, 255, 255, 0.1); }

.alx-quick-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-top: 16px;
}
.alx-quick-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px 10px; border-radius: 9px;
    background: #16161d; border: 1px solid rgba(255, 255, 255, 0.08);
    color: #e4e4e7 !important; font-size: 12px; font-weight: 600;
    text-decoration: none !important; transition: all 0.15s ease;
}
.alx-quick-btn:hover {
    border-color: rgba(56, 189, 248, 0.45);
    color: #38bdf8 !important;
    background: rgba(14, 165, 233, 0.08);
}

.alx-danger-card {
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.25);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 20px;
}
.alx-danger-header {
    padding: 14px 20px;
    border-bottom: 1px solid rgba(239, 68, 68, 0.14);
    background: rgba(239, 68, 68, 0.06);
    font-size: 14px; font-weight: 700; color: #f87171;
    display: flex; align-items: center; gap: 8px;
}
.alx-danger-body { padding: 15px 20px; font-size: 13px; color: #e4e4e7; line-height: 1.6; }
.alx-danger-footer { padding: 13px 20px; border-top: 1px solid rgba(239, 68, 68, 0.14); display: flex; justify-content: flex-end; }
.alx-btn-danger {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 9px; font-size: 13px; font-weight: 600;
    background: #ef4444; color: #fff;
    border: 1px solid transparent; cursor: pointer;
    transition: all 0.15s; text-decoration: none;
}
.alx-btn-danger:hover { background: #dc2626; color: #fff; }
.alx-btn-danger:disabled, .alx-btn-danger[disabled] { opacity: 0.4; cursor: not-allowed; pointer-events: none; }

.alx-desc-card {
    background: #0f0f13;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px; padding: 18px 20px;
    margin-bottom: 20px;
}
.alx-desc-card pre { color: #e4e4e7; font-size: 13px; margin: 0; white-space: pre-wrap; background: transparent; border: none; padding: 0; font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }
</style>

<div class="row">
    <div class="col-xs-12">
        <div class="nav-tabs-custom nav-tabs-floating">
            <ul class="nav nav-tabs">
                <li class="active"><a href="{{ route('admin.nodes.view', $node->id) }}">About</a></li>
                <li><a href="{{ route('admin.nodes.view.settings', $node->id) }}">Settings</a></li>
                <li><a href="{{ route('admin.nodes.view.configuration', $node->id) }}">Configuration</a></li>
                <li><a href="{{ route('admin.nodes.view.allocation', $node->id) }}">Allocation</a></li>
                <li><a href="{{ route('admin.nodes.view.servers', $node->id) }}">Servers</a></li>
            </ul>
        </div>
    </div>
</div>

{{-- 1. Top Live KPI Strip --}}
<div class="alx-node-kpis">
    <div class="alx-kpi-card">
        <div class="alx-kpi-top">
            <span class="alx-kpi-label">Real RAM Used</span>
            <span class="alx-kpi-icon" style="background:rgba(16,185,129,0.12);color:#34d399;border:1px solid rgba(16,185,129,0.25);"><i class="fa fa-memory fa-microchip"></i></span>
        </div>
        <div id="kpiMemVal" class="alx-kpi-val">--</div>
        <div id="kpiMemSub" class="alx-kpi-sub">Checking live Wings memory...</div>
    </div>

    <div class="alx-kpi-card">
        <div class="alx-kpi-top">
            <span class="alx-kpi-label">Real Disk Used</span>
            <span class="alx-kpi-icon" style="background:rgba(56,189,248,0.12);color:#38bdf8;border:1px solid rgba(56,189,248,0.25);"><i class="fa fa-hdd-o"></i></span>
        </div>
        <div id="kpiDiskVal" class="alx-kpi-val">--</div>
        <div id="kpiDiskSub" class="alx-kpi-sub">Checking live container disk...</div>
    </div>

    <div class="alx-kpi-card">
        <div class="alx-kpi-top">
            <span class="alx-kpi-label">Active CPU Load</span>
            <span class="alx-kpi-icon" style="background:rgba(168,85,247,0.12);color:#c084fc;border:1px solid rgba(168,85,247,0.25);"><i class="fa fa-tachometer"></i></span>
        </div>
        <div id="kpiCpuVal" class="alx-kpi-val">--%</div>
        <div id="kpiCpuSub" class="alx-kpi-sub">Waiting for Wings CPU telemetry...</div>
    </div>

    <div class="alx-kpi-card">
        <div class="alx-kpi-top">
            <span class="alx-kpi-label">Live Instances</span>
            <span id="liveStatusPill" class="alx-live-pill syncing"><span class="alx-live-dot"></span> SYNCING</span>
        </div>
        <div id="kpiSrvVal" class="alx-kpi-val">-- / {{ $node->servers_count }}</div>
        <div id="kpiSrvSub" class="alx-kpi-sub">Alloc RAM: {{ number_format($memAllocatedGiB, 1) }} GiB &middot; Disk: {{ number_format($diskAllocatedGiB, 1) }} GiB</div>
    </div>
</div>

{{-- 2. Real-Time Resource Telemetry Card --}}
<div class="row">
    <div class="col-xs-12">
        <div class="alx-card">
            <div class="alx-card-header">
                <h3 class="alx-card-title"><i class="fa fa-pie-chart"></i> Real-Time Node Telemetry (RAM, Disk &amp; CPU)</h3>
                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                    <span id="liveUpdatedAt" style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#71717a;">Updating...</span>
                    <button type="button" id="btnRefreshUsage" class="btn btn-xs btn-default" style="border-radius:8px;padding:4px 10px;">
                        <i class="fa fa-refresh" id="iconRefreshUsage"></i> Refresh
                    </button>
                </div>
            </div>
            <div class="alx-card-body" style="padding: 22px 20px;">
                <div class="alx-gauges-grid">
                    {{-- Real Memory Gauge --}}
                    <div class="alx-gauge-box">
                        <h4 class="alx-gauge-heading">Real Memory Usage</h4>
                        <div class="alx-gauge-wrap">
                            <canvas id="chartMem"></canvas>
                            <div class="alx-gauge-center">
                                <div id="memActiveText" class="alx-gauge-num">--</div>
                                <div class="alx-gauge-tag" style="color:#34d399;">Real Used</div>
                            </div>
                        </div>
                        <div class="alx-gauge-meta">
                            <div style="display:flex;justify-content:space-between;gap:8px;">
                                <span>Real: <strong id="memRealInline" style="color:#e2e8f0;">--</strong></span>
                                <span>Total: <strong style="color:#e2e8f0;">{{ number_format($nodeTotalMemGiB, 1) }} GiB</strong></span>
                            </div>
                            <div class="alx-bar-track">
                                <div id="memRealBar" class="alx-bar-fill" style="width:0%;background:#10b981;"></div>
                            </div>
                            <div style="margin-top:7px;font-size:11px;color:#71717a;display:flex;justify-content:space-between;">
                                <span>Allocated Quota: <strong style="color:#38bdf8;">{{ number_format($memAllocatedGiB, 1) }} GiB</strong></span>
                                <span id="memPctText">0%</span>
                            </div>
                        </div>
                    </div>

                    {{-- Real Disk Gauge --}}
                    <div class="alx-gauge-box">
                        <h4 class="alx-gauge-heading">Real Disk Usage</h4>
                        <div class="alx-gauge-wrap">
                            <canvas id="chartDisk"></canvas>
                            <div class="alx-gauge-center">
                                <div id="diskActiveText" class="alx-gauge-num">--</div>
                                <div class="alx-gauge-tag" style="color:#38bdf8;">Real Used</div>
                            </div>
                        </div>
                        <div class="alx-gauge-meta">
                            <div style="display:flex;justify-content:space-between;gap:8px;">
                                <span>Real: <strong id="diskRealInline" style="color:#e2e8f0;">--</strong></span>
                                <span>Total: <strong style="color:#e2e8f0;">{{ number_format($nodeTotalDiskGiB, 1) }} GiB</strong></span>
                            </div>
                            <div class="alx-bar-track">
                                <div id="diskRealBar" class="alx-bar-fill" style="width:0%;background:#0ea5e9;"></div>
                            </div>
                            <div style="margin-top:7px;font-size:11px;color:#71717a;display:flex;justify-content:space-between;">
                                <span>Allocated Quota: <strong style="color:#fbbf24;">{{ number_format($diskAllocatedGiB, 1) }} GiB</strong></span>
                                <span id="diskPctText">0%</span>
                            </div>
                        </div>
                    </div>

                    {{-- Live CPU & Network Gauge --}}
                    <div class="alx-gauge-box">
                        <h4 class="alx-gauge-heading">Live CPU &amp; Network I/O</h4>
                        <div class="alx-gauge-wrap">
                            <canvas id="chartCpu"></canvas>
                            <div class="alx-gauge-center">
                                <div id="cpuActiveText" class="alx-gauge-num">--%</div>
                                <div class="alx-gauge-tag" style="color:#c084fc;">Live CPU</div>
                            </div>
                        </div>
                        <div class="alx-gauge-meta">
                            <div style="display:flex;justify-content:space-between;gap:8px;">
                                <span>RX: <strong id="netRxText" style="color:#38bdf8;">--</strong></span>
                                <span>TX: <strong id="netTxText" style="color:#34d399;">--</strong></span>
                            </div>
                            <div class="alx-bar-track">
                                <div id="cpuRealBar" class="alx-bar-fill" style="width:0%;background:#a855f7;"></div>
                            </div>
                            <div style="margin-top:7px;font-size:11px;color:#71717a;display:flex;justify-content:space-between;">
                                <span id="cpuCapacityText">Host Threads: --</span>
                                <span id="dockerContainersText">Containers: --</span>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Real Remaining Capacity Strip --}}
                <div class="alx-free-grid">
                    <div class="alx-free-card">
                        <div>
                            <div class="alx-free-title">Remaining Real RAM</div>
                            <div class="alx-free-sub">Configured RAM Capacity minus Live Active RAM</div>
                        </div>
                        <div id="ramRemaining" class="alx-free-num">--</div>
                    </div>
                    <div class="alx-free-card">
                        <div>
                            <div class="alx-free-title">Remaining Real Disk Space</div>
                            <div class="alx-free-sub">Configured Disk Capacity minus Live Active Disk</div>
                        </div>
                        <div id="diskRemaining" class="alx-free-num">--</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- 3. Live Top Consumers Table --}}
<div class="row">
    <div class="col-xs-12">
        <div class="alx-card">
            <div class="alx-card-header">
                <h3 class="alx-card-title"><i class="fa fa-bar-chart"></i> Live Container Resource Breakdown</h3>
                <span style="font-size:11.5px;color:#71717a;">Sorted by real RAM &amp; disk usage (top 10 visible servers)</span>
            </div>
            <div class="table-responsive">
                <table class="alx-srv-table">
                    <thead>
                        <tr>
                            <th style="width:110px;">State</th>
                            <th>Server</th>
                            <th>Real RAM Used / Limit</th>
                            <th>Real Disk Used / Limit</th>
                            <th class="text-right" style="width:100px;">Live CPU</th>
                        </tr>
                    </thead>
                    <tbody id="liveServersTbody">
                        <tr>
                            <td colspan="5" class="text-center" style="padding:26px;color:#71717a;">
                                <i class="fa fa-refresh fa-spin" style="margin-right:6px;"></i> Loading live container metrics from Wings...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

{{-- 4. Bottom Complete System Info & Quick Controls --}}
<div class="row">
    <div class="col-md-7">
        <div class="alx-card">
            <div class="alx-card-header">
                <h3 class="alx-card-title"><i class="fa fa-microchip"></i> System &amp; Daemon Information</h3>
                <span id="node-online-badge" style="display:none; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:600; background:rgba(34,197,94,0.15); color:#4ade80; border:1px solid rgba(34,197,94,0.3)">
                    <i class="fa fa-circle" style="font-size:8px"></i> Wings Online
                </span>
            </div>
            <div class="table-responsive">
                <table class="alx-info-table">
                    <tr>
                        <td><i class="fa fa-code-fork" style="margin-right:6px;color:#a3a3a3"></i> Daemon Version</td>
                        <td>
                            <code data-attr="info-version"><i class="fa fa-refresh fa-spin fa-fw"></i></code>
                            <span style="color:#64748b; font-size:12px"> — Latest: <code>{{ $version->getDaemon() }}</code></span>
                        </td>
                    </tr>
                    <tr>
                        <td><i class="fa fa-linux" style="margin-right:6px;color:#a3a3a3"></i> Operating System</td>
                        <td data-attr="info-system"><i class="fa fa-refresh fa-spin fa-fw" style="color:#64748b"></i></td>
                    </tr>
                    <tr>
                        <td><i class="fa fa-tasks" style="margin-right:6px;color:#a3a3a3"></i> CPU &amp; Host RAM</td>
                        <td>
                            <span data-attr="info-cpus"><i class="fa fa-refresh fa-spin fa-fw" style="color:#64748b"></i></span>
                            <span id="hostPhysicalRam" style="color:#94a3b8;font-size:12px;margin-left:8px;"></span>
                        </td>
                    </tr>
                    <tr>
                        <td><i class="fa fa-cubes" style="margin-right:6px;color:#a3a3a3"></i> Docker Engine</td>
                        <td id="hostDockerVersion"><span style="color:#64748b;">Checking...</span></td>
                    </tr>
                    <tr>
                        <td><i class="fa fa-globe" style="margin-right:6px;color:#a3a3a3"></i> Daemon Endpoint</td>
                        <td>
                            <code>{{ $node->scheme }}://{{ $node->fqdn }}:{{ $node->daemonListen }}</code>
                            @if($node->behind_proxy)
                                <span class="label label-info" style="margin-left:6px;">Behind Proxy</span>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td><i class="fa fa-folder-open" style="margin-right:6px;color:#a3a3a3"></i> SFTP &amp; Upload Limit</td>
                        <td>
                            <code>Port {{ $node->daemonSFTP }}</code>
                            <span style="color:#64748b;margin:0 6px;">&middot;</span>
                            <code>Max Upload {{ $node->upload_size }} MiB</code>
                        </td>
                    </tr>
                    <tr>
                        <td><i class="fa fa-map-marker" style="margin-right:6px;color:#a3a3a3"></i> Location</td>
                        <td><code>{{ $node->location->short }}</code> <span style="color:#a1a1aa;margin-left:6px;">{{ $node->location->long }}</span></td>
                    </tr>
                </table>
            </div>
        </div>

        @if ($node->description)
            <div class="alx-desc-card">
                <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; color:#64748b; margin-bottom:10px">
                    <i class="fa fa-align-left" style="margin-right:5px"></i>Description
                </div>
                <pre>{{ $node->description }}</pre>
            </div>
        @endif
    </div>

    <div class="col-md-5">
        <div class="alx-card" style="margin-bottom: 20px;">
            <div class="alx-card-header">
                <h3 class="alx-card-title"><i class="fa fa-server"></i> Node Overview</h3>
            </div>
            <div class="alx-card-body" style="padding: 18px 20px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                    <div><i class="fa fa-server" style="color:#a3a3a3;margin-right:8px;"></i> <strong>Total Servers</strong></div>
                    <div style="font-size:16px;font-weight:700;color:#e2e8f0;font-family:'JetBrains Mono',monospace;">{{ $node->servers_count }}</div>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                    <div><i class="fa fa-{{ $node->maintenance_mode ? 'wrench' : 'check-circle' }}" style="color:{{ $node->maintenance_mode ? '#fbbf24' : '#34d399' }};margin-right:8px;"></i> <strong>Status</strong></div>
                    <div style="font-size:13.5px;font-weight:700;color:{{ $node->maintenance_mode ? '#fbbf24' : '#34d399' }};">
                        {{ $node->maintenance_mode ? 'Maintenance' : 'Operational' }}
                    </div>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <div><i class="fa fa-eye" style="color:#a3a3a3;margin-right:8px;"></i> <strong>Visibility</strong></div>
                    <div style="font-size:13.5px;font-weight:600;color:{{ $node->public ? '#38bdf8' : '#a1a1aa' }};">
                        {{ $node->public ? 'Public Auto-Deploy' : 'Private Node' }}
                    </div>
                </div>

                @if($isSuperAdmin)
                    <div class="alx-quick-actions">
                        <a href="{{ route('admin.nodes.view.settings', $node->id) }}" class="alx-quick-btn">
                            <i class="fa fa-sliders"></i> Settings
                        </a>
                        <a href="{{ route('admin.nodes.view.configuration', $node->id) }}" class="alx-quick-btn">
                            <i class="fa fa-terminal"></i> Configuration
                        </a>
                        <a href="{{ route('admin.nodes.view.allocation', $node->id) }}" class="alx-quick-btn">
                            <i class="fa fa-plug"></i> Allocations
                        </a>
                        <a href="{{ route('admin.nodes.view.servers', $node->id) }}" class="alx-quick-btn">
                            <i class="fa fa-list"></i> Node Servers
                        </a>
                    </div>
                @endif
            </div>
        </div>

        <div class="alx-danger-card">
            <div class="alx-danger-header"><i class="fa fa-trash"></i> Danger Zone — Delete Node</div>
            <div class="alx-danger-body">
                Deleting a node is <strong>irreversible</strong> and will immediately remove this node from the panel.
                There must be <strong>no servers</strong> associated with this node before proceeding.
            </div>
            <div class="alx-danger-footer">
                <form action="{{ route('admin.nodes.view.delete', $node->id) }}" method="POST">
                    {!! csrf_field() !!}
                    {!! method_field('DELETE') !!}
                    <button type="submit" class="alx-btn-danger" {{ ($node->servers_count < 1 && $isSuperAdmin) ? '' : 'disabled' }}>
                        <i class="fa fa-trash"></i> Delete This Node
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
    <script>
    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str === null || str === undefined ? '' : String(str)));
        return div.innerHTML;
    }

    function formatBytes(bytes) {
        bytes = Number(bytes) || 0;
        if (bytes <= 0) return '0 MiB';
        var gib = bytes / (1024 * 1024 * 1024);
        if (gib >= 10) return gib.toFixed(1) + ' GiB';
        if (gib >= 1) return gib.toFixed(2) + ' GiB';
        var mib = bytes / (1024 * 1024);
        return Math.round(mib) + ' MiB';
    }

    function formatNetBytes(bytes) {
        bytes = Number(bytes) || 0;
        if (bytes <= 0) return '0 B';
        var units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
        var i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
        var val = bytes / Math.pow(1024, i);
        return (val >= 10 || i === 0 ? val.toFixed(1) : val.toFixed(2)) + ' ' + units[i];
    }

    var nodePhysicalCores = 1;
    var nodeTotalMemBytes = {{ (int) $node->memory }} * 1024 * 1024;
    var nodeTotalDiskBytes = {{ (int) $node->disk }} * 1024 * 1024;

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Plus Jakarta Sans', 'Inter', sans-serif";

    function buildDoughnut(canvasId, primaryColor) {
        return new Chart(document.getElementById(canvasId), {
            type: 'doughnut',
            data: {
                labels: ['Used', 'Free'],
                datasets: [{
                    data: [0, 100],
                    backgroundColor: [primaryColor, 'rgba(255, 255, 255, 0.06)'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '76%',
                animation: { duration: 350 },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 15, 19, 0.96)',
                        titleColor: '#fff',
                        bodyColor: '#cbd5e1',
                        borderColor: 'rgba(56, 189, 248, 0.35)',
                        borderWidth: 1,
                        callbacks: {
                            label: function (ctx) {
                                var suffix = canvasId === 'chartCpu' ? '%' : ' GiB';
                                return ' ' + ctx.label + ': ' + Number(ctx.raw).toFixed(2) + suffix;
                            }
                        }
                    }
                }
            }
        });
    }

    var chartMem = buildDoughnut('chartMem', '#10b981');
    var chartDisk = buildDoughnut('chartDisk', '#0ea5e9');
    var chartCpu = buildDoughnut('chartCpu', '#a855f7');

    (function getInformation() {
        $.ajax({
            method: 'GET',
            url: '/admin/nodes/view/{{ $node->id }}/system-information',
            timeout: 5000
        }).done(function (data) {
            $('[data-attr="info-version"]').html(escapeHtml(data.version));
            $('[data-attr="info-system"]').html(
                '<span style="color:#e2e8f0">' + escapeHtml(data.system.type) + '</span>' +
                ' <span style="color:#64748b">(' + escapeHtml(data.system.arch) + ')</span>' +
                ' <code>' + escapeHtml(data.system.release) + '</code>'
            );
            $('[data-attr="info-cpus"]').html(
                '<span style="color:#e2e8f0; font-weight:600">' + escapeHtml(data.system.cpus) + '</span>' +
                ' <span style="color:#64748b; font-size:12px">logical cores</span>'
            );
            $('#node-online-badge').fadeIn(200);
            if (data.system && data.system.cpus > 0) {
                nodePhysicalCores = Number(data.system.cpus);
            }
        }).fail(function () {
            $('[data-attr="info-version"]').html('<span style="color:#f87171">Unreachable</span>');
        }).always(function () {
            setTimeout(getInformation, 15000);
        });
    })();

    var liveTimer = null;

    function renderLiveUsage(data) {
        var pill = $('#liveStatusPill');
        if (data.reachable) {
            pill.removeClass('offline syncing').addClass('online').html('<span class="alx-live-dot"></span> LIVE &middot; 5s');
        } else {
            pill.removeClass('online syncing').addClass('offline').html('<span class="alx-live-dot"></span> OFFLINE');
        }

        var memBytes = Number(data.real.memory_bytes) || 0;
        var diskBytes = Number(data.real.disk_bytes) || 0;
        var cpuPct = Number(data.real.cpu_percent) || 0;
        var hostThreads = (data.host && data.host.cpu_threads > 0) ? Number(data.host.cpu_threads) : nodePhysicalCores;
        nodePhysicalCores = hostThreads;

        var memGiB = memBytes / (1024 * 1024 * 1024);
        var totalMemGiB = nodeTotalMemBytes / (1024 * 1024 * 1024);
        var freeMemBytes = Math.max(0, nodeTotalMemBytes - memBytes);
        var memPct = totalMemGiB > 0 ? Math.min(100, (memGiB / totalMemGiB) * 100) : 0;

        var diskGiB = diskBytes / (1024 * 1024 * 1024);
        var totalDiskGiB = nodeTotalDiskBytes / (1024 * 1024 * 1024);
        var freeDiskBytes = Math.max(0, nodeTotalDiskBytes - diskBytes);
        var diskPct = totalDiskGiB > 0 ? Math.min(100, (diskGiB / totalDiskGiB) * 100) : 0;

        var maxCpu = Math.max(100, hostThreads * 100);
        var cpuNormalizedPct = Math.min(100, (cpuPct / maxCpu) * 100);

        var memColor = memPct >= 90 ? '#ef4444' : (memPct >= 75 ? '#f59e0b' : '#10b981');
        var diskColor = diskPct >= 90 ? '#ef4444' : (diskPct >= 75 ? '#f59e0b' : '#0ea5e9');

        // KPI Cards
        $('#kpiMemVal').text(formatBytes(memBytes));
        $('#kpiMemSub').text(memPct.toFixed(1) + '% of ' + totalMemGiB.toFixed(1) + ' GiB (Free: ' + formatBytes(freeMemBytes) + ')');

        $('#kpiDiskVal').text(formatBytes(diskBytes));
        $('#kpiDiskSub').text(diskPct.toFixed(1) + '% of ' + totalDiskGiB.toFixed(1) + ' GiB (Free: ' + formatBytes(freeDiskBytes) + ')');

        $('#kpiCpuVal').text(cpuPct.toFixed(1) + '%');
        $('#kpiCpuSub').text(cpuNormalizedPct.toFixed(1) + '% across ' + hostThreads + ' host threads');

        var counts = data.counts || { total: 0, running: 0, starting: 0, offline: 0 };
        var activeCount = (Number(counts.running) || 0) + (Number(counts.starting) || 0);
        $('#kpiSrvVal').text(activeCount + ' / ' + counts.total + ' Active');
        $('#kpiSrvSub').text(counts.running + ' running · ' + counts.starting + ' starting · ' + counts.offline + ' offline');

        // Doughnuts & Bars
        $('#memActiveText').text(formatBytes(memBytes));
        $('#memRealInline').text(formatBytes(memBytes));
        $('#memPctText').text(memPct.toFixed(1) + '%');
        $('#memRealBar').css({ width: memPct.toFixed(1) + '%', background: memColor });
        chartMem.data.datasets[0].backgroundColor[0] = memColor;
        chartMem.data.datasets[0].data = [memGiB, Math.max(0, totalMemGiB - memGiB)];
        chartMem.update();

        $('#diskActiveText').text(formatBytes(diskBytes));
        $('#diskRealInline').text(formatBytes(diskBytes));
        $('#diskPctText').text(diskPct.toFixed(1) + '%');
        $('#diskRealBar').css({ width: diskPct.toFixed(1) + '%', background: diskColor });
        chartDisk.data.datasets[0].backgroundColor[0] = diskColor;
        chartDisk.data.datasets[0].data = [diskGiB, Math.max(0, totalDiskGiB - diskGiB)];
        chartDisk.update();

        $('#cpuActiveText').text(cpuPct.toFixed(1) + '%');
        $('#netRxText').text(formatNetBytes(data.real.network_rx_bytes));
        $('#netTxText').text(formatNetBytes(data.real.network_tx_bytes));
        $('#cpuRealBar').css({ width: cpuNormalizedPct.toFixed(1) + '%' });
        $('#cpuCapacityText').text('Host Threads: ' + hostThreads + ' (' + maxCpu + '% max)');
        var dockerContainers = (data.host && data.host.containers) ? data.host.containers : null;
        $('#dockerContainersText').text('Containers: ' + (dockerContainers ? (dockerContainers.running + '/' + dockerContainers.total) : (counts.running + '/' + counts.total)));
        chartCpu.data.datasets[0].data = [cpuPct, Math.max(0, maxCpu - cpuPct)];
        chartCpu.update();

        // Remaining Real Free Capacity
        $('#ramRemaining').text(formatBytes(freeMemBytes)).css('color', memPct >= 90 ? '#f87171' : '#34d399');
        $('#diskRemaining').text(formatBytes(freeDiskBytes)).css('color', diskPct >= 90 ? '#f87171' : '#34d399');

        // Extra Host Info
        if (data.host) {
            if (data.host.docker_version) {
                $('#hostDockerVersion').html('<code>' + escapeHtml(data.host.docker_version) + '</code>');
            }
            if (data.host.memory_bytes > 0) {
                $('#hostPhysicalRam').text('(Host Physical: ' + formatBytes(data.host.memory_bytes) + ')');
            }
        }

        // Top Servers Breakdown Table
        var tbody = $('#liveServersTbody');
        if (!data.servers || data.servers.length === 0) {
            tbody.html('<tr><td colspan="5" class="text-center" style="padding:26px;color:#71717a;">No servers available on this node.</td></tr>');
        } else {
            var rows = '';
            for (var i = 0; i < data.servers.length; i++) {
                var srv = data.servers[i];
                var stateCls = srv.state === 'running' ? 'alx-state-running' : (srv.state === 'starting' || srv.state === 'stopping' ? 'alx-state-starting' : 'alx-state-offline');
                var memLimitBytes = (Number(srv.memory_limit_mb) || 0) * 1024 * 1024;
                var diskLimitBytes = (Number(srv.disk_limit_mb) || 0) * 1024 * 1024;
                var memRatio = memLimitBytes > 0 ? Math.min(100, (srv.memory_bytes / memLimitBytes) * 100) : 0;
                var diskRatio = diskLimitBytes > 0 ? Math.min(100, (srv.disk_bytes / diskLimitBytes) * 100) : 0;

                rows += '<tr>' +
                    '<td><span class="alx-state-pill ' + stateCls + '">' + escapeHtml(srv.state) + '</span></td>' +
                    '<td>' +
                        '<a href="' + escapeHtml(srv.url) + '" style="font-weight:700;color:#f4f4f5;">' + escapeHtml(srv.name) + '</a>' +
                        '<div style="font-size:11px;color:#71717a;font-family:JetBrains Mono,monospace;">' + escapeHtml(srv.uuidShort) + '</div>' +
                    '</td>' +
                    '<td style="min-width:170px;">' +
                        '<div style="font-family:JetBrains Mono,monospace;font-size:12px;color:#e2e8f0;">' +
                            formatBytes(srv.memory_bytes) +
                            ' <span style="color:#64748b;">/ ' + (srv.memory_limit_mb > 0 ? formatBytes(memLimitBytes) : 'Unlimited') + '</span>' +
                        '</div>' +
                        '<div class="alx-bar-track" style="height:4px;margin-top:5px;"><div class="alx-bar-fill" style="width:' + memRatio.toFixed(0) + '%;background:#10b981;"></div></div>' +
                    '</td>' +
                    '<td style="min-width:170px;">' +
                        '<div style="font-family:JetBrains Mono,monospace;font-size:12px;color:#e2e8f0;">' +
                            formatBytes(srv.disk_bytes) +
                            ' <span style="color:#64748b;">/ ' + (srv.disk_limit_mb > 0 ? formatBytes(diskLimitBytes) : 'Unlimited') + '</span>' +
                        '</div>' +
                        '<div class="alx-bar-track" style="height:4px;margin-top:5px;"><div class="alx-bar-fill" style="width:' + diskRatio.toFixed(0) + '%;background:#0ea5e9;"></div></div>' +
                    '</td>' +
                    '<td class="text-right" style="font-family:JetBrains Mono,monospace;font-weight:700;color:#c084fc;">' + Number(srv.cpu).toFixed(1) + '%</td>' +
                '</tr>';
            }
            tbody.html(rows);
        }

        if (data.updated_at) {
            var d = new Date(data.updated_at);
            $('#liveUpdatedAt').text('Updated ' + d.toLocaleTimeString());
        }
    }

    function fetchLiveUsage(forceRefresh) {
        if (liveTimer) {
            clearTimeout(liveTimer);
            liveTimer = null;
        }
        $('#iconRefreshUsage').addClass('fa-spin');

        $.ajax({
            method: 'GET',
            url: '/admin/nodes/view/{{ $node->id }}/live-usage' + (forceRefresh ? '?refresh=1' : ''),
            timeout: 8000
        }).done(function (data) {
            renderLiveUsage(data);
        }).fail(function () {
            $('#liveStatusPill').removeClass('online syncing').addClass('offline').html('<span class="alx-live-dot"></span> UNREACHABLE');
            $('#liveUpdatedAt').text('Wings telemetry failed');
        }).always(function () {
            $('#iconRefreshUsage').removeClass('fa-spin');
            liveTimer = setTimeout(function () { fetchLiveUsage(false); }, 5000);
        });
    }

    $('#btnRefreshUsage').on('click', function () {
        fetchLiveUsage(true);
    });

    fetchLiveUsage(false);
    </script>
@endsection
