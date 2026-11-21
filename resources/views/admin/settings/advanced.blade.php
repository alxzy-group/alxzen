@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'advanced'])

@section('title')
    Advanced Settings
@endsection

@section('content-header')
    <h1>Theme, Subdomain &amp; Engine<small>Configure visual experience, subdomain routing, anti-bot shield, and daemon networking.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Advanced Settings</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')

    <style>
        .alx-adv-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 20px;
            margin-bottom: 24px;
        }
        .alx-adv-col-6 { grid-column: span 6; }
        .alx-adv-col-12 { grid-column: span 12; }
        @media (max-width: 991px) {
            .alx-adv-col-6 { grid-column: span 12; }
        }
        .alx-adv-card {
            background: #111113;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 24px;
            height: 100%;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        .alx-adv-head {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            padding-bottom: 16px;
            margin-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .alx-adv-icon {
            width: 42px;
            height: 42px;
            border-radius: 11px;
            background: rgba(14, 165, 233, 0.12);
            border: 1px solid rgba(56, 189, 248, 0.28);
            color: #38bdf8;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 17px;
            flex-shrink: 0;
        }
        .alx-adv-title {
            margin: 0;
            font-size: 16px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.015em;
        }
        .alx-adv-sub {
            margin: 3px 0 0 0;
            font-size: 12.5px;
            color: #a1a1aa;
        }
        .alx-save-bar {
            background: #111113;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
        }
    </style>

    <form action="" method="POST">
        <div class="alx-adv-grid">
            {{-- Card 1: Panel Theme & Visual Engine --}}
            <div class="alx-adv-col-6">
                <div class="alx-adv-card">
                    <div class="alx-adv-head">
                        <div class="alx-adv-icon">
                            <i class="fa fa-paint-brush"></i>
                        </div>
                        <div>
                            <h3 class="alx-adv-title">Visual Theme &amp; Media Engine</h3>
                            <p class="alx-adv-sub">Configure ambient canvas backgrounds and hero banners for the client workspace.</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group col-md-6">
                            <label class="control-label">Ambient Background Mode</label>
                            <select class="form-control" name="app:theme:type">
                                <option value="network" @if(old('app:theme:type', config('app.theme.type')) == 'network') selected @endif>Particle Network (30 FPS Optimized)</option>
                                <option value="dna" @if(old('app:theme:type', config('app.theme.type')) == 'dna') selected @endif>DNA Floating Particles</option>
                                <option value="bubbles" @if(old('app:theme:type', config('app.theme.type')) == 'bubbles') selected @endif>Ambient Bubbles</option>
                                <option value="saweria" @if(old('app:theme:type', config('app.theme.type')) == 'saweria') selected @endif>Pure Carbon Solid (Zero Particles)</option>
                                <option value="image" @if(old('app:theme:type', config('app.theme.type')) == 'image') selected @endif>Custom Wallpaper Image URL</option>
                                <option value="video" @if(old('app:theme:type', config('app.theme.type')) == 'video') selected @endif>Custom Motion Video URL</option>
                            </select>
                            <p class="text-muted small">Global background style across login &amp; client panel.</p>
                        </div>
                        <div class="form-group col-md-6">
                            <label class="control-label">Custom Wallpaper / Video URL</label>
                            <input type="text" class="form-control" name="app:theme:data" value="{{ old('app:theme:data', config('app.theme.data')) }}" placeholder="https://example.com/bg.mp4">
                            <p class="text-muted small">Direct URL when Custom Image or Video mode is active.</p>
                        </div>
                        <div class="form-group col-md-12" style="margin-bottom:0;">
                            <label class="control-label">Dashboard Hero Banner URL (16:9)</label>
                            <input type="text" class="form-control" name="app:dashboard:banner" value="{{ old('app:dashboard:banner', config('app.dashboard.banner')) }}" placeholder="https://example.com/banner.jpg">
                            <p class="text-muted small" style="margin-bottom:0;">Optional widescreen image (.jpg/.png/.gif) or video (.mp4/.webm) banner displayed above the client dashboard.</p>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Card 2: Subdomain Manager & HTTP Networking --}}
            <div class="alx-adv-col-6">
                <div class="alx-adv-card">
                    <div class="alx-adv-head">
                        <div class="alx-adv-icon" style="background: rgba(16, 185, 129, 0.12); border-color: rgba(52, 211, 153, 0.28); color: #34d399;">
                            <i class="fa fa-globe"></i>
                        </div>
                        <div>
                            <h3 class="alx-adv-title">Subdomain Router &amp; Daemon Timeouts</h3>
                            <p class="alx-adv-sub">Wildcard subdomain routing domain and Wings HTTP communication timeouts.</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group col-md-12">
                            <label class="control-label">Base Subdomain Domain (Leave blank to disable)</label>
                            <input type="text" class="form-control" name="app:subdomain_base" value="{{ old('app:subdomain_base', config('app.subdomain_base')) }}" placeholder="alxzyy.my.id">
                            <p class="text-muted small">Allows clients to attach instant subdomains (e.g. <code>play.alxzyy.my.id</code>) to their server allocations.</p>
                        </div>
                        <div class="form-group col-md-6" style="margin-bottom:0;">
                            <label class="control-label">Wings Connect Timeout (sec)</label>
                            <input type="number" required class="form-control" name="pterodactyl:guzzle:connect_timeout" value="{{ old('pterodactyl:guzzle:connect_timeout', config('pterodactyl.guzzle.connect_timeout')) }}">
                            <p class="text-muted small" style="margin-bottom:0;">Seconds to wait for daemon socket connection.</p>
                        </div>
                        <div class="form-group col-md-6" style="margin-bottom:0;">
                            <label class="control-label">Wings Request Timeout (sec)</label>
                            <input type="number" required class="form-control" name="pterodactyl:guzzle:timeout" value="{{ old('pterodactyl:guzzle:timeout', config('pterodactyl.guzzle.timeout')) }}">
                            <p class="text-muted small" style="margin-bottom:0;">Seconds to wait for daemon response completion.</p>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Card 3: Anti-Bot reCAPTCHA --}}
            <div class="alx-adv-col-6">
                <div class="alx-adv-card">
                    <div class="alx-adv-head">
                        <div class="alx-adv-icon" style="background: rgba(245, 158, 11, 0.12); border-color: rgba(251, 191, 36, 0.28); color: #fbbf24;">
                            <i class="fa fa-shield"></i>
                        </div>
                        <div>
                            <h3 class="alx-adv-title">Google reCAPTCHA Anti-Bot Shield</h3>
                            <p class="alx-adv-sub">Protect authentication endpoints against credential stuffing and automated brute-force.</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group col-md-4">
                            <label class="control-label">Shield Status</label>
                            <select class="form-control" name="recaptcha:enabled">
                                <option value="true">Enabled</option>
                                <option value="false" @if(old('recaptcha:enabled', config('recaptcha.enabled')) == '0') selected @endif>Disabled</option>
                            </select>
                        </div>
                        <div class="form-group col-md-8">
                            <label class="control-label">Site Key (Public)</label>
                            <input type="text" required class="form-control" name="recaptcha:website_key" value="{{ old('recaptcha:website_key', config('recaptcha.website_key')) }}">
                        </div>
                        <div class="form-group col-md-12" style="margin-bottom:0;">
                            <label class="control-label">Secret Key (Private)</label>
                            <input type="text" required class="form-control" name="recaptcha:secret_key" value="{{ old('recaptcha:secret_key', config('recaptcha.secret_key')) }}">
                            <p class="text-muted small" style="margin-bottom:0;">Used for server-to-Google verification. Keep strictly confidential.</p>
                        </div>
                    </div>
                    @if($showRecaptchaWarning)
                        <div class="alert alert-warning" style="margin-top: 14px; margin-bottom: 0;">
                            <i class="fa fa-exclamation-triangle"></i> You are using default shipped reCAPTCHA keys. <a href="https://www.google.com/recaptcha/admin" target="_blank" style="color:#fff; text-decoration:underline;">Generate custom keys</a> for production.
                        </div>
                    @endif
                </div>
            </div>

            {{-- Card 4: Automatic Allocation Creation --}}
            <div class="alx-adv-col-6">
                <div class="alx-adv-card">
                    <div class="alx-adv-head">
                        <div class="alx-adv-icon" style="background: rgba(56, 189, 248, 0.12); border-color: rgba(56, 189, 248, 0.28); color: #38bdf8;">
                            <i class="fa fa-plug"></i>
                        </div>
                        <div>
                            <h3 class="alx-adv-title">Automatic Port Allocation Provisioning</h3>
                            <p class="alx-adv-sub">Allow clients to self-provision additional network ports within a designated port pool.</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group col-md-4">
                            <label class="control-label">Self-Provision</label>
                            <select class="form-control" name="pterodactyl:client_features:allocations:enabled">
                                <option value="false">Disabled</option>
                                <option value="true" @if(old('pterodactyl:client_features:allocations:enabled', config('pterodactyl.client_features.allocations.enabled'))) selected @endif>Enabled</option>
                            </select>
                        </div>
                        <div class="form-group col-md-4">
                            <label class="control-label">Starting Port</label>
                            <input type="number" class="form-control" name="pterodactyl:client_features:allocations:range_start" value="{{ old('pterodactyl:client_features:allocations:range_start', config('pterodactyl.client_features.allocations.range_start')) }}" placeholder="30000">
                        </div>
                        <div class="form-group col-md-4">
                            <label class="control-label">Ending Port</label>
                            <input type="number" class="form-control" name="pterodactyl:client_features:allocations:range_end" value="{{ old('pterodactyl:client_features:allocations:range_end', config('pterodactyl.client_features.allocations.range_end')) }}" placeholder="35000">
                        </div>
                        <div class="col-md-12">
                            <p class="text-muted small" style="margin-bottom:0;">When enabled, users can generate new port allocations on their server's node within the specified port range.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="alx-save-bar">
            <div style="font-size: 12.5px; color: #a1a1aa;">
                <i class="fa fa-bolt" style="color: #38bdf8; margin-right: 6px;"></i>
                All advanced engine &amp; theme changes are applied instantaneously.
            </div>
            <div>
                {{ csrf_field() }}
                <button type="submit" name="_method" value="PATCH" class="btn btn-primary">
                    <i class="fa fa-check-circle"></i> Apply &amp; Save Settings
                </button>
            </div>
        </div>
    </form>
@endsection
