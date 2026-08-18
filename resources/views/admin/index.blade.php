@extends('layouts.admin')

@section('title')
    Administration
@endsection

@section('content-header')
    <h1>Administrative Overview<small>A quick glance at your system.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Index</li>
    </ol>
@endsection

@section('content')
<style>
/* Taste Skill Minimal Overview - Samsung S24 Aesthetic */
.alx-overview-card {
    background: #111111;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 24px;
}
.alx-card-header-inner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    background: #111111;
}
.alx-card-header-inner h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: -0.01em;
}
.alx-card-header-inner h3 i {
    color: #0ea5e9; /* Sky Blue accent */
    margin-right: 6px;
    font-size: 14px;
}
.alx-card-body { padding: 20px; }
.alx-card-body p, .alx-card-body li {
    color: #e5e5e5;
    font-size: 13px;
    line-height: 1.7;
    margin: 0 0 8px 0;
}
.alx-card-body code {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 2px 6px;
    font-size: 12px;
    color: #e5e5e5;
}
.alx-card-body strong { color: #ffffff; font-weight: 500; }
.alx-label-red {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #f87171;
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
}
.alx-label-green {
    background: rgba(14, 165, 233, 0.15); /* Sky Blue instead of green */
    border: 1px solid rgba(14, 165, 233, 0.3);
    color: #38bdf8;
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
}
.alx-btn-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 10px;
}
.alx-link-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 22px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 12px; /* Squarish but soft like Samsung */
    cursor: pointer;
    text-decoration: none !important;
    transition: all 0.2s;
    border: 1px solid transparent;
}
.alx-link-btn-orange {
    background: #0ea5e9; /* Sky Blue */
    color: #fff;
}
.alx-link-btn-orange:hover {
    background: #0284c7;
    color: #fff;
    transform: translateY(-1px);
}
.alx-link-btn-gray {
    background: #262626;
    color: #e5e5e5;
    border: 1px solid rgba(255, 255, 255, 0.15);
}
.alx-link-btn-gray:hover {
    background: #404040;
    color: #fff;
    transform: translateY(-1px);
}
.alx-link-btn-green {
    background: #ef4444; /* Red */
    color: #fff;
}
.alx-link-btn-green:hover {
    background: #dc2626;
    color: #fff;
    transform: translateY(-1px);
}
.alx-stat-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 11px;
    color: #e5e5e5;
    font-weight: 600;
}
</style>

<div class="row">
    <div class="col-md-6">
        <div class="alx-overview-card delay-1">
            <div class="alx-card-header-inner">
                <h3><i class="fa fa-info-circle"></i>System Information</h3>
            </div>
            <div class="alx-card-body">
                <p>You are running <strong>Alxzen Panel</strong> version <code>{{ config('app.version') }}</code>. Your panel is up-to-date!</p>
            </div>
        </div>
    </div>

    <div class="col-md-6">
        <div class="alx-overview-card delay-2">
            <div class="alx-card-header-inner">
                <h3><i class="fa fa-shield"></i>Alxzen Panel Features</h3>
            </div>
            <div class="alx-card-body">
                <ul class="list-unstyled" style="margin:0;">
                    <li style="margin-bottom:8px;"><strong>Developed by:</strong> &nbsp;<span class="alx-label-red">{{ config('app.author') }}</span></li>
                    <li style="margin-bottom:8px;"><strong>Theme Version:</strong> &nbsp;<code>v{{ config('app.theme_version') }}</code></li>
                    <li style="margin-bottom:8px;"><strong>Protection:</strong> &nbsp;<span class="alx-label-green">Active (v{{ config('app.protect_version') }})</span></li>
                    <li style="margin-bottom:0;"><strong>Expiration Engine:</strong> &nbsp;<span class="alx-stat-pill"><i class="fa fa-clock-o"></i> v{{ config('app.expiration_version') }}</span></li>
                </ul>
            </div>
        </div>
    </div>
</div>

<div class="row" style="margin-bottom:20px;">
    <div class="col-xs-12">
        <div class="alx-btn-row">
            <a href="https://t.me/alxzy_group" target="_blank" class="alx-link-btn alx-link-btn-orange">
                <i class="fa fa-paper-plane"></i> Get Help via Telegram
            </a>
            <a href="https://github.com/alxzy-group" target="_blank" class="alx-link-btn alx-link-btn-gray">
                <i class="fa fa-github"></i> GitHub
            </a>
            <a href="https://saweria.co/ALANSTOREMD" target="_blank" class="alx-link-btn alx-link-btn-green">
                <i class="fa fa-heart"></i> Support Us
            </a>
        </div>
    </div>
</div>
</div>

<div class="row">
    <div class="col-md-12 text-center" style="margin-top: 10px;">
        <p class="text-muted" style="font-size:11px; letter-spacing:1px;"><strong>CREDITS: Based on Pterodactyl &mdash; Modified by Alxzen</strong></p>
    </div>
</div>
@endsection
