@extends('layouts.admin')

@section('title')
    Create User
@endsection

@section('content-header')
    <h1>Create User Account<small>Provision a new client or sub-administrator account on the panel.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.users') }}">Users</a></li>
        <li class="active">Create</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <form method="post">
        <div class="col-md-6">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title"><i class="fa fa-id-card-o" style="color:#38bdf8;margin-right:8px;"></i>Account Identity</h3>
                </div>
                <div class="box-body">
                    <div class="form-group">
                        <label for="email" class="control-label">Email Address</label>
                        <div>
                            <input type="text" autocomplete="off" name="email" value="{{ old('email') }}" class="form-control" placeholder="user@example.com" />
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="username" class="control-label">Username</label>
                        <div>
                            <input type="text" autocomplete="off" name="username" value="{{ old('username') }}" class="form-control" placeholder="username" />
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group col-md-6">
                            <label for="name_first" class="control-label">First Name</label>
                            <div>
                                <input type="text" autocomplete="off" name="name_first" value="{{ old('name_first') }}" class="form-control" />
                            </div>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="name_last" class="control-label">Last Name</label>
                            <div>
                                <input type="text" autocomplete="off" name="name_last" value="{{ old('name_last') }}" class="form-control" />
                            </div>
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label class="control-label">Default Interface Language</label>
                        <div>
                            <select name="language" class="form-control">
                                @foreach($languages as $key => $value)
                                    <option value="{{ $key }}" @if(config('app.locale') === $key) selected @endif>{{ $value }}</option>
                                @endforeach
                            </select>
                            <p class="text-muted" style="margin-bottom:0;"><small>The default language to use when rendering the Panel for this user.</small></p>
                        </div>
                    </div>
                </div>
                <div class="box-footer">
                    {!! csrf_field() !!}
                    <button type="submit" class="btn btn-success btn-sm"><i class="fa fa-user-plus" style="margin-right:5px;"></i> Create User Account</button>
                </div>
            </div>
        </div>
        <div class="col-md-6">
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
                                <option value="1">@lang('strings.yes') — Panel Administrator</option>
                            </select>
                            <p class="text-muted" style="margin-bottom:0;"><small>Setting this to 'Yes' grants administrative access (Sub-Admins remain isolated from viewing other users' servers under AlxZen Anti-Intip).</small></p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title"><i class="fa fa-key" style="color:#34d399;margin-right:8px;"></i>Password &amp; Credentials</h3>
                    <div class="box-tools">
                        <button type="button" id="gen_pass_bttn" class="btn btn-xs btn-default"><i class="fa fa-random" style="margin-right:4px;"></i> Generate Password</button>
                    </div>
                </div>
                <div class="box-body">
                    <div class="alert alert-info" style="margin-bottom:14px;">
                        <p style="margin:0;">Providing a password is optional. New user emails prompt users to create a password the first time they log in.</p>
                    </div>
                    <div id="gen_pass" class="alert alert-success" style="display:none;margin-bottom:14px;font-family:'JetBrains Mono',monospace;"></div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label for="pass" class="control-label">Initial Password</label>
                        <div>
                            <input type="password" name="password" class="form-control" placeholder="Leave blank to send setup email or click Generate" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>$("#gen_pass_bttn").click(function (event) {
            event.preventDefault();
            $.ajax({
                type: "GET",
                url: "/password-gen/12",
                headers: {
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
               },
                success: function(data) {
                    $("#gen_pass").html('<strong>Generated Password:</strong> ' + data).slideDown();
                    $('input[name="password"], input[name="password_confirmation"]').val(data);
                    return false;
                }
            });
            return false;
        });
    </script>
@endsection
