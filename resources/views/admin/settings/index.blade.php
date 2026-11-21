@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'basic'])

@section('title')
    General Settings
@endsection

@section('content-header')
    <h1>Platform Configuration<small>Manage brand identity, localization, and security enforcement.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Settings</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')

    <style>
        .alx-bento-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 20px;
            margin-bottom: 24px;
        }
        .alx-bento-col-7 { grid-column: span 7; }
        .alx-bento-col-5 { grid-column: span 5; }
        @media (max-width: 991px) {
            .alx-bento-col-7, .alx-bento-col-5 { grid-column: span 12; }
        }
        .alx-setting-card {
            background: #111113;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 24px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        .alx-setting-head {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            padding-bottom: 18px;
            margin-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .alx-setting-icon {
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
        .alx-setting-title {
            margin: 0;
            font-size: 16px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.015em;
        }
        .alx-setting-sub {
            margin: 3px 0 0 0;
            font-size: 12.5px;
            color: #a1a1aa;
        }
        .alx-2fa-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 6px;
        }
        @media (max-width: 575px) {
            .alx-2fa-grid { grid-template-columns: 1fr; }
        }
        .alx-2fa-option {
            position: relative;
            cursor: pointer;
            margin: 0 !important;
        }
        .alx-2fa-option input {
            position: absolute;
            opacity: 0;
            pointer-events: none;
        }
        .alx-2fa-box {
            background: #09090b;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 12px;
            padding: 14px 12px;
            text-align: center;
            transition: all 0.15s ease;
        }
        .alx-2fa-box i {
            display: block;
            font-size: 18px;
            margin-bottom: 8px;
            color: #71717a;
            transition: color 0.15s ease;
        }
        .alx-2fa-box .title {
            display: block;
            font-size: 13px;
            font-weight: 700;
            color: #e4e4e7;
        }
        .alx-2fa-box .desc {
            display: block;
            font-size: 11px;
            color: #71717a;
            margin-top: 2px;
        }
        .alx-2fa-option input:checked + .alx-2fa-box {
            background: rgba(14, 165, 233, 0.12);
            border-color: #0ea5e9;
            box-shadow: 0 0 0 1px rgba(14, 165, 233, 0.4), 0 4px 14px rgba(14, 165, 233, 0.18);
        }
        .alx-2fa-option input:checked + .alx-2fa-box i {
            color: #38bdf8;
        }
        .alx-2fa-option input:checked + .alx-2fa-box .title {
            color: #ffffff;
        }
        .alx-2fa-option input:checked + .alx-2fa-box .desc {
            color: #bae6fd;
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

    <form action="{{ route('admin.settings') }}" method="POST">
        <div class="alx-bento-grid">
            {{-- Left Bento: Brand & Localization --}}
            <div class="alx-bento-col-7">
                <div class="alx-setting-card">
                    <div>
                        <div class="alx-setting-head">
                            <div class="alx-setting-icon">
                                <i class="fa fa-cube"></i>
                            </div>
                            <div>
                                <h3 class="alx-setting-title">Brand Identity &amp; Localization</h3>
                                <p class="alx-setting-sub">Customize your panel's public title, login logo mark, and default interface language.</p>
                            </div>
                        </div>

                        <div class="row">
                            <div class="form-group col-md-6">
                                <label class="control-label">Company / Panel Name</label>
                                <input type="text" class="form-control" name="app:name" value="{{ old('app:name', config('app.name')) }}" placeholder="alxzen" />
                                <p class="text-muted"><small>Displayed across the dashboard header, browser title, and transactional emails.</small></p>
                            </div>
                            <div class="form-group col-md-6">
                                <label class="control-label">Default Interface Language</label>
                                <select name="app:locale" class="form-control">
                                    @foreach($languages as $key => $value)
                                        <option value="{{ $key }}" @if(config('app.locale') === $key) selected @endif>{{ $value }}</option>
                                    @endforeach
                                </select>
                                <p class="text-muted"><small>Default language localization when rendering UI components.</small></p>
                            </div>
                            <div class="form-group col-md-12" style="margin-bottom:0;">
                                <label class="control-label">Custom Brand Logo URL</label>
                                <input type="url" class="form-control" name="app:logo" value="{{ old('app:logo', config('app.logo')) }}" placeholder="https://example.com/logo.png" />
                                <p class="text-muted" style="margin-bottom:0;"><small>Direct image URL for the authentication &amp; topbar logo. Leave blank to use the built-in Alxzen wordmark.</small></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Right Bento: 2FA Security Policy --}}
            <div class="alx-bento-col-5">
                <div class="alx-setting-card">
                    <div>
                        <div class="alx-setting-head">
                            <div class="alx-setting-icon" style="background: rgba(16, 185, 129, 0.12); border-color: rgba(52, 211, 153, 0.28); color: #34d399;">
                                <i class="fa fa-shield"></i>
                            </div>
                            <div>
                                <h3 class="alx-setting-title">Zero-Trust 2FA Enforcement</h3>
                                <p class="alx-setting-sub">Require Time-based One-Time Password (TOTP) two-factor authentication for accounts.</p>
                            </div>
                        </div>

                        @php
                            $level = (int) old('pterodactyl:auth:2fa_required', config('pterodactyl.auth.2fa_required'));
                        @endphp
                        <label class="control-label">Mandatory 2-Factor Policy</label>
                        <div class="alx-2fa-grid">
                            <label class="alx-2fa-option">
                                <input type="radio" name="pterodactyl:auth:2fa_required" value="0" @if ($level === 0) checked @endif>
                                <div class="alx-2fa-box">
                                    <i class="fa fa-unlock-alt"></i>
                                    <span class="title">Not Required</span>
                                    <span class="desc">Optional for users</span>
                                </div>
                            </label>
                            <label class="alx-2fa-option">
                                <input type="radio" name="pterodactyl:auth:2fa_required" value="1" @if ($level === 1) checked @endif>
                                <div class="alx-2fa-box">
                                    <i class="fa fa-user-secret"></i>
                                    <span class="title">Admin Only</span>
                                    <span class="desc">Staff accounts</span>
                                </div>
                            </label>
                            <label class="alx-2fa-option">
                                <input type="radio" name="pterodactyl:auth:2fa_required" value="2" @if ($level === 2) checked @endif>
                                <div class="alx-2fa-box">
                                    <i class="fa fa-lock"></i>
                                    <span class="title">All Users</span>
                                    <span class="desc">Strict zero-trust</span>
                                </div>
                            </label>
                        </div>
                        <p class="text-muted" style="margin-top: 12px; margin-bottom: 0;">
                            <small>Any account matching the selected policy group will be required to configure TOTP 2FA before accessing the Panel.</small>
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div class="alx-save-bar">
            <div style="font-size: 12.5px; color: #a1a1aa;">
                <i class="fa fa-info-circle" style="color: #38bdf8; margin-right: 6px;"></i>
                Changes take effect immediately across all active sessions.
            </div>
            <div>
                {!! csrf_field() !!}
                <button type="submit" name="_method" value="PATCH" class="btn btn-primary">
                    <i class="fa fa-check-circle"></i> Save Configuration
                </button>
            </div>
        </div>
    </form>
@endsection
