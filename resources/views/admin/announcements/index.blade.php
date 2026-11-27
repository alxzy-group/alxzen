@extends('layouts.admin')

@section('title')
    Announcements
@endsection

@section('content-header')
    <h1>Global Announcements<small>Broadcast real-time banners and operational alerts across the client dashboard and server consoles.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Announcements</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">
                    <i class="fa fa-bullhorn" style="color:#38bdf8;margin-right:8px;"></i>Active &amp; Scheduled Broadcasts
                    <span style="margin-left:10px;padding:2px 9px;border-radius:999px;background:rgba(14,165,233,0.12);color:#38bdf8;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;">{{ $announcements->total() }} Total</span>
                </h3>
                <div class="box-tools">
                    <a href="{{ route('admin.announcements.new') }}" class="btn btn-sm btn-primary">
                        <i class="fa fa-plus" style="margin-right:5px;"></i> Create Announcement
                    </a>
                </div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th style="width:70px;">ID</th>
                            <th>Announcement Details</th>
                            <th style="width:130px;">Severity Type</th>
                            <th style="width:120px;">Status</th>
                            <th style="width:140px;">Author</th>
                            <th style="width:150px;">Published</th>
                            <th class="text-right" style="width:100px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($announcements as $announcement)
                            <tr>
                                <td><code>#{{ $announcement->id }}</code></td>
                                <td>
                                    <div style="font-weight:700;color:#f4f4f5;font-size:13.5px;">{{ $announcement->title }}</div>
                                    <div style="font-size:12px;color:#71717a;margin-top:2px;">{{ str_limit($announcement->content, 95) }}</div>
                                </td>
                                <td>
                                    <span class="label label-{{ $announcement->type === 'critical' ? 'danger' : ($announcement->type === 'warning' ? 'warning' : 'info') }}">
                                        {{ strtoupper($announcement->type) }}
                                    </span>
                                </td>
                                <td>
                                    @if($announcement->is_active)
                                        <span class="label label-success"><i class="fa fa-circle" style="font-size:7px;margin-right:4px;vertical-align:middle;"></i>Active</span>
                                    @else
                                        <span class="label label-default">Inactive</span>
                                    @endif
                                </td>
                                <td>
                                    <span style="color:#e4e4e7;font-weight:600;"><i class="fa fa-user-circle-o" style="color:#71717a;margin-right:5px;"></i>{{ optional($announcement->author)->username ?? 'System' }}</span>
                                </td>
                                <td style="color:#a1a1aa;font-size:12px;">{{ $announcement->created_at->diffForHumans() }}</td>
                                <td class="text-right">
                                    <form action="{{ route('admin.announcements.delete', $announcement->id) }}" method="POST" style="display:inline;">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn btn-xs btn-danger" onclick="return confirm('Are you sure you want to delete this announcement?')">
                                            <i class="fa fa-trash-o" style="margin-right:4px;"></i> Delete
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center" style="padding:36px 16px;color:#71717a;">
                                    <i class="fa fa-bullhorn" style="font-size:24px;display:block;margin-bottom:8px;color:#3f3f46;"></i>
                                    No announcements have been published yet. Click <strong>Create Announcement</strong> to broadcast a message.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            @if($announcements->hasPages())
                <div class="box-footer with-border">
                    <div class="col-md-12 text-center">{!! $announcements->appends(['query' => request()->input('query')])->render() !!}</div>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
