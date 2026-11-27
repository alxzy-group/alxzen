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
/* Info card (Obsidian + Electric Cyan Bento) */
.alx-card {
    background: #0f0f12;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    margin-bottom: 20px;
}
.alx-card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 15px 22px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.015);
}
.alx-card-title { font-size:15px; font-weight:700; color:#ffffff; display:flex; align-items:center; gap:9px; margin:0; letter-spacing: -0.01em; }
.alx-card-title i { color:#38bdf8; font-size:14px; }

.alx-info-table { width:100%; border-collapse:collapse; min-width: 480px; }
.alx-info-table tr { border-bottom:1px solid rgba(255, 255, 255, 0.04); }
.alx-info-table tr:last-child { border-bottom:none; }
.alx-info-table td { padding:14px 22px; font-size:13px; vertical-align:middle; }
.alx-info-table td:first-child { color:#a1a1aa; font-weight:600; width:40%; }
.alx-info-table td:last-child { color:#f4f4f5; }
.alx-info-table td code {
    background: #09090b; border:1px solid rgba(56, 189, 248, 0.25);
    border-radius:6px; padding:2px 8px; font-size:12px; color:#38bdf8;
}

/* danger zone */
.alx-danger-card {
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.25);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 20px;
}
.alx-danger-header {
    padding: 15px 22px;
    border-bottom: 1px solid rgba(239, 68, 68, 0.14);
    background: rgba(239, 68, 68, 0.06);
    font-size: 14px; font-weight: 700; color: #f87171;
    display: flex; align-items: center; gap: 8px;
}
.alx-danger-body { padding: 16px 22px; font-size: 13px; color: #e4e4e7; line-height: 1.6; }
.alx-danger-footer { padding: 14px 22px; border-top: 1px solid rgba(239, 68, 68, 0.14); display: flex; justify-content: flex-end; }
.alx-btn-danger {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 9px; font-size: 13px; font-weight: 600;
    background: #ef4444; color: #fff;
    border: 1px solid transparent; cursor: pointer;
    transition: all 0.15s; text-decoration: none;
}
.alx-btn-danger:hover { background: #dc2626; color: #fff; }
.alx-btn-danger:disabled, .alx-btn-danger[disabled] { opacity: 0.4; cursor: not-allowed; pointer-events: none; }

/* description */
.alx-desc-card {
    background: #0f0f12;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px; padding: 18px 22px;
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

<div class="row">
    <div class="col-xs-12">
        <div class="alx-card">
            <div class="alx-card-header">
                <h3 class="alx-card-title"><i class="fa fa-pie-chart"></i> Node Resource Allocation</h3>
            </div>
            <div class="alx-card-body" style="padding: 26px 16px;">
                <div style="display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; padding-bottom: 12px;">
                    {{-- Memory Chart --}}
                    <div style="flex: 1 1 260px; max-width: 420px; text-align: center; margin: 0 auto;">
                        <h4 style="color: #e2e8f0; font-weight: 600; margin-bottom: 20px;">Memory Usage (GiB)</h4>
                        <div style="position: relative; width: 200px; height: 200px; margin: 0 auto;">
                            <canvas id="chartMem"></canvas>
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                                <div id="memActiveText" style="font-size: 20px; font-weight: 700; color: #fff;">-- GiB</div>
                                <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Allocated</div>
                            </div>
                        </div>
                        <p id="memSubText" style="margin-top: 15px; font-size: 13px; color: #94a3b8;">-- allocated of {{ number_format($node->memory / 1024, 1) }} GiB Total</p>
                    </div>

                    {{-- Disk Chart --}}
                    <div style="flex: 1 1 260px; max-width: 420px; text-align: center; margin: 0 auto;">
                        <h4 style="color: #e2e8f0; font-weight: 600; margin-bottom: 20px;">Disk Space Usage (GiB)</h4>
                        <div style="position: relative; width: 200px; height: 200px; margin: 0 auto;">
                            <canvas id="chartDisk"></canvas>
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                                <div id="diskActiveText" style="font-size: 20px; font-weight: 700; color: #fff;">-- GiB</div>
                                <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Allocated</div>
                            </div>
                        </div>
                        <p id="diskSubText" style="margin-top: 15px; font-size: 13px; color: #94a3b8;">-- allocated of {{ number_format($node->disk / 1024, 1) }} GiB Total</p>
                    </div>
                </div>

                {{-- Status Widget --}}
                <div style="margin-top: 28px; padding: 20px; background: #16161b; border: 1px solid rgba(56, 189, 248, 0.18); border-radius: 12px; text-align: center;">
                    <h4 style="margin: 0; color: #a1a1aa; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">Remaining Physical Disk Space</h4>
                    <div id="diskRemaining" style="font-size: 28px; font-weight: 700; color: #34d399; margin-top: 8px; font-variant-numeric: tabular-nums;">-- GiB</div>
                    <div style="font-size: 12px; color: #71717a; margin-top: 5px;">(Total Node Capacity minus Real-Time Active Usage)</div>
                </div>
            </div>
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
            <div class="table-responsive">
                <table class="alx-info-table">
                    <tr>
                        <td><i class="fa fa-code-fork" style="margin-right:6px;color:#a3a3a3"></i> Daemon Version</td>
                        <td>
                            <code data-attr="info-version"><i class="fa fa-refresh fa-spin fa-fw"></i></code>
                            <span style="color:#475569; font-size:12px"> — Latest: <code>{{ $version->getDaemon() }}</code></span>
                        </td>
                    </tr>
                    <tr>
                        <td><i class="fa fa-linux" style="margin-right:6px;color:#a3a3a3"></i> OS</td>
                        <td data-attr="info-system"><i class="fa fa-refresh fa-spin fa-fw" style="color:#64748b"></i></td>
                    </tr>
                    <tr>
                        <td><i class="fa fa-tasks" style="margin-right:6px;color:#a3a3a3"></i> CPU Threads</td>
                        <td data-attr="info-cpus"><i class="fa fa-refresh fa-spin fa-fw" style="color:#64748b"></i></td>
                    </tr>
                    <tr>
                        <td><i class="fa fa-globe" style="margin-right:6px;color:#a3a3a3"></i> Address</td>
                        <td><code>{{ $node->fqdn }}:{{ $node->daemonListen }}</code></td>
                    </tr>
                </table>
            </div>
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
    </div>

    {{-- RIGHT COL ─ Servers & Delete --}}
    <div class="col-sm-4">
        {{-- Servers & Status --}}
        <div class="alx-card" style="margin-bottom: 20px;">
            <div class="alx-card-header">
                <h3 class="alx-card-title"><i class="fa fa-server"></i> Node Overview</h3>
            </div>
            <div class="alx-card-body" style="padding: 20px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                    <div><i class="fa fa-server" style="color: #a3a3a3; margin-right: 8px;"></i> <strong>Total Servers</strong></div>
                    <div style="font-size: 16px; font-weight: 600; color: #e2e8f0;">{{ $node->servers_count }}</div>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div><i class="fa fa-{{ $node->maintenance_mode ? 'wrench' : 'check-circle' }}" style="color: {{ $node->maintenance_mode ? '#fbbf24' : '#34d399' }}; margin-right: 8px;"></i> <strong>Status</strong></div>
                    <div style="font-size: 14px; font-weight: 600; color: {{ $node->maintenance_mode ? '#fbbf24' : '#34d399' }};">
                        {{ $node->maintenance_mode ? 'Maintenance' : 'Operational' }}
                    </div>
                </div>
            </div>
        </div>

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
</div>


@endsection

@section('footer-scripts')
    @parent
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
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
            
            // Update the CPU allocated cores text since we now know the physical cores
            $('#cpuSubText').text('of ' + data.system.cpus + ' Physical Cores');
            window.nodePhysicalCores = data.system.cpus;
        }).fail(function () {
            $('[data-attr="info-version"]').html('<span style="color:#f87171">Unreachable</span>');
        }).always(function() {
            setTimeout(getInformation, 10000);
        });
    })();

    // Chart.js Setup
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = 'Inter, sans-serif';

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 15, 18, 0.95)',
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(56, 189, 248, 0.35)',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        return ' ' + context.label + ': ' + context.formattedValue + (context.chart.canvas.id === 'chartCpu' ? '%' : ' GiB');
                    }
                }
            }
        }
    };

    // Initialize Charts with empty datasets
    // Removed CPU chart
    const chartMem = new Chart(document.getElementById('chartMem'), {
        type: 'doughnut',
        data: {
            labels: ['Active Usage', 'Allocated', 'Free'],
            datasets: [
                {
                    // Inner ring: Active Usage vs Total
                    data: [0, 1],
                    backgroundColor: ['#10b981', 'rgba(30,41,59,0.0)'], // inner uses emerald
                    borderWidth: 0,
                    weight: 1
                },
                {
                    // Outer ring: Allocated vs Total
                    data: [0, 1],
                    backgroundColor: ['#0ea5e9', 'rgba(30,41,59,0.5)'], // outer uses cyan
                    borderWidth: 0,
                    weight: 0.5
                }
            ]
        },
        options: { ...commonOptions, cutout: '65%' }
    });

    const chartDisk = new Chart(document.getElementById('chartDisk'), {
        type: 'doughnut',
        data: {
            labels: ['Active Usage', 'Allocated', 'Free'],
            datasets: [
                {
                    data: [0, 1],
                    backgroundColor: ['#38bdf8', 'rgba(30,41,59,0.0)'],
                    borderWidth: 0,
                    weight: 1
                },
                {
                    data: [0, 1],
                    backgroundColor: ['#f59e0b', 'rgba(30,41,59,0.5)'],
                    borderWidth: 0,
                    weight: 0.5
                }
            ]
        },
        options: { ...commonOptions, cutout: '65%' }
    });

    // Fetch Live Usage
    const nodeTotalMem = {{ $node->memory }} / 1024; // GiB
    const nodeTotalDisk = {{ $node->disk }} / 1024; // GiB
    @php
        $memAllocated = (float) str_replace(',', '', $stats['memory']['value']) / 1024;
        $diskAllocated = (float) str_replace(',', '', $stats['disk']['value']) / 1024;
    @endphp
    const memAlloc = {{ $memAllocated }};
    const diskAlloc = {{ $diskAllocated }};

    function setStaticUsage() {
        // Just show allocation stats instead of real-time usage (since endpoint is not present)
        $('#memActiveText').text(memAlloc.toFixed(1) + ' GiB');
        $('#memSubText').text(memAlloc.toFixed(1) + ' GiB Allocated of ' + nodeTotalMem.toFixed(1) + ' GiB Total');
        
        $('#diskActiveText').text(diskAlloc.toFixed(1) + ' GiB');
        $('#diskSubText').text(diskAlloc.toFixed(1) + ' GiB Allocated of ' + nodeTotalDisk.toFixed(1) + ' GiB Total');

        let remainingDisk = Math.max(0, nodeTotalDisk - diskAlloc);
        $('#diskRemaining').text(remainingDisk.toFixed(1) + ' GiB');
        $('#diskRemaining').next().text('(Total Node Capacity minus Allocated Space)');

        // Update Charts
        chartMem.data.datasets[0].data = [0, 100];
        chartMem.data.datasets[1].data = [memAlloc, Math.max(0, nodeTotalMem - memAlloc)];
        chartMem.update();

        chartDisk.data.datasets[0].data = [0, 100];
        chartDisk.data.datasets[1].data = [diskAlloc, Math.max(0, nodeTotalDisk - diskAlloc)];
        chartDisk.update();
    }
    
    // Set data immediately
    setStaticUsage();

    </script>
@endsection
