@extends('layouts.admin')

@section('title')
    Daemon Nodes
@endsection

@section('scripts')
    @parent
    {!! Theme::css('vendor/fontawesome/animation.min.css') !!}
@endsection

@section('content-header')
    <h1>Wings Daemon Nodes<small>Monitor live heartbeat status and allocated compute capacity across all host nodes.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Nodes</li>
    </ol>
@endsection

@section('content')
<style>
.alx-node-status {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    position: relative;
}
.alx-node-status.online {
    background: #10b981;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.65);
}
.alx-node-status.offline {
    background: #ef4444;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.55);
}
.alx-node-status.loading {
    background: #f59e0b;
    animation: alxNodePulse 1s infinite;
}
@keyframes alxNodePulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
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
                    <i class="fa fa-sitemap" style="color:#38bdf8;margin-right:8px;"></i>Connected Infrastructure Nodes
                    <span style="margin-left:10px;padding:2px 9px;border-radius:999px;background:rgba(14,165,233,0.12);color:#38bdf8;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;">{{ $nodes->total() }} Nodes</span>
                </h3>
                <div class="box-tools">
                    <form action="{{ route('admin.nodes') }}" method="GET" class="alx-toolbar-form">
                        <input type="text" name="filter[name]" class="form-control alx-toolbar-input" value="{{ request()->input('filter.name') }}" placeholder="Search nodes...">
                        <button type="submit" class="btn btn-sm btn-default">
                            <i class="fa fa-search" style="margin-right:4px;"></i> Search
                        </button>
                        <a href="{{ route('admin.nodes.new') }}" class="btn btn-sm btn-primary">
                            <i class="fa fa-plus" style="margin-right:5px;"></i> Create Node
                        </a>
                    </form>
                </div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th class="text-center" style="width:65px;">Pulse</th>
                            <th>Node Name</th>
                            <th>Location</th>
                            <th>Memory Capacity</th>
                            <th>Disk Capacity</th>
                            <th class="text-center">Servers</th>
                            <th class="text-center">SSL</th>
                            <th class="text-center">Visibility</th>
                            <th class="text-right" style="width:105px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($nodes as $node)
                            <tr>
                                <td class="text-center" data-action="ping"
                                    data-secret="{{ $node->getDecryptedKey() }}"
                                    data-location="{{ $node->scheme }}://{{ $node->fqdn }}:{{ $node->daemonListen }}/api/system">
                                    <span class="alx-node-status loading" title="Checking..."></span>
                                </td>
                                <td>
                                    @if($node->maintenance_mode)
                                        <span class="label label-warning" style="margin-right:6px;"><i class="fa fa-wrench"></i> Maintenance</span>
                                    @endif
                                    <a href="{{ route('admin.nodes.view', $node->id) }}" style="font-weight:700;font-size:13.5px;color:#f4f4f5;">
                                        {{ $node->name }}
                                    </a>
                                </td>
                                <td><code>{{ $node->location->short }}</code></td>
                                <td>
                                    <span style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#e4e4e7;font-variant-numeric:tabular-nums;">{{ number_format($node->memory / 1024, 1) }} GiB</span>
                                </td>
                                <td>
                                    <span style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#e4e4e7;font-variant-numeric:tabular-nums;">{{ number_format($node->disk / 1024, 1) }} GiB</span>
                                </td>
                                <td class="text-center">
                                    <span class="label label-info">{{ $node->servers_count }}</span>
                                </td>
                                <td class="text-center">
                                    @if($node->scheme === 'https')
                                        <span class="label label-success" title="SSL Enabled" data-toggle="tooltip"><i class="fa fa-lock"></i> HTTPS</span>
                                    @else
                                        <span class="label label-danger" title="No SSL" data-toggle="tooltip"><i class="fa fa-unlock"></i> HTTP</span>
                                    @endif
                                </td>
                                <td class="text-center">
                                    @if($node->public)
                                        <span class="label label-info" title="Public Node" data-toggle="tooltip"><i class="fa fa-eye"></i> Public</span>
                                    @else
                                        <span class="label label-default" title="Private Node" data-toggle="tooltip"><i class="fa fa-eye-slash"></i> Private</span>
                                    @endif
                                </td>
                                <td class="text-right">
                                    <a href="{{ route('admin.nodes.view', $node->id) }}" class="btn btn-xs btn-default">
                                        <i class="fa fa-sliders" style="margin-right:4px;"></i> Manage
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="9" class="text-center" style="padding:40px 16px;color:#71717a;">
                                    <i class="fa fa-sitemap" style="font-size:26px;display:block;margin-bottom:8px;color:#3f3f46;"></i>
                                    No nodes configured yet. Click <strong>Create Node</strong> to add your first Wings daemon.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            @if($nodes->hasPages())
                <div class="box-footer with-border">
                    <div class="col-md-12 text-center">{!! $nodes->appends(['query' => Request::input('query')])->render() !!}</div>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>
    (function pingNodes() {
        $('td[data-action="ping"]').each(function(i, element) {
            var dot = $(element).find('.alx-node-status');
            $.ajax({
                type: 'GET',
                url: $(element).data('location'),
                headers: { 'Authorization': 'Bearer ' + $(element).data('secret') },
                timeout: 5000
            }).done(function (data) {
                dot.removeClass('loading').addClass('online').attr('title', 'Online - Wings v' + data.version);
                $('[data-toggle="tooltip"]').tooltip();
            }).fail(function () {
                dot.removeClass('loading').addClass('offline').attr('title', 'Offline or unreachable');
            });
        }).promise().done(function () {
            setTimeout(pingNodes, 10000);
        });
    })();
    </script>
@endsection
