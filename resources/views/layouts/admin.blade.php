<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>{{ config('app.name', 'alxzen') }} - @yield('title')</title>
        <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
        <meta name="_token" content="{{ csrf_token() }}">

        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png">
        <link rel="icon" type="image/png" href="/favicons/favicon-32x32.png" sizes="32x32">
        <link rel="icon" type="image/png" href="/favicons/favicon-16x16.png" sizes="16x16">
        <link rel="manifest" href="/favicons/manifest.json">
        <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#bc6e3c">
        <link rel="shortcut icon" href="/favicons/favicon.ico">
        <meta name="msapplication-config" content="/favicons/browserconfig.xml">
        <meta name="theme-color" content="#0e4688">
        <style>
            /* --- TASTE SKILL PREMIUM DARK MODE --- */
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body, .wrapper, .main-sidebar, .left-side, .main-header .navbar, .main-header .logo, .main-footer {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                background-color: #000000 !important; /* Deep AMOLED Black */
                border-color: rgba(255, 255, 255, 0.05) !important;
            }
            .content-wrapper { background-color: #000000 !important; }

            /* 1. Header & Sidebar */
            .main-sidebar {
                background-color: #000000 !important;
                border-right: 1px solid rgba(255, 255, 255, 0.06) !important;
            }
            .main-header .logo {
                background-color: #000000 !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
                border-right: 1px solid rgba(255, 255, 255, 0.06) !important;
                color: #ffffff !important;
                font-weight: 600 !important;
                letter-spacing: -0.02em;
            }
            .main-header .navbar {
                background-color: #000000 !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
            }
            .sidebar-menu > li.header {
                background: transparent !important;
                color: #52525b !important;
                font-weight: 600 !important;
                font-size: 11px !important;
                letter-spacing: 0.05em;
                text-transform: uppercase;
                padding: 24px 24px 12px 16px !important;
            }
            .sidebar-menu > li > a {
                font-weight: 500 !important;
                color: #a1a1aa !important;
                border-left: 2px solid transparent !important;
                padding: 10px 16px !important;
                margin: 2px 12px !important;
                border-radius: 12px !important; /* Samsung soft square */
                transition: all 0.2s ease;
            }
            .sidebar-menu > li > a > i {
                margin-right: 12px;
                color: #52525b !important;
                transition: all 0.2s ease;
            }
            .sidebar-menu > li:hover > a {
                background: #111111 !important;
                color: #e4e4e7 !important;
            }
            .sidebar-menu > li:hover > a > i { color: #e4e4e7 !important; }
            .sidebar-menu > li.active > a {
                background: rgba(14, 165, 233, 0.1) !important; /* Sky Blue bg */
                color: #0ea5e9 !important; /* Sky Blue text */
            }
            .sidebar-menu > li.active > a > i { color: #0ea5e9 !important; }
            
            /* Treeview */
            .sidebar-menu .treeview-menu {
                background: transparent !important;
                padding-left: 20px;
            }
            .sidebar-menu .treeview-menu > li > a {
                color: #71717a !important;
                padding: 8px 16px !important;
                border-radius: 10px !important;
                margin: 2px 12px !important;
                transition: all 0.2s ease;
            }
            .sidebar-menu .treeview-menu > li.active > a,
            .sidebar-menu .treeview-menu > li > a:hover {
                background: #111111 !important;
                color: #e4e4e7 !important;
            }

            /* 2. Typography & Page Layout */
            .content-header h1 { 
                font-weight: 600 !important; 
                color: #ffffff !important; 
                letter-spacing: -0.02em !important;
                font-size: 24px !important;
            }
            .content-header > .breadcrumb {
                background: transparent !important; margin-top: 2px !important;
            }
            .content-header > .breadcrumb > li > a { color: #71717a !important; }
            .content-header > .breadcrumb > li > a:hover { color: #e4e4e7 !important; }
            .content-header > .breadcrumb > .active { color: #52525b !important; }

            /* 3. Box / Panel (Samsung S24 Style) */
            .box {
                background: #111111 !important; /* Surface color */
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                border-radius: 16px !important; /* Squarish but smooth */
                box-shadow: 0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02) !important;
                color: #e4e4e7 !important;
                margin-bottom: 24px;
            }
            .box-header {
                color: #ffffff !important;
                padding: 20px 24px !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
                background: transparent !important;
            }
            .box-title { font-size: 15px !important; font-weight: 600 !important; letter-spacing: -0.01em; }
            .box-body { padding: 24px !important; }
            .box-footer {
                background: rgba(255, 255, 255, 0.01) !important;
                border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
                padding: 16px 24px !important;
            }

            /* 4. Forms & Inputs */
            .form-control {
                background: #000000 !important;
                border: 1px solid rgba(255, 255, 255, 0.12) !important;
                border-radius: 12px !important;
                color: #e4e4e7 !important;
                box-shadow: inset 0 1px 2px rgba(0,0,0,0.2) !important;
                padding: 10px 14px !important;
                height: auto !important;
                transition: all 0.2s ease;
            }
            .form-control:focus {
                border-color: #0ea5e9 !important; /* Sky Blue focus */
                box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2), inset 0 1px 2px rgba(0,0,0,0.2) !important;
            }
            .form-control[disabled], .form-control[readonly] { 
                background: rgba(255,255,255,0.02) !important; 
                color: #71717a !important; 
            }
            label { color: #a1a1aa !important; font-weight: 500 !important; font-size: 13px !important; margin-bottom: 8px !important; }

            /* 5. Tables */
            .table > thead > tr > th {
                background: transparent !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
                padding: 14px 16px !important;
                font-size: 12px !important;
                font-weight: 500 !important;
                color: #a1a1aa !important;
                text-transform: uppercase;
                letter-spacing: 0.02em;
            }
            .table > tbody > tr > td {
                border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
                padding: 14px 16px !important;
                font-size: 13px !important;
                color: #e4e4e7 !important;
            }
            .table-hover > tbody > tr:hover { background: rgba(255, 255, 255, 0.02) !important; }

            /* 6. Buttons & Badges */
            .btn {
                font-weight: 600 !important;
                border-radius: 12px !important; /* Squarish smooth buttons */
                font-size: 13px !important;
                transition: all 0.2s ease !important;
                border: 1px solid transparent !important;
                padding: 10px 20px !important;
                box-shadow: 0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08) !important;
            }
            .btn-primary { background: #0ea5e9 !important; color: #ffffff !important; } /* Sky Blue */
            .btn-primary:hover { background: #0284c7 !important; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3) !important; transform: translateY(-1px) !important; }
            .btn-success { background: #10b981 !important; color: #ffffff !important; }
            .btn-danger { background: #ef4444 !important; color: #ffffff !important; }
            .btn-warning { background: #f59e0b !important; color: #ffffff !important; }
            .btn-default { 
                background: #262626 !important; 
                color: #e4e4e7 !important; 
                border-color: rgba(255, 255, 255, 0.12) !important; 
            }
            .btn-default:hover { background: #404040 !important; }
            
            .label { font-weight: 600 !important; border-radius: 6px !important; padding: 4px 8px !important; font-size: 11px !important; }
            .label-primary { background: rgba(14, 165, 233, 0.15) !important; color: #38bdf8 !important; border: 1px solid rgba(14, 165, 233, 0.3) !important; }
            .label-success { background: rgba(16, 185, 129, 0.15) !important; color: #34d399 !important; border: 1px solid rgba(16, 185, 129, 0.25) !important; }
            .label-danger { background: rgba(239, 68, 68, 0.15) !important; color: #f87171 !important; border: 1px solid rgba(239, 68, 68, 0.25) !important; }
            .label-warning { background: rgba(245, 158, 11, 0.15) !important; color: #fbbf24 !important; border: 1px solid rgba(245, 158, 11, 0.25) !important; }

            /* 7. Footer */
            .main-footer { 
                background: #000000 !important;
                color: #52525b !important; 
                border-top: 1px solid rgba(255, 255, 255, 0.05) !important; 
            }

            /* 8. Nav Tabs (Samsung S24 Style) */
            .nav-tabs-custom {
                background: transparent !important;
                box-shadow: none !important;
                margin-bottom: 24px !important;
            }
            .nav-tabs-custom > .nav-tabs {
                border-bottom: none !important;
                display: flex;
                gap: 8px;
                overflow-x: auto;
                background: #111111 !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                border-radius: 12px !important;
                padding: 8px !important;
                white-space: nowrap;
            }
            .nav-tabs-custom > .nav-tabs > li {
                margin-bottom: 0 !important;
            }
            .nav-tabs-custom > .nav-tabs > li > a {
                border: none !important;
                border-radius: 8px !important;
                color: #a1a1aa !important;
                padding: 8px 16px !important;
                font-size: 13px !important;
                font-weight: 600 !important;
                margin: 0 !important;
                transition: all 0.2s ease;
            }
            .nav-tabs-custom > .nav-tabs > li > a:hover {
                color: #e5e5e5 !important;
                background: rgba(255, 255, 255, 0.04) !important;
            }
            .nav-tabs-custom > .nav-tabs > li.active > a, 
            .nav-tabs-custom > .nav-tabs > li.active > a:hover {
                background: rgba(14, 165, 233, 0.1) !important;
                color: #0ea5e9 !important;
                border: none !important;
            }
        </style>
    </head>

        @include('layouts.scripts')

        @section('scripts')
            {!! Theme::css('vendor/select2/select2.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/bootstrap/bootstrap.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/adminlte/admin.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/adminlte/colors/skin-blue.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/sweetalert/sweetalert.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/animate/animate.min.css?t={cache-version}') !!}
            {!! Theme::css('css/pterodactyl.css?t={cache-version}') !!}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css">

            @show
    </head>
    <body class="hold-transition skin-blue fixed sidebar-mini">
        <div class="wrapper">
            <header class="main-header">
                <a href="{{ route('index') }}" class="logo">
                    @if(config('app.logo'))
                        <img src="{{ config('app.logo') }}" alt="Logo" style="max-height: 35px; max-width: 100%; vertical-align: middle;">
                    @else
                        <span>{{ config('app.name', 'alxzen') }}</span>
                    @endif
                </a>
                <nav class="navbar navbar-static-top">
                    <a href="#" class="sidebar-toggle" data-toggle="push-menu" role="button">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </a>
                    <div class="navbar-custom-menu">
                        <ul class="nav navbar-nav">
                            <li class="user-menu">
                                <a href="{{ route('account') }}">
                                    <img src="https://www.gravatar.com/avatar/{{ md5(strtolower(Auth::user()->email)) }}?s=160" class="user-image" alt="User Image">
                                    <span class="hidden-xs">{{ Auth::user()->name_first }} {{ Auth::user()->name_last }}</span>
                                </a>
                            </li>
                            <li><a href="{{ route('index') }}" data-toggle="tooltip" data-placement="bottom" title="Exit Admin Control"><i class="fa fa-server"></i></a></li>
                            <li><a href="{{ route('auth.logout') }}" id="logoutButton" data-toggle="tooltip" data-placement="bottom" title="Logout"><i class="fa fa-sign-out"></i></a></li>
                        </ul>
                    </div>
                </nav>
            </header>
            <aside class="main-sidebar">
                <section class="sidebar">
                    <ul class="sidebar-menu" data-widget="tree">
                        <li class="header">BASIC ADMINISTRATION</li>
                        <li class="{{ Route::currentRouteName() !== 'admin.index' ?: 'active' }}">
                            <a href="{{ route('admin.index') }}">
                                <i class="fa fa-home"></i> <span>Overview</span>
                            </a>
                        </li>

                        {{-- HANYA OWNER ID 1 YANG BISA LIHAT SETTINGS & API --}}
                        @if(Auth::user()->id === 1)
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.settings') ?: 'active' }}">
                            <a href="{{ route('admin.settings')}}">
                                <i class="fa fa-wrench"></i> <span>Settings</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.api') ?: 'active' }}">
                            <a href="{{ route('admin.api.index')}}">
                                <i class="fa fa-gamepad"></i> <span>Application API</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.announcements') ?: 'active' }}">
                            <a href="{{ route('admin.announcements')}}">
                                <i class="fa fa-bullhorn"></i> <span>Announcements</span>
                            </a>
                        </li>
                        @endif

                        <li class="treeview {{ starts_with(Route::currentRouteName(), ['admin.databases', 'admin.locations', 'admin.nodes']) ? 'active' : '' }}">
                            <a href="#">
                                <i class="fa fa-cogs"></i> <span>Management</span>
                                <span class="pull-right-container">
                                    <i class="fa fa-angle-left pull-right"></i>
                                </span>
                            </a>
                            <ul class="treeview-menu">
                                <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.databases') ?: 'active' }}">
                                    <a href="{{ route('admin.databases') }}">
                                        <i class="fa fa-database"></i> <span>Databases</span>
                                    </a>
                                </li>
                                <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.locations') ?: 'active' }}">
                                    <a href="{{ route('admin.locations') }}">
                                        <i class="fa fa-globe"></i> <span>Locations</span>
                                    </a>
                                </li>
                                <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.nodes') ?: 'active' }}">
                                    <a href="{{ route('admin.nodes') }}">
                                        <i class="fa fa-sitemap"></i> <span>Nodes</span>
                                    </a>
                                </li>

                                <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.servers') ?: 'active' }}">
                                    <a href="{{ route('admin.servers') }}">
                                        <i class="fa fa-server"></i> <span>Servers</span>
                                    </a>
                                </li>
                                
                                <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.expiration') ?: 'active' }}">
                                    <a href="{{ route('admin.expiration') }}">
                                        <i class="fa fa-clock-o"></i> <span>Expiration Manager</span>
                                    </a>
                                </li>
                                <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.users') ?: 'active' }}">
                                    <a href="{{ route('admin.users') }}">
                                        <i class="fa fa-users"></i> <span>Users</span>
                                    </a>
                                </li>
                            </ul>
                        </li>

                        <li class="treeview {{ starts_with(Route::currentRouteName(), ['admin.mounts', 'admin.nests']) ? 'active' : '' }}">
                            <a href="#">
                                <i class="fa fa-server"></i> <span>Service Management</span>
                                <span class="pull-right-container">
                                    <i class="fa fa-angle-left pull-right"></i>
                                </span>
                            </a>
                            <ul class="treeview-menu">
                                <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.mounts') ?: 'active' }}">
                                    <a href="{{ route('admin.mounts') }}">
                                        <i class="fa fa-magic"></i> <span>Mounts</span>
                                    </a>
                                </li>
                                <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.nests') ?: 'active' }}">
                                    <a href="{{ route('admin.nests') }}">
                                        <i class="fa fa-th-large"></i> <span>Nests</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </section>
            </aside>
            <div class="content-wrapper">
                <section class="content-header">
                    @yield('content-header')
                </section>
                <section class="content">
                    <div class="row">
                        <div class="col-xs-12">
                            @if (count($errors) > 0)
                                <div class="alert alert-danger">
                                    There was an error validating the data provided.<br><br>
                                    <ul>
                                        @foreach ($errors->all() as $error)
                                            <li>{{ $error }}</li>
                                        @endforeach
                                    </ul>
                                </div>
                            @endif
                            @foreach (Alert::getMessages() as $type => $messages)
                                @foreach ($messages as $message)
                                    <div class="alert alert-{{ $type }} alert-dismissable" role="alert">
                                        {{ $message }}
                                    </div>
                                @endforeach
                            @endforeach
                        </div>
                    </div>
                    @yield('content')
                </section>
            </div>
            <footer class="main-footer">
                <div class="pull-right small text-gray" style="margin-right:10px;margin-top:-7px;">
                    <strong><i class="fa fa-fw {{ $appIsGit ? 'fa-git-square' : 'fa-code-fork' }}"></i></strong> {{ $appVersion }}<br />
                    <strong><i class="fa fa-fw fa-clock-o"></i></strong> {{ round(microtime(true) - LARAVEL_START, 3) }}s
                </div>
                Copyright &copy; 2015 - {{ date('Y') }} <a href="https://github.com/alxzy-group/alxzen">alxzen Software</a>.
            </footer>
        </div>
        @section('footer-scripts')
            <script src="/js/keyboard.polyfill.js" type="application/javascript"></script>
            <script>keyboardeventKeyPolyfill.polyfill();</script>

            {!! Theme::js('vendor/jquery/jquery.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/sweetalert/sweetalert.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/bootstrap/bootstrap.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/slimscroll/jquery.slimscroll.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/adminlte/app.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/bootstrap-notify/bootstrap-notify.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/select2/select2.full.min.js?t={cache-version}') !!}
            {!! Theme::js('js/admin/functions.js?t={cache-version}') !!}
            <script src="/js/autocomplete.js" type="application/javascript"></script>

            @if(Auth::user()->root_admin)
                <script>
                    $('#logoutButton').on('click', function (event) {
                        event.preventDefault();

                        var that = this;
                        swal({
                            title: 'Do you want to log out?',
                            type: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d9534f',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Log out'
                        }, function () {
                             $.ajax({
                                type: 'POST',
                                url: '{{ route('auth.logout') }}',
                                data: {
                                    _token: '{{ csrf_token() }}'
                                },complete: function () {
                                    window.location.href = '{{route('auth.login')}}';
                                }
                        });
                    });
                });
                </script>
            @endif

            <script>
                $(function () {
                    $('[data-toggle="tooltip"]').tooltip();
                })
            </script>
        @show
    </body>
</html>
