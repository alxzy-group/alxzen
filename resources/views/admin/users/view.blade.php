@extends('layouts.admin')

@section('title')
    Manage User: {{ $user->username }}
@endsection

@section('content-header')
    <h1>{{ $user->name_first }} {{ $user->name_last}}<small>{{ $user->username }} &middot; #{{ $user->id }}</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.users') }}">Users</a></li>
        <li class="active">{{ $user->username }}</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <form action="{{ route('admin.users.view', $user->id) }}" method="post">
        <div class="col-md-6">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title"><i class="fa fa-id-card-o" style="color:#38bdf8;margin-right:8px;"></i>Account Identity</h3>
                </div>
                <div class="box-body">
                    <div class="form-group">
                        <label for="email" class="control-label">Email Address</label>
                        <div>
                            <input type="email" name="email" value="{{ $user->email }}" class="form-control form-autocomplete-stop">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="registered" class="control-label">Username</label>
                        <div>
                            <input type="text" name="username" value="{{ $user->username }}" class="form-control form-autocomplete-stop">
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group col-md-6">
                            <label for="registered" class="control-label">First Name</label>
                            <div>
                                <input type="text" name="name_first" value="{{ $user->name_first }}" class="form-control form-autocomplete-stop">
                            </div>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="registered" class="control-label">Last Name</label>
                            <div>
                                <input type="text" name="name_last" value="{{ $user->name_last }}" class="form-control form-autocomplete-stop">
                            </div>
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label class="control-label">Default Interface Language</label>
                        <div>
                            <select name="language" class="form-control">
                                @foreach($languages as $key => $value)
                                    <option value="{{ $key }}" @if($user->language === $key) selected @endif>{{ $value }}</option>
                                @endforeach
                            </select>
                            <p class="text-muted" style="margin-bottom:0;"><small>The default language to use when rendering the Panel for this user.</small></p>
                        </div>
                    </div>
                </div>
                <div class="box-footer">
                    {!! csrf_field() !!}
                    {!! method_field('PATCH') !!}
                    <button type="submit" class="btn btn-primary btn-sm"><i class="fa fa-save" style="margin-right:5px;"></i> Update User Account</button>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title"><i class="fa fa-key" style="color:#34d399;margin-right:8px;"></i>Password &amp; Credentials</h3>
                </div>
                <div class="box-body">
                    <div class="alert alert-success" style="display:none;margin-bottom:10px;" id="gen_pass"></div>
                    <div class="form-group no-margin-bottom">
                        <label for="password" class="control-label">New Password <span class="field-optional"></span></label>
                        <div>
                            <input type="password" id="password" name="password" class="form-control form-autocomplete-stop" placeholder="Leave blank to keep existing password">
                            <p class="text-muted small" style="margin-bottom:0;">Leave blank to keep this user's password unchanged. User will not receive an email notification if changed here.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title"><i class="fa fa-shield" style="color:#f59e0b;margin-right:8px;"></i>Access Permissions</h3>
                </div>
                <div class="box-body">
                    <div class="form-group" style="margin-bottom:0;">
                        <label for="root_admin" class="control-label">Administrator Role</label>
                        <div>
                            <select name="root_admin" class="form-control">
                                <option value="0">@lang('strings.no') — Standard Client</option>
                                <option value="1" {{ $user->root_admin ? 'selected="selected"' : '' }}>@lang('strings.yes') — Panel Administrator</option>
                            </select>
                            <p class="text-muted" style="margin-bottom:0;"><small>Setting this to 'Yes' grants administrative access.</small></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
    <div class="col-xs-12">
        <div class="box box-danger">
            <div class="box-header with-border">
                <h3 class="box-title"><i class="fa fa-exclamation-triangle" style="color:#fb7185;margin-right:8px;"></i>Danger Zone &mdash; Delete User Account</h3>
            </div>
            <div class="box-body">
                <p class="no-margin" style="color:#d4d4d8;">There must be no active servers associated with this account in order for it to be deleted ({{ $user->servers->count() }} linked servers).</p>
            </div>
            <div class="box-footer">
                <form action="{{ route('admin.users.view', $user->id) }}" method="POST">
                    {!! csrf_field() !!}
                    {!! method_field('DELETE') !!}
                    <input id="delete" type="submit" class="btn btn-sm btn-danger pull-right" {{ $user->servers->count() < 1 ?: 'disabled' }} value="Delete User" />
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
