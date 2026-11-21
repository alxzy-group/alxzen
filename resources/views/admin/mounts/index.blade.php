@extends('layouts.admin')

@section('title')
    Volume Mounts
@endsection

@section('content-header')
    <h1>Container Volume Mounts<small>Configure and manage additional host-to-container filesystem mount points.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Mounts</li>
    </ol>
@endsection

@section('content')
    <div class="row">
        <div class="col-xs-12">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">
                        <i class="fa fa-hdd-o" style="color:#38bdf8;margin-right:8px;"></i>Configured Host Mounts
                        <span style="margin-left:10px;padding:2px 9px;border-radius:999px;background:rgba(14,165,233,0.12);color:#38bdf8;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;">{{ count($mounts) }} Mounts</span>
                    </h3>

                    <div class="box-tools">
                        <button class="btn btn-sm btn-primary" data-toggle="modal" data-target="#newMountModal">
                            <i class="fa fa-plus" style="margin-right:5px;"></i> Create Mount
                        </button>
                    </div>
                </div>

                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th style="width:75px;">ID</th>
                                <th>Mount Name</th>
                                <th>Host Source Path</th>
                                <th>Container Target Path</th>
                                <th class="text-center">Eggs</th>
                                <th class="text-center">Nodes</th>
                                <th class="text-center">Servers</th>
                                <th class="text-right" style="width:110px;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($mounts as $mount)
                                <tr>
                                    <td><code>#{{ $mount->id }}</code></td>
                                    <td>
                                        <a href="{{ route('admin.mounts.view', $mount->id) }}" style="font-weight:700;font-size:13.5px;">
                                            <i class="fa fa-hdd-o" style="color:#38bdf8;margin-right:6px;"></i>{{ $mount->name }}
                                        </a>
                                    </td>
                                    <td><code>{{ $mount->source }}</code></td>
                                    <td><code>{{ $mount->target }}</code></td>
                                    <td class="text-center"><span class="label label-info">{{ $mount->eggs_count }}</span></td>
                                    <td class="text-center"><span class="label label-info">{{ $mount->nodes_count }}</span></td>
                                    <td class="text-center"><span class="label label-success">{{ $mount->servers_count }}</span></td>
                                    <td class="text-right">
                                        <a href="{{ route('admin.mounts.view', $mount->id) }}" class="btn btn-xs btn-default">
                                            <i class="fa fa-sliders" style="margin-right:4px;"></i> Manage
                                        </a>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="8" class="text-center" style="padding:36px 16px;color:#71717a;">
                                        No custom volume mounts configured. Click <strong>Create Mount</strong> to share host storage with containers.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="newMountModal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <form action="{{ route('admin.mounts') }}" method="POST">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 class="modal-title"><i class="fa fa-hdd-o" style="color:#38bdf8;margin-right:8px;"></i>Create Volume Mount</h4>
                    </div>

                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-12 form-group">
                                <label for="pName" class="form-label">Mount Identifier</label>
                                <input type="text" id="pName" name="name" class="form-control" placeholder="e.g. shared-assets" />
                                <p class="text-muted small">Unique name used to separate this mount from others.</p>
                            </div>

                            <div class="col-md-12 form-group">
                                <label for="pDescription" class="form-label">Description</label>
                                <textarea id="pDescription" name="description" class="form-control" rows="3"></textarea>
                                <p class="text-muted small">A longer description for this mount (must be less than 191 characters).</p>
                            </div>

                            <div class="col-md-6 form-group">
                                <label for="pSource" class="form-label">Host Source Path</label>
                                <input type="text" id="pSource" name="source" class="form-control" placeholder="/mnt/shared" />
                                <p class="text-muted small">Absolute directory path on the host machine.</p>
                            </div>

                            <div class="col-md-6 form-group">
                                <label for="pTarget" class="form-label">Container Target Path</label>
                                <input type="text" id="pTarget" name="target" class="form-control" placeholder="/home/container/shared" />
                                <p class="text-muted small">Mount destination inside the Docker container.</p>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label">Read Only Mode</label>
                                <div>
                                    <div class="radio radio-success radio-inline">
                                        <input type="radio" id="pReadOnlyFalse" name="read_only" value="0" checked>
                                        <label for="pReadOnlyFalse">Writable (False)</label>
                                    </div>
                                    <div class="radio radio-warning radio-inline">
                                        <input type="radio" id="pReadOnly" name="read_only" value="1">
                                        <label for="pReadOnly">Read-Only (True)</label>
                                    </div>
                                </div>
                                <p class="text-muted small" style="margin-bottom:0;">Is the mount read-only inside the container?</p>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label">User Self-Mountable</label>
                                <div>
                                    <div class="radio radio-success radio-inline">
                                        <input type="radio" id="pUserMountableFalse" name="user_mountable" value="0" checked>
                                        <label for="pUserMountableFalse">Admin Only</label>
                                    </div>
                                    <div class="radio radio-warning radio-inline">
                                        <input type="radio" id="pUserMountable" name="user_mountable" value="1">
                                        <label for="pUserMountable">Allow Users</label>
                                    </div>
                                </div>
                                <p class="text-muted small" style="margin-bottom:0;">Allow clients to attach this mount themselves?</p>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        {!! csrf_field() !!}
                        <button type="button" class="btn btn-default btn-sm pull-left" data-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-success btn-sm"><i class="fa fa-check" style="margin-right:4px;"></i> Create Mount</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection
