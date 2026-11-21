@extends('layouts.admin')

@section('title')
    Nests &rarr; {{ $nest->name }}
@endsection

@section('content-header')
    <h1>{{ $nest->name }}<small>{{ str_limit($nest->description, 70) }}</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.nests') }}">Nests</a></li>
        <li class="active">{{ $nest->name }}</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <form action="{{ route('admin.nests.view', $nest->id) }}" method="POST">
        <div class="col-md-6">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title"><i class="fa fa-cube" style="color:#38bdf8;margin-right:8px;"></i>Nest Configuration</h3>
                </div>
                <div class="box-body">
                    <div class="form-group">
                        <label class="control-label">Nest Name <span class="field-required"></span></label>
                        <div>
                            <input type="text" name="name" class="form-control" value="{{ $nest->name }}" />
                            <p class="text-muted"><small>A descriptive category name that encompasses all eggs within this service group.</small></p>
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label class="control-label">Description</label>
                        <div>
                            <textarea name="description" class="form-control" rows="5">{{ $nest->description }}</textarea>
                        </div>
                    </div>
                </div>
                <div class="box-footer">
                    {!! csrf_field() !!}
                    <button type="submit" name="_method" value="PATCH" class="btn btn-primary btn-sm pull-right"><i class="fa fa-save" style="margin-right:5px;"></i> Save Nest</button>
                    <button id="deleteButton" type="submit" name="_method" value="DELETE" class="btn btn-sm btn-danger muted muted-hover"><i class="fa fa-trash-o"></i></button>
                </div>
            </div>
        </div>
    </form>
    <div class="col-md-6">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title"><i class="fa fa-fingerprint" style="color:#a855f7;margin-right:8px;"></i>System Metadata</h3>
            </div>
            <div class="box-body">
                <div class="form-group">
                    <label class="control-label">Internal Nest ID</label>
                    <div>
                        <input type="text" readonly class="form-control" value="{{ $nest->id }}" />
                        <p class="text-muted small">Unique numeric ID used for identification of this nest through the Application API.</p>
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label">Author Signature</label>
                    <div>
                        <input type="text" readonly class="form-control" value="{{ $nest->author }}" />
                        <p class="text-muted small">The creator of this service option.</p>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label class="control-label">Nest UUID</label>
                    <div>
                        <input type="text" readonly class="form-control" value="{{ $nest->uuid }}" />
                        <p class="text-muted small" style="margin-bottom:0;">Global UUID assigned to this service nest for synchronization.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">
                    <i class="fa fa-terminal" style="color:#34d399;margin-right:8px;"></i>Configured Runtime Eggs
                    <span style="margin-left:10px;padding:2px 9px;border-radius:999px;background:rgba(16,185,129,0.12);color:#34d399;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;">{{ count($nest->eggs) }} Eggs</span>
                </h3>
                <div class="box-tools">
                    <a href="{{ route('admin.nests.egg.new') }}" class="btn btn-success btn-sm">
                        <i class="fa fa-plus" style="margin-right:5px;"></i> New Egg
                    </a>
                </div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th style="width:75px;">ID</th>
                            <th style="width:240px;">Egg Name</th>
                            <th>Description</th>
                            <th class="text-center" style="width:120px;">Servers</th>
                            <th class="text-right" style="width:160px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($nest->eggs as $egg)
                            <tr>
                                <td class="align-middle"><code>#{{ $egg->id }}</code></td>
                                <td class="align-middle">
                                    <a href="{{ route('admin.nests.egg.view', $egg->id) }}" data-toggle="tooltip" data-placement="right" title="{{ $egg->author }}" style="font-weight:700;font-size:13.5px;">
                                        {{ $egg->name }}
                                    </a>
                                    <div style="font-size:11px;color:#71717a;font-family:'JetBrains Mono',monospace;">{{ $egg->author }}</div>
                                </td>
                                <td class="align-middle" style="color:#d4d4d8;">{{ $egg->description }}</td>
                                <td class="text-center align-middle">
                                    <span class="label label-info">{{ $egg->servers->count() }} Servers</span>
                                </td>
                                <td class="text-right align-middle">
                                    <a href="{{ route('admin.nests.egg.export', ['egg' => $egg->id]) }}" class="btn btn-xs btn-default" title="Export Egg JSON">
                                        <i class="fa fa-download" style="margin-right:4px;"></i> Export
                                    </a>
                                    <a href="{{ route('admin.nests.egg.view', $egg->id) }}" class="btn btn-xs btn-primary" style="margin-left:4px;">
                                        <i class="fa fa-pencil"></i> Edit
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
@endsection

@section('footer-scripts')
    @parent
    <script>
        $('#deleteButton').on('mouseenter', function (event) {
            $(this).find('i').html(' Delete Nest');
        }).on('mouseleave', function (event) {
            $(this).find('i').html('');
        });
    </script>
@endsection
