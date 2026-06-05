@extends('layouts.admin')

@section('title')
    {{ $node->name }}
@endsection

@section('content-header')
    <h1>{{ $node->name }}<small>A quick overview of your node.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.nodes') }}">Nodes</a></li>
        <li class="active">{{ $node->name }}</li>
    </ol>
@endsection

@section('content')
<style>
/* ─── KDE Plasma System Monitor Inspired ─── */
.alx-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 20px;
    background: rgba(15,23,42,0.6);
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 10px;
    padding: 6px;
}
.alx-tab {
    padding: 8px 18px;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
    text-decoration: none;
    transition: all 0.2s;
    border: 1px solid transparent;
}
.alx-tab:hover { color: #a5b4fc; background: rgba(99,102,241,0.1); text-decoration: none; }
.alx-tab.active {
    background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15));
    border-color: rgba(99,102,241,0.4);
    color: #a5b4fc;
}

/* Info card */
.alx-card {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
    overflow: hidden;
    margin-bottom: 20px;
}
.alx-card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 22px;
    border-bottom: 1px solid rgba(99,102,241,0.15);
    background: rgba(99,102,241,0.05);
}
.alx-card-title { font-size:14px; font-weight:600; color:#e2e8f0; display:flex; align-items:center; gap:8px; margin:0; }
.alx-card-title i { color:#818cf8; }

.alx-info-table { width:100%; border-collapse:collapse; }
.alx-info-table tr { border-bottom:1px solid rgba(255,255,255,0.04); }
.alx-info-table tr:last-child { border-bottom:none; }
.alx-info-table td { padding:14px 22px; font-size:13px; vertical-align:middle; }
.alx-info-table td:first-child { color:#64748b; font-weight:500; width:40%; }
.alx-info-table td:last-child { color:#e2e8f0; }
.alx-info-table td code {
    background: rgba(15,23,42,0.8); border:1px solid rgba(99,102,241,0.2);
    border-radius:4px; padding:2px 7px; font-size:11px; color:#7dd3fc;
}

/* ─── KDE Plasma Task Manager Resource Cards ─── */
.alx-resource-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    padding: 20px;
}
.alx-resource-card {
    background: rgba(15,23,42,0.6);
    border: 1px solid rgba(99,102,241,0.15);
    border-radius: 10px;
    padding: 18px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s;
}
.alx-resource-card:hover { border-color: rgba(99,102,241,0.4); }
.alx-resource-card::before {
    content: '';
    position: absolute; top:0; left:0; right:0; height:2px;
    border-radius: 10px 10px 0 0;
}
.alx-res-disk::before { background: linear-gradient(90deg, #6366f1, #8b5cf6); }
.alx-res-memory::before { background: linear-gradient(90deg, #06b6d4, #3b82f6); }
.alx-res-servers::before { background: linear-gradient(90deg, #10b981, #34d399); }
.alx-res-maint::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

.alx-resource-icon {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; margin-bottom: 12px;
}
.alx-res-disk .alx-resource-icon { background: rgba(99,102,241,0.15); color: #818cf8; }
.alx-res-memory .alx-resource-icon { background: rgba(6,182,212,0.15); color: #22d3ee; }
.alx-res-servers .alx-resource-icon { background: rgba(16,185,129,0.15); color: #34d399; }
.alx-res-maint .alx-resource-icon { background: rgba(245,158,11,0.15); color: #fbbf24; }

.alx-resource-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #475569; margin-bottom: 6px; }
.alx-resource-value { font-size: 20px; font-weight: 700; color: #e2e8f0; margin-bottom: 4px; line-height: 1; }
.alx-resource-sub { font-size: 11px; color: #64748b; margin-bottom: 14px; }

/* KDE-style progress bar */
.alx-progress-wrap {
    height: 6px;
    background: rgba(255,255,255,0.06);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 4px;
}
.alx-progress-bar {
    height: 100%;
    border-radius: 3px;
    transition: width 0.6s ease;
    position: relative;
}
.alx-res-disk .alx-progress-bar { background: linear-gradient(90deg, #6366f1, #8b5cf6); }
.alx-res-memory .alx-progress-bar { background: linear-gradient(90deg, #06b6d4, #3b82f6); }
.alx-progress-bar::after {
    content: '';
    position: absolute; top:0; left:0; right:0; bottom:0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
}
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.alx-progress-label { font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }

/* danger zone */
.alx-danger-card {
    background: rgba(239,68,68,0.04);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 20px;
}
.alx-danger-header {
    padding: 14px 22px;
    border-bottom: 1px solid rgba(239,68,68,0.15);
    background: rgba(239,68,68,0.06);
    font-size: 13px; font-weight: 600; color: #f87171;
    display: flex; align-items: center; gap: 8px;
}
.alx-danger-body { padding: 16px 22px; font-size: 13px; color: #94a3b8; }
.alx-danger-footer { padding: 12px 22px; border-top: 1px solid rgba(239,68,68,0.1); display: flex; justify-content: flex-end; }
.alx-btn-danger {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 500;
    background: rgba(239,68,68,0.15); color: #f87171;
    border: 1px solid rgba(239,68,68,0.3); cursor: pointer;
    transition: all 0.2s; text-decoration: none;
}
.alx-btn-danger:hover { background: rgba(239,68,68,0.25); color: #fca5a5; }
.alx-btn-danger:disabled, .alx-btn-danger[disabled] { opacity: 0.4; cursor: not-allowed; pointer-events: none; }

/* description */
.alx-desc-card {
    background: rgba(15,23,42,0.4);
    border: 1px solid rgba(99,102,241,0.1);
    border-radius: 12px; padding: 18px 22px;
    margin-bottom: 20px;
}
.alx-desc-card pre { color: #94a3b8; font-size: 13px; margin: 0; white-space: pre-wrap; }
</style>

<div class="row">
    <div class="col-xs-12">
        <div class="alx-tabs">
            <a href="{{ route('admin.nodes.view', $node->id) }}" class="alx-tab active">About</a>
            <a href="{{ route('admin.nodes.view.settings', $node->id) }}" class="alx-tab">Settings</a>
            <a href="{{ route('admin.nodes.view.configuration', $node->id) }}" class="alx-tab">Configuration</a>
            <a href="{{ route('admin.nodes.view.allocation', $node->id) }}" class="alx-tab">Allocation</a>
            <a href="{{ route('admin.nodes.view.servers', $node->id) }}" class="alx-tab">Servers</a>
        </div>
    </div>
</div>

<div class="row">
    {{-- LEFT COL ─ System Info --}}
    <div class="col-sm-8">
        {{-- System Information --}}
        <div class="alx-card">
            <div class="alx-card-header">
                <h3 class="alx-card-title"><i class="fa fa-microchip"></i> System Information</h3>
                <span id="node-online-badge" style="display:none; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:600; background:rgba(34,197,94,0.15); color:#4ade80; border:1px solid rgba(34,197,94,0.3)">
                    <i class="fa fa-circle" style="font-size:8px"></i> Online
                </span>
            </div>
            <table class="alx-info-table">
                <tr>
                    <td><i class="fa fa-code-fork" style="margin-right:6px;color:#818cf8"></i> Daemon Version</td>
                    <td>
                        <code data-attr="info-version"><i class="fa fa-refresh fa-spin fa-fw"></i></code>
                        <span style="color:#475569; font-size:12px"> — Latest: <code>{{ $version->getDaemon() }}</code></span>
                    </td>
                </tr>
                <tr>
                    <td><i class="fa fa-linux" style="margin-right:6px;color:#818cf8"></i> OS</td>
                    <td data-attr="info-system"><i class="fa fa-refresh fa-spin fa-fw" style="color:#64748b"></i></td>
                </tr>
                <tr>
                    <td><i class="fa fa-tasks" style="margin-right:6px;color:#818cf8"></i> CPU Threads</td>
                    <td data-attr="info-cpus"><i class="fa fa-refresh fa-spin fa-fw" style="color:#64748b"></i></td>
                </tr>
                <tr>
                    <td><i class="fa fa-globe" style="margin-right:6px;color:#818cf8"></i> Address</td>
                    <td><code>{{ $node->fqdn }}:{{ $node->daemonListen }}</code></td>
                </tr>
            </table>
        </div>

        {{-- Description --}}
        @if ($node->description)
            <div class="alx-desc-card">
                <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; color:#64748b; margin-bottom:10px">
                    <i class="fa fa-align-left" style="margin-right:5px"></i>Description
                </div>
                <pre>{{ $node->description }}</pre>
            </div>
        @endif

        {{-- Delete --}}
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
                    <button type="submit" class="alx-btn-danger" {{ ($node->servers_count < 1) ?: 'disabled' }}>
                        <i class="fa fa-trash"></i> Delete This Node
                    </button>
                </form>
            </div>
        </div>
    </div>

    {{-- RIGHT COL ─ KDE Plasma-style Resource Monitor --}}
    <div class="col-sm-4">
        <div class="alx-card">
            <div class="alx-card-header">
                <h3 class="alx-card-title"><i class="fa fa-bar-chart"></i> Resource Allocation</h3>
            </div>
            <div class="alx-resource-grid">
                {{-- Disk --}}
                <div class="alx-resource-card alx-res-disk">
                    <div class="alx-resource-icon"><i class="fa fa-hdd-o"></i></div>
                    <div class="alx-resource-label">Disk Space</div>
                    @php
                        $diskVal = (float) str_replace(',', '', $stats['disk']['value']);
                        $diskMax = (float) str_replace(',', '', $stats['disk']['max']);
                    @endphp
                    <div class="alx-resource-value">{{ number_format($diskVal / 1024, 1) }} GiB</div>
                    <div class="alx-resource-sub">of {{ number_format($diskMax / 1024, 1) }} GiB allocated</div>
                    <div class="alx-progress-wrap">
                        <div class="alx-progress-bar" style="width: {{ min(100, $stats['disk']['percent']) }}%"></div>
                    </div>
                    <div class="alx-progress-label">
                        <span>{{ round($stats['disk']['percent']) }}% used</span>
                        <span>{{ number_format(max(0, $diskMax - $diskVal) / 1024, 1) }} GiB free</span>
                    </div>
                </div>

                {{-- Memory --}}
                <div class="alx-resource-card alx-res-memory">
                    <div class="alx-resource-icon"><i class="fa fa-database"></i></div>
                    <div class="alx-resource-label">Memory</div>
                    @php
                        $memVal = (float) str_replace(',', '', $stats['memory']['value']);
                        $memMax = (float) str_replace(',', '', $stats['memory']['max']);
                    @endphp
                    <div class="alx-resource-value">{{ number_format($memVal / 1024, 1) }} GiB</div>
                    <div class="alx-resource-sub">of {{ number_format($memMax / 1024, 1) }} GiB allocated</div>
                    <div class="alx-progress-wrap">
                        <div class="alx-progress-bar" style="width: {{ min(100, $stats['memory']['percent']) }}%"></div>
                    </div>
                    <div class="alx-progress-label">
                        <span>{{ round($stats['memory']['percent']) }}% used</span>
                        <span>{{ number_format(max(0, $memMax - $memVal) / 1024, 1) }} GiB free</span>
                    </div>
                </div>

                {{-- Servers --}}
                <div class="alx-resource-card alx-res-servers">
                    <div class="alx-resource-icon"><i class="fa fa-server"></i></div>
                    <div class="alx-resource-label">Total Servers</div>
                    <div class="alx-resource-value">{{ $node->servers_count }}</div>
                    <div class="alx-resource-sub">deployed on this node</div>
                </div>

                {{-- Status --}}
                <div class="alx-resource-card alx-res-maint">
                    <div class="alx-resource-icon"><i class="fa fa-{{ $node->maintenance_mode ? 'wrench' : 'check-circle' }}"></i></div>
                    <div class="alx-resource-label">Node Status</div>
                    <div class="alx-resource-value" style="font-size:16px; color: {{ $node->maintenance_mode ? '#fbbf24' : '#34d399' }}">
                        {{ $node->maintenance_mode ? 'Maintenance' : 'Operational' }}
                    </div>
                    <div class="alx-resource-sub">{{ $node->public ? 'Public node' : 'Private node' }} · {{ $node->scheme === 'https' ? 'SSL enabled' : 'No SSL' }}</div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>
    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    (function getInformation() {
        $.ajax({
            method: 'GET',
            url: '/admin/nodes/view/{{ $node->id }}/system-information',
            timeout: 5000,
        }).done(function (data) {
            $('[data-attr="info-version"]').html(escapeHtml(data.version));
            $('[data-attr="info-system"]').html(
                '<span style="color:#e2e8f0">' + escapeHtml(data.system.type) + '</span>' +
                ' <span style="color:#64748b">(' + escapeHtml(data.system.arch) + ')</span>' +
                ' <code>' + escapeHtml(data.system.release) + '</code>'
            );
            $('[data-attr="info-cpus"]').html(
                '<span style="color:#e2e8f0; font-weight:600">' + data.system.cpus + '</span>' +
                ' <span style="color:#64748b; font-size:12px">logical cores</span>'
            );
            $('#node-online-badge').fadeIn(200);
        }).fail(function () {
            $('[data-attr="info-version"]').html('<span style="color:#f87171">Unreachable</span>');
        }).always(function() {
            setTimeout(getInformation, 10000);
        });
    })();
    </script>
@endsection
