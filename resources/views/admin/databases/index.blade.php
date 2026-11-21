@extends('layouts.admin')

@section('title')
    Database Hosts
@endsection

@section('content-header')
    <h1>Database Hosts<small>MySQL / MariaDB cluster hosts used for dynamic server database provisioning.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Database Hosts</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">
                    <i class="fa fa-database" style="color:#38bdf8;margin-right:8px;"></i>Configured Database Hosts
                    <span style="margin-left:10px;padding:2px 9px;border-radius:999px;background:rgba(14,165,233,0.12);color:#38bdf8;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;">{{ count($hosts) }} Hosts</span>
                </h3>
                <div class="box-tools">
                    <button class="btn btn-sm btn-primary" data-toggle="modal" data-target="#newHostModal">
                        <i class="fa fa-plus" style="margin-right:5px;"></i> Create Database Host
                    </button>
                </div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th style="width:75px;">ID</th>
                            <th>Host Name</th>
                            <th>Endpoint Address</th>
                            <th>Port</th>
                            <th>Admin User</th>
                            <th class="text-center">Active Databases</th>
                            <th class="text-center">Linked Node</th>
                            <th class="text-right" style="width:110px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($hosts as $host)
                            <tr>
                                <td><code>#{{ $host->id }}</code></td>
                                <td>
                                    <a href="{{ route('admin.databases.view', $host->id) }}" style="font-weight:700;font-size:13.5px;">
                                        <i class="fa fa-database" style="color:#38bdf8;margin-right:6px;"></i>{{ $host->name }}
                                    </a>
                                </td>
                                <td><code>{{ $host->host }}</code></td>
                                <td><code>{{ $host->port }}</code></td>
                                <td><span style="color:#e4e4e7;font-family:'JetBrains Mono',monospace;font-size:12px;">{{ $host->username }}</span></td>
                                <td class="text-center">
                                    <span class="label label-info">{{ $host->databases_count }} DBs</span>
                                </td>
                                <td class="text-center">
                                    @if(! is_null($host->node))
                                        <a href="{{ route('admin.nodes.view', $host->node->id) }}" class="label label-success">{{ $host->node->name }}</a>
                                    @else
                                        <span class="label label-default">Global / Unlinked</span>
                                    @endif
                                </td>
                                <td class="text-right">
                                    <a href="{{ route('admin.databases.view', $host->id) }}" class="btn btn-xs btn-default">
                                        <i class="fa fa-sliders" style="margin-right:4px;"></i> Manage
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="8" class="text-center" style="padding:36px 16px;color:#71717a;">
                                    No database hosts configured. Click <strong>Create Database Host</strong> to connect a MySQL / MariaDB instance.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="newHostModal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <form action="{{ route('admin.databases') }}" method="POST">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title"><i class="fa fa-database" style="color:#38bdf8;margin-right:8px;"></i>Create New Database Host</h4>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="pName" class="form-label">Display Name</label>
                        <input type="text" name="name" id="pName" class="form-control" placeholder="e.g. Primary MySQL Cluster" />
                        <p class="text-muted small">A short identifier used to distinguish this database host from others.</p>
                    </div>
                    <div class="row">
                        <div class="col-md-8 form-group">
                            <label for="pHost" class="form-label">Host IP / FQDN</label>
                            <input type="text" name="host" id="pHost" class="form-control" placeholder="127.0.0.1 or db.example.com" />
                            <p class="text-muted small">The IP address or domain reachable from this panel.</p>
                        </div>
                        <div class="col-md-4 form-group">
                            <label for="pPort" class="form-label">Port</label>
                            <input type="text" name="port" id="pPort" class="form-control" value="3306"/>
                            <p class="text-muted small">Default: <code>3306</code>.</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 form-group">
                            <label for="pUsername" class="form-label">MySQL Admin Username</label>
                            <input type="text" name="username" id="pUsername" class="form-control" />
                            <p class="text-muted small">Must have <code>WITH GRANT OPTION</code> privileges.</p>
                        </div>
                        <div class="col-md-6 form-group">
                            <label for="pPassword" class="form-label">MySQL Admin Password</label>
                            <input type="password" name="password" id="pPassword" class="form-control" />
                            <p class="text-muted small">Password for the MySQL administrative user.</p>
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label for="pNodeId" class="form-label">Linked Wings Node</label>
                        <select name="node_id" id="pNodeId" class="form-control">
                            <option value="">None (Available Globally)</option>
                            @foreach($locations as $location)
                                <optgroup label="{{ $location->short }}">
                                    @foreach($location->nodes as $node)
                                        <option value="{{ $node->id }}">{{ $node->name }}</option>
                                    @endforeach
                                </optgroup>
                            @endforeach
                        </select>
                        <p class="text-muted small" style="margin-bottom:0;">Defaults to this database host when provisioning a database on the selected node.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <p class="text-danger small text-left" style="margin-bottom:12px;">The account defined for this database host <strong>must</strong> have the <code>WITH GRANT OPTION</code> permission. <strong>Do not use the same MySQL user credentials that the panel itself uses.</strong></p>
                    {!! csrf_field() !!}
                    <button type="button" class="btn btn-default btn-sm pull-left" data-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-success btn-sm"><i class="fa fa-check" style="margin-right:4px;"></i> Create Host</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        $('#pNodeId').select2();
    </script>
@endsection
