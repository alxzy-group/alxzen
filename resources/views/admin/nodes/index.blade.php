@extends('layouts.admin')

@section('title')
    List Nodes
@endsection

@section('scripts')
    @parent
    {!! Theme::css('vendor/fontawesome/animation.min.css') !!}
@endsection

@section('content-header')
    <h1>Nodes<small>All nodes available on the system.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Nodes</li>
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
    display: flex; align-items: center; justify-content: space-between; overflow-x: auto;
    padding: 16px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: #171717;
}
.alx-card-title { font-size:15px; font-weight:500; color:#e5e5e5; display:flex; align-items:center; gap:8px; margin:0; }
.alx-card-title i { color:#a3a3a3; }
.alx-search-group { display:flex; gap:8px; align-items:center; }
.alx-search-group .form-control {
    background: #000000 !important; border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 12px !important; color:#e5e5e5 !important; font-size:13px; height:34px;
    padding: 0 12px; width:200px; transition: border-color 0.2s; box-shadow: none !important;
}
.alx-search-group .form-control:focus { border-color:#0ea5e9 !important; box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2) !important; outline:none; }
.alx-search-group .form-control::placeholder { color:#737373; }
.alx-btn { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:8px; font-size:13px; font-weight:500; border:1px solid transparent; cursor:pointer; transition:all 0.2s; text-decoration:none; box-shadow:none; text-transform:none; }
.alx-btn-search { background: #262626; color:#e5e5e5; border:1px solid rgba(255, 255, 255, 0.15); }
.alx-btn-search:hover { background: #404040; }
.alx-btn-create { background: #0ea5e9; color:#fff; border-radius: 12px; }
.alx-btn-create:hover { background: #0284c7; }
.alx-table { width:100%; border-collapse:collapse; }
.alx-table thead tr { background: #171717; border-bottom:1px solid rgba(255, 255, 255, 0.08); }
.alx-table thead th { padding:12px 16px; font-size:12px; font-weight:500; text-transform:capitalize; color:#a3a3a3; text-align:left; }
.alx-table tbody tr { border-bottom:1px solid rgba(255, 255, 255, 0.04); transition:background 0.15s; }
.alx-table tbody tr:last-child { border-bottom:none; }
.alx-table tbody tr:hover { background: rgba(255, 255, 255, 0.02); }
.alx-table td { padding:12px 16px; font-size:13px; color:#e5e5e5; vertical-align:middle; }
.alx-table td a { color:#a3a3a3; text-decoration:none; font-weight:500; transition:color 0.15s; }
.alx-table td a:hover { color:#e5e5e5; }
.alx-node-status { width:10px; height:10px; border-radius:50%; display:inline-block; position:relative; }
.alx-node-status.online { background:#10b981; box-shadow:none; }
.alx-node-status.offline { background:#ef4444; box-shadow:none; }
.alx-node-status.loading { background:#f59e0b; animation:pulse 1s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
.alx-icon-ssl-on { color:#10b981; } .alx-icon-ssl-off { color:#ef4444; }
.alx-icon-pub-on { color:#a3a3a3; } .alx-icon-pub-off { color:#737373; }
.alx-maint { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:500; background:rgba(245, 158, 11, 0.1); color:#fbbf24; border:1px solid rgba(245, 158, 11, 0.2); margin-right:4px; }
.alx-stat-chip { display:inline-flex; align-items:center; justify-content:center; min-width:28px; height:20px; padding:0 8px; border-radius:4px; font-size:12px; font-weight:500; background:rgba(255, 255, 255, 0.1); color:#ffffff; border:1px solid rgba(255, 255, 255, 0.2); }
.alx-pagination { display:flex; justify-content:center; padding:16px 24px; border-top:1px solid rgba(255, 255, 255, 0.08); }
</style>

<div class="row">
    <div class="col-xs-12">
        <div class="alx-card">
            <div class="alx-card-header">
                <h3 class="alx-card-title"><i class="fa fa-sitemap"></i> Node List</h3>
                <form action="{{ route('admin.nodes') }}" method="GET">
                    <div class="alx-search-group">
                        <input type="text" name="filter[name]" class="form-control" value="{{ request()->input('filter.name') }}" placeholder="Search nodes...">
                        <button type="submit" class="alx-btn alx-btn-search"><i class="fa fa-search"></i></button>
                        <a href="{{ route('admin.nodes.new') }}" class="alx-btn alx-btn-create"><i class="fa fa-plus"></i> Create New</a>
                    </div>
                </form>
            </div>
            <div style="overflow-x: auto;">
                <table class="alx-table">
                    <thead>
                        <tr>
                            <th style="width:50px; text-align:center">Status</th>
                            <th>Name</th>
                            <th>Location</th>
                            <th>Memory</th>
                            <th>Disk</th>
                            <th style="text-align:center">Servers</th>
                            <th style="text-align:center">SSL</th>
                            <th style="text-align:center">Public</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($nodes as $node)
                            <tr>
                                <td style="text-align:center" data-action="ping"
                                    data-secret="{{ $node->getDecryptedKey() }}"
                                    data-location="{{ $node->scheme }}://{{ $node->fqdn }}:{{ $node->daemonListen }}/api/system">
                                    <span class="alx-node-status loading" title="Checking..."></span>
                                </td>
                                <td style="color:#e2e8f0; font-weight:500;">
                                    @if($node->maintenance_mode)
                                        <span class="alx-maint"><i class="fa fa-wrench"></i> Maintenance</span>
                                    @endif
                                    <a href="{{ route('admin.nodes.view', $node->id) }}">{{ $node->name }}</a>
                                </td>
                                <td>{{ $node->location->short }}</td>
                                <td>
                                    <span style="color:#e2e8f0; font-weight:500;">{{ number_format($node->memory / 1024, 1) }} GiB</span>
                                    <span style="color:#475569; font-size:11px"> allocated</span>
                                </td>
                                <td>
                                    <span style="color:#e2e8f0; font-weight:500;">{{ number_format($node->disk / 1024, 1) }} GiB</span>
                                    <span style="color:#475569; font-size:11px"> allocated</span>
                                </td>
                                <td style="text-align:center"><span class="alx-stat-chip">{{ $node->servers_count }}</span></td>
                                <td style="text-align:center">
                                    @if($node->scheme === 'https')
                                        <i class="fa fa-lock alx-icon-ssl-on" title="SSL Enabled" data-toggle="tooltip"></i>
                                    @else
                                        <i class="fa fa-unlock alx-icon-ssl-off" title="No SSL" data-toggle="tooltip"></i>
                                    @endif
                                </td>
                                <td style="text-align:center">
                                    @if($node->public)
                                        <i class="fa fa-eye alx-icon-pub-on" title="Public Node" data-toggle="tooltip"></i>
                                    @else
                                        <i class="fa fa-eye-slash alx-icon-pub-off" title="Private Node" data-toggle="tooltip"></i>
                                    @endif
                                </td>
                            </tr>
                        @empty
                            <tr><td colspan="8" style="text-align:center;padding:60px;color:#475569"><i class="fa fa-sitemap" style="font-size:36px;display:block;margin-bottom:10px;color:#334155"></i>No nodes configured yet.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            @if($nodes->hasPages())
                <div class="alx-pagination">
                    {!! $nodes->appends(['query' => Request::input('query')])->render() !!}
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
                dot.removeClass('loading').addClass('online').attr('title', 'Online — Wings v' + data.version);
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
