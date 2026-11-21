@extends('layouts.admin')

@section('title')
    Service Nests
@endsection

@section('content-header')
    <h1>Service Nests &amp; Runtime Eggs<small>Manage container runtime templates, startup scripts, and service definitions.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Nests</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12">
        <div class="alert alert-danger" style="display:flex;align-items:flex-start;gap:12px;">
            <i class="fa fa-exclamation-triangle" style="font-size:18px;margin-top:2px;color:#fb7185;"></i>
            <div>
                <strong style="display:block;margin-bottom:2px;color:#fff;">Runtime Configuration Safety Notice</strong>
                Eggs define Docker images, startup commands, and installation scripts for your servers. Modifying an egg incorrectly can prevent instances from booting. Please verify Docker image compatibility before editing production eggs.
            </div>
        </div>
    </div>
</div>
<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">
                    <i class="fa fa-cubes" style="color:#38bdf8;margin-right:8px;"></i>Configured Service Nests
                    <span style="margin-left:10px;padding:2px 9px;border-radius:999px;background:rgba(14,165,233,0.12);color:#38bdf8;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;">{{ count($nests) }} Nests</span>
                </h3>
                <div class="box-tools">
                    <a href="#" class="btn btn-sm btn-success" data-toggle="modal" data-target="#importServiceOptionModal" role="button">
                        <i class="fa fa-upload" style="margin-right:5px;"></i> Import Egg JSON
                    </a>
                    <a href="{{ route('admin.nests.new') }}" class="btn btn-primary btn-sm">
                        <i class="fa fa-plus" style="margin-right:5px;"></i> Create Nest
                    </a>
                </div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th style="width:75px;">ID</th>
                            <th style="width:240px;">Nest Category</th>
                            <th>Description</th>
                            <th class="text-center" style="width:120px;">Eggs</th>
                            <th class="text-center" style="width:130px;">Active Servers</th>
                            <th class="text-right" style="width:120px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($nests as $nest)
                            <tr>
                                <td class="middle"><code>#{{ $nest->id }}</code></td>
                                <td class="middle">
                                    <a href="{{ route('admin.nests.view', $nest->id) }}" data-toggle="tooltip" data-placement="right" title="{{ $nest->author }}" style="font-weight:700;font-size:13.5px;">
                                        <i class="fa fa-cube" style="color:#38bdf8;margin-right:6px;"></i>{{ $nest->name }}
                                    </a>
                                    <div style="font-size:11px;color:#71717a;font-family:'JetBrains Mono',monospace;margin-top:2px;">{{ $nest->author }}</div>
                                </td>
                                <td class="middle" style="color:#d4d4d8;">{{ $nest->description ?: 'No description provided.' }}</td>
                                <td class="text-center middle">
                                    <span class="label label-info">{{ $nest->eggs_count }} Eggs</span>
                                </td>
                                <td class="text-center middle">
                                    <span class="label label-success">{{ $nest->servers_count }} Servers</span>
                                </td>
                                <td class="text-right middle">
                                    <a href="{{ route('admin.nests.view', $nest->id) }}" class="btn btn-xs btn-default">
                                        <i class="fa fa-folder-open-o" style="margin-right:4px;"></i> View Eggs
                                    </a>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" tabindex="-1" role="dialog" id="importServiceOptionModal">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title"><i class="fa fa-upload" style="color:#34d399;margin-right:8px;"></i>Import Service Egg (.json)</h4>
            </div>
            <form action="{{ route('admin.nests.egg.import') }}" enctype="multipart/form-data" method="POST">
                <div class="modal-body">
                    <div class="form-group">
                        <label class="control-label" for="pImportFile">Egg Configuration File <span class="field-required"></span></label>
                        <div>
                            <input id="pImportFile" type="file" name="import_file" class="form-control" accept="application/json" />
                            <p class="small text-muted">Select the <code>.json</code> file for the new runtime egg that you wish to import.</p>
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label class="control-label" for="pImportToNest">Target Nest Category <span class="field-required"></span></label>
                        <div>
                            <select id="pImportToNest" name="import_to_nest" class="form-control">
                                @foreach($nests as $nest)
                                   <option value="{{ $nest->id }}">{{ $nest->name }} &lt;{{ $nest->author }}&gt;</option>
                                @endforeach
                            </select>
                            <p class="small text-muted" style="margin-bottom:0;">Choose the parent nest where this egg will be stored.</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    {{ csrf_field() }}
                    <button type="button" class="btn btn-default btn-sm pull-left" data-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary btn-sm"><i class="fa fa-check" style="margin-right:4px;"></i> Import Egg</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        $(document).ready(function() {
            $('#pImportToNest').select2();
        });
    </script>
@endsection
