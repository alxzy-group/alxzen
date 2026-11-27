@extends('layouts.admin')

@section('title')
    Expiration Manager
@endsection

@section('content-header')
    <h1>Expiration Lifecycle Manager<small>Monitor billing deadlines, extend active subscriptions, or purge expired servers.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Expiration Manager</li>
    </ol>
@endsection

@section('content')
<style>
.alx-toolbar-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}
.alx-toolbar-input {
    width: 195px !important;
    height: 34px !important;
    font-size: 13px !important;
}
.alx-exp-form {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
}
.alx-exp-date {
    width: 145px !important;
    height: 30px !important;
    font-size: 12px !important;
    padding: 2px 8px !important;
}
</style>

<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">
                    <i class="fa fa-clock-o" style="color:#38bdf8;margin-right:8px;"></i>Server Expiration Schedule
                    <span style="margin-left:10px;padding:2px 9px;border-radius:999px;background:rgba(14,165,233,0.12);color:#38bdf8;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;">{{ $servers->total() }} Instances</span>
                </h3>
                <div class="box-tools alx-toolbar-wrap">
                    <form action="{{ route('admin.expiration') }}" method="GET" class="alx-toolbar-wrap">
                        <input type="text" name="filter[name]" class="form-control alx-toolbar-input" value="{{ request()->input('filter.name', '') }}" placeholder="Search server name...">
                        <button type="submit" class="btn btn-sm btn-default">
                            <i class="fa fa-search" style="margin-right:4px;"></i> Search
                        </button>
                    </form>
                    @if(Auth::user()->id === 1)
                        <form action="{{ route('admin.expiration.deleteAll') }}" method="POST" style="display:inline-flex;" onsubmit="return confirm('Are you sure you want to delete all expired servers? This action cannot be undone and will delete server files and databases.');">
                            {!! csrf_field() !!}
                            <button type="submit" class="btn btn-sm btn-danger">
                                <i class="fa fa-trash-o" style="margin-right:4px;"></i> Purge Expired
                            </button>
                        </form>
                    @endif
                </div>
            </div>

            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Server Instance</th>
                            <th>Owner</th>
                            <th>Daemon Node</th>
                            <th>Expiration Date</th>
                            <th class="text-center">Lifecycle Status</th>
                            <th class="text-right">Extend / Update</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($servers as $server)
                            <tr>
                                <td>
                                    <a href="{{ route('admin.servers.view', $server->id) }}" style="font-weight:700;color:#f4f4f5;font-size:13.5px;">
                                        <i class="fa fa-server" style="color:#38bdf8;margin-right:6px;"></i>{{ $server->name }}
                                    </a>
                                </td>

                                <td>
                                    @if($server->user)
                                        <a href="{{ route('admin.users.view', $server->user->id) }}" style="font-weight:600;">{{ $server->user->username }}</a>
                                        <div style="font-size:11px;color:#71717a;">{{ $server->user->email }}</div>
                                    @else
                                        <span style="color:#fb7185;">Unknown User</span>
                                    @endif
                                </td>

                                <td>
                                    @if($server->node)
                                        <span style="color:#d4d4d8;">{{ $server->node->name }}</span>
                                    @else
                                        <span style="color:#fb7185;">Unknown Node</span>
                                    @endif
                                </td>

                                <td>
                                    @if($server->expires_at)
                                        <div style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#f4f4f5;font-variant-numeric:tabular-nums;">{{ $server->expires_at->format('d M Y') }}</div>
                                        <div style="font-size:11px;color:#71717a;font-family:'JetBrains Mono',monospace;"><i class="fa fa-clock-o"></i> {{ $server->expires_at->format('H:i') }}</div>
                                    @else
                                        <span style="color:#71717a;">&mdash; Unlimited</span>
                                    @endif
                                </td>

                                <td class="text-center">
                                    @if(!$server->expires_at)
                                        <span class="label label-default"><i class="fa fa-infinity"></i> Unlimited</span>
                                    @elseif($server->expires_at->isPast())
                                        <span class="label label-danger"><i class="fa fa-exclamation-circle"></i> EXPIRED</span>
                                    @elseif($server->expires_at->diffInDays() <= 3)
                                        <span class="label label-warning"><i class="fa fa-clock-o"></i> {{ $server->expires_at->diffForHumans() }}</span>
                                    @else
                                        <span class="label label-success"><i class="fa fa-check-circle"></i> {{ $server->expires_at->diffForHumans() }}</span>
                                    @endif
                                </td>

                                <td class="text-right">
                                    <form action="{{ route('admin.expiration.update', $server->id) }}" method="POST" class="alx-exp-form">
                                        {!! csrf_field() !!}
                                        <input type="date" name="new_date" class="form-control alx-exp-date" title="Pick a specific date">
                                        <button type="submit" class="btn btn-xs btn-default" title="Set to selected date">
                                            <i class="fa fa-calendar-check-o"></i> Set
                                        </button>
                                        <button type="submit" name="days" value="30" class="btn btn-xs btn-success" title="Add 30 Days from now/current expiry">
                                            +30D
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="text-center" style="padding:40px 16px;color:#71717a;">
                                    <i class="fa fa-clock-o" style="font-size:26px;display:block;margin-bottom:8px;color:#3f3f46;"></i>
                                    No servers match your expiration filter.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            @if($servers->hasPages())
                <div class="box-footer with-border">
                    <div class="col-md-12 text-center">{!! $servers->appends(['filter' => request()->input('filter')])->render() !!}</div>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
