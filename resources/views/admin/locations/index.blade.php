@extends('layouts.admin')

@section('title')
    Datacenter Locations
@endsection

@section('content-header')
    <h1>Datacenter Locations<small>Geographic regions and availability zones that Wings daemon nodes can be assigned to.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Locations</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">
                    <i class="fa fa-globe" style="color:#38bdf8;margin-right:8px;"></i>Configured Geographic Regions
                    <span style="margin-left:10px;padding:2px 9px;border-radius:999px;background:rgba(14,165,233,0.12);color:#38bdf8;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;">{{ count($locations) }} Regions</span>
                </h3>
                <div class="box-tools">
                    <button class="btn btn-sm btn-primary" data-toggle="modal" data-target="#newLocationModal">
                        <i class="fa fa-plus" style="margin-right:5px;"></i> Create Location
                    </button>
                </div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th style="width:80px;">ID</th>
                            <th style="width:200px;">Short Code</th>
                            <th>Region Description</th>
                            <th class="text-center" style="width:130px;">Linked Nodes</th>
                            <th class="text-center" style="width:140px;">Active Servers</th>
                            <th class="text-right" style="width:110px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($locations as $location)
                            <tr>
                                <td><code>#{{ $location->id }}</code></td>
                                <td>
                                    <a href="{{ route('admin.locations.view', $location->id) }}" style="font-weight:700;font-family:'JetBrains Mono',monospace;font-size:13px;">
                                        <i class="fa fa-map-marker" style="color:#38bdf8;margin-right:6px;"></i>{{ $location->short }}
                                    </a>
                                </td>
                                <td style="color:#d4d4d8;">{{ $location->long ?: 'No description provided' }}</td>
                                <td class="text-center">
                                    <span class="label label-info">{{ $location->nodes_count }} Nodes</span>
                                </td>
                                <td class="text-center">
                                    <span class="label label-success">{{ $location->servers_count }} Servers</span>
                                </td>
                                <td class="text-right">
                                    <a href="{{ route('admin.locations.view', $location->id) }}" class="btn btn-xs btn-default">
                                        <i class="fa fa-sliders" style="margin-right:4px;"></i> Manage
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="text-center" style="padding:36px 16px;color:#71717a;">
                                    No datacenter locations configured yet. Click <strong>Create Location</strong> to add your first region.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="newLocationModal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <form action="{{ route('admin.locations') }}" method="POST">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title"><i class="fa fa-globe" style="color:#38bdf8;margin-right:8px;"></i>Create Datacenter Location</h4>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-12 form-group">
                            <label for="pShortModal" class="form-label">Region Short Code</label>
                            <input type="text" name="short" id="pShortModal" class="form-control" placeholder="e.g. sg.sin.01 or id.jkt.dc1" />
                            <p class="text-muted small">A short identifier used to distinguish this location from others (1 to 60 characters).</p>
                        </div>
                        <div class="col-md-12 form-group" style="margin-bottom:0;">
                            <label for="pLongModal" class="form-label">Full Description</label>
                            <textarea name="long" id="pLongModal" class="form-control" rows="3" placeholder="e.g. Singapore Tier-3 Datacenter"></textarea>
                            <p class="text-muted small" style="margin-bottom:0;">A human-readable description of this datacenter location (under 191 characters).</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    {!! csrf_field() !!}
                    <button type="button" class="btn btn-default btn-sm pull-left" data-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-success btn-sm"><i class="fa fa-check" style="margin-right:4px;"></i> Create Location</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
