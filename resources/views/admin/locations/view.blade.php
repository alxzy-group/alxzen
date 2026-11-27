@extends('layouts.admin')

@section('title')
    Locations &rarr; View &rarr; {{ $location->short }}
@endsection

@section('content-header')
    <h1>{{ $location->short }}<small>{{ str_limit($location->long, 75) }}</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.locations') }}">Locations</a></li>
        <li class="active">{{ $location->short }}</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-sm-6">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title"><i class="fa fa-globe" style="color: #38bdf8; margin-right: 8px;"></i>Location Details</h3>
            </div>
            <form action="{{ route('admin.locations.view', $location->id) }}" method="POST">
                <div class="box-body">
                    <div class="form-group">
                        <label for="pShort" class="form-label">Short Code</label>
                        <input type="text" id="pShort" name="short" class="form-control" value="{{ $location->short }}" />
                    </div>
                    <div class="form-group">
                        <label for="pLong" class="form-label">Description</label>
                        <textarea id="pLong" name="long" class="form-control" rows="4">{{ $location->long }}</textarea>
                    </div>
                </div>
                <div class="box-footer">
                    {!! csrf_field() !!}
                    {!! method_field('PATCH') !!}
                    <button name="action" value="edit" class="btn btn-sm btn-primary pull-right">Save</button>
                    <button name="action" value="delete" class="btn btn-sm btn-danger pull-left muted muted-hover"><i class="fa fa-trash-o"></i></button>
                </div>
            </form>
        </div>
    </div>
    <div class="col-sm-6">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">
                    <i class="fa fa-sitemap" style="color: #38bdf8; margin-right: 8px;"></i>Nodes
                    <span class="label label-primary" style="margin-left: 8px;">{{ $location->nodes->count() }}</span>
                </h3>
            </div>
            <div class="box-body table-responsive no-padding">
                @if($location->nodes->isEmpty())
                    <div style="padding: 36px 20px; text-align: center; color: #71717a;">
                        <p style="margin: 0; font-size: 13px;">No nodes attached to this location yet.</p>
                    </div>
                @else
                    <table class="table table-hover">
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>FQDN</th>
                            <th>Servers</th>
                        </tr>
                        @foreach($location->nodes as $node)
                            <tr>
                                <td><code>{{ $node->id }}</code></td>
                                <td><a href="{{ route('admin.nodes.view', $node->id) }}">{{ $node->name }}</a></td>
                                <td><code>{{ $node->fqdn }}</code></td>
                                <td>{{ $node->servers->count() }}</td>
                            </tr>
                        @endforeach
                    </table>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
