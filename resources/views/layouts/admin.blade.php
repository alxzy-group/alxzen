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
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

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

        <style>
            /* ==========================================================================
               ALXZEN INDUSTRY-STANDARD ADMIN DESIGN SYSTEM (UNIFIED & RESPONSIVE)
               Loaded AFTER pterodactyl.css & AdminLTE to ensure 100% consistency
               ========================================================================== */
            :root {
                --alx-bg-page: #09090b;
                --alx-bg-surface: #111113;
                --alx-bg-elevated: #18181b;
                --alx-bg-input: #09090b;
                --alx-border: rgba(255, 255, 255, 0.08);
                --alx-border-strong: rgba(255, 255, 255, 0.14);
                --alx-text-primary: #f4f4f5;
                --alx-text-secondary: #a1a1aa;
                --alx-text-muted: #71717a;
                --alx-accent: #0ea5e9;
                --alx-accent-light: #38bdf8;
            }

            body, .wrapper, .content-wrapper, .main-footer {
                font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                background-color: var(--alx-bg-page) !important;
                color: var(--alx-text-primary) !important;
                -webkit-font-smoothing: antialiased;
            }

            /* 1. Top Navbar & Sidebar */
            .main-header {
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
                border-bottom: 1px solid var(--alx-border) !important;
            }
            .main-header .logo {
                background-color: #0c0c0e !important;
                border-bottom: 1px solid var(--alx-border) !important;
                border-right: 1px solid var(--alx-border) !important;
                color: #ffffff !important;
                font-weight: 800 !important;
                letter-spacing: -0.03em;
                font-size: 19px !important;
            }
            .main-header .navbar {
                background-color: #0c0c0e !important;
                border-bottom: 1px solid var(--alx-border) !important;
            }
            .main-header .navbar .sidebar-toggle,
            .main-header .navbar .nav > li > a {
                color: var(--alx-text-secondary) !important;
                transition: color 0.15s ease, background-color 0.15s ease;
            }
            .main-header .navbar .sidebar-toggle:hover,
            .main-header .navbar .nav > li > a:hover {
                background-color: var(--alx-bg-elevated) !important;
                color: #ffffff !important;
            }
            .main-sidebar, .left-side {
                background-color: #0c0c0e !important;
                border-right: 1px solid var(--alx-border) !important;
                box-shadow: none !important;
            }
            .sidebar-menu > li.header {
                background: transparent !important;
                color: var(--alx-text-muted) !important;
                font-weight: 700 !important;
                font-size: 10.5px !important;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                padding: 20px 20px 8px 18px !important;
            }
            .sidebar-menu > li > a {
                font-weight: 600 !important;
                font-size: 13px !important;
                color: var(--alx-text-secondary) !important;
                border-left: none !important;
                padding: 10px 14px !important;
                margin: 3px 10px !important;
                border-radius: 11px !important;
                border: 1px solid transparent !important;
                transition: all 0.15s ease;
            }
            .sidebar-menu > li > a > i {
                margin-right: 10px;
                color: var(--alx-text-muted) !important;
                transition: color 0.15s ease;
            }
            .sidebar-menu > li:hover > a {
                background: var(--alx-bg-elevated) !important;
                color: var(--alx-text-primary) !important;
                border-color: var(--alx-border) !important;
            }
            .sidebar-menu > li:hover > a > i { color: var(--alx-accent-light) !important; }
            .sidebar-menu > li.active > a {
                background: linear-gradient(135deg, rgba(14, 165, 233, 0.16) 0%, rgba(2, 132, 199, 0.24) 100%) !important;
                color: #38bdf8 !important;
                border-color: rgba(56, 189, 248, 0.35) !important;
                box-shadow: 0 2px 10px rgba(14, 165, 233, 0.12) !important;
            }
            .sidebar-menu > li.active > a > i { color: #38bdf8 !important; }

            /* Sidebar Treeview */
            .sidebar-menu .treeview-menu {
                background: transparent !important;
                padding-left: 14px;
                margin-bottom: 4px;
            }
            .sidebar-menu .treeview-menu > li > a {
                color: var(--alx-text-secondary) !important;
                font-size: 12.5px !important;
                font-weight: 500 !important;
                padding: 8px 14px !important;
                border-radius: 9px !important;
                margin: 2px 10px !important;
                transition: all 0.15s ease;
            }
            .sidebar-menu .treeview-menu > li.active > a,
            .sidebar-menu .treeview-menu > li > a:hover {
                background: var(--alx-bg-elevated) !important;
                color: #38bdf8 !important;
            }

            /* 2. Content Header & Breadcrumbs */
            .content-header {
                padding: 20px 24px 8px 24px !important;
            }
            .content-header > h1 {
                font-weight: 800 !important;
                color: #ffffff !important;
                letter-spacing: -0.025em !important;
                font-size: 22px !important;
            }
            .content-header > h1 > small {
                color: var(--alx-text-secondary) !important;
                font-weight: 500 !important;
                font-size: 13px !important;
                margin-left: 8px !important;
            }
            .content-header > .breadcrumb {
                background: transparent !important;
                margin-top: 2px !important;
                font-size: 12px !important;
            }
            .content-header > .breadcrumb > li > a { color: var(--alx-text-secondary) !important; }
            .content-header > .breadcrumb > li > a:hover { color: #38bdf8 !important; }
            .content-header > .breadcrumb > .active { color: var(--alx-text-muted) !important; }
            .content { padding: 16px 24px 32px 24px !important; }

            /* 3. Unified Cards & Boxes (.box, .alx-card, .alx-admin-card, .alx-overview-card) */
            .box, .alx-card, .alx-admin-card, .alx-overview-card {
                background: var(--alx-bg-surface) !important;
                border: 1px solid var(--alx-border) !important;
                border-top: 1px solid var(--alx-border) !important;
                border-radius: 16px !important;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03) !important;
                color: var(--alx-text-primary) !important;
                margin-bottom: 24px !important;
                overflow: hidden;
            }
            .box-header, .alx-card-header, .alx-admin-header, .alx-card-header-inner {
                color: #ffffff !important;
                padding: 16px 22px !important;
                border-bottom: 1px solid var(--alx-border) !important;
                background: rgba(255, 255, 255, 0.015) !important;
            }
            .box-title, .alx-card-title, .alx-admin-title {
                font-size: 15px !important;
                font-weight: 700 !important;
                letter-spacing: -0.015em !important;
                color: #ffffff !important;
            }
            .box-body { padding: 22px !important; }
            .box-body.no-padding, .box-body.table-responsive.no-padding { padding: 0 !important; }
            .box-footer, .alx-admin-pager, .alx-pagination {
                background: rgba(255, 255, 255, 0.01) !important;
                border-top: 1px solid var(--alx-border) !important;
                padding: 14px 22px !important;
            }

            /* 4. Unified Tables (.table, .alx-table, .alx-admin-table) */
            .table, .alx-table, .alx-admin-table {
                width: 100%;
                margin-bottom: 0 !important;
                border-collapse: collapse !important;
                font-variant-numeric: tabular-nums;
            }
            .table > thead > tr > th,
            .table > tbody > tr > th,
            .alx-table thead th,
            .alx-admin-table thead th {
                background: rgba(255, 255, 255, 0.02) !important;
                border-top: none !important;
                border-bottom: 1px solid var(--alx-border) !important;
                padding: 13px 18px !important;
                font-size: 11px !important;
                font-weight: 700 !important;
                color: var(--alx-text-secondary) !important;
                text-transform: uppercase !important;
                letter-spacing: 0.06em !important;
            }
            .table > tbody > tr > td,
            .alx-table tbody td,
            .alx-admin-table tbody td {
                border-top: none !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
                padding: 13px 18px !important;
                font-size: 13px !important;
                color: var(--alx-text-primary) !important;
                vertical-align: middle !important;
            }
            .table > tbody > tr:last-child > td,
            .alx-table tbody tr:last-child td,
            .alx-admin-table tbody tr:last-child td {
                border-bottom: none !important;
            }
            .table-hover > tbody > tr:hover,
            .alx-table tbody tr:hover,
            .alx-admin-table tbody tr:hover {
                background-color: rgba(255, 255, 255, 0.025) !important;
            }
            .table td a:not(.btn):not(.alx-btn):not(.alx-action),
            .alx-table td a:not(.btn):not(.alx-btn):not(.alx-action):not(.alx-stat-pill),
            .alx-admin-table td a:not(.btn):not(.alx-btn):not(.alx-action) {
                color: #38bdf8 !important;
                font-weight: 600 !important;
                text-decoration: none !important;
                transition: color 0.15s ease;
            }
            .table td a:not(.btn):hover,
            .alx-table td a:not(.btn):hover,
            .alx-admin-table td a:not(.btn):hover {
                color: #7dd3fc !important;
            }

            /* Code & Monospace Pills */
            code {
                font-family: 'JetBrains Mono', monospace !important;
                background: #18181b !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 6px !important;
                padding: 2px 7px !important;
                font-size: 12px !important;
                color: #38bdf8 !important;
            }

            /* 5. Forms, Inputs & Select2 */
            .form-control, input.form-control, textarea.form-control, select.form-control,
            .alx-admin-input, .alx-search-group .form-control, .alx-date-input {
                background-color: var(--alx-bg-input) !important;
                border: 1px solid var(--alx-border-strong) !important;
                border-radius: 10px !important;
                color: var(--alx-text-primary) !important;
                box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3) !important;
                padding: 8px 13px !important;
                font-size: 13px !important;
                height: auto !important;
                min-height: 36px;
                transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
            }
            .form-control:focus, input.form-control:focus, textarea.form-control:focus, select.form-control:focus,
            .alx-admin-input:focus, .alx-search-group .form-control:focus, .alx-date-input:focus {
                border-color: var(--alx-accent) !important;
                box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.18), inset 0 1px 2px rgba(0, 0, 0, 0.3) !important;
                outline: none !important;
            }
            .form-control[disabled], .form-control[readonly], fieldset[disabled] .form-control {
                background-color: rgba(255, 255, 255, 0.03) !important;
                color: var(--alx-text-muted) !important;
            }
            .input-group .input-group-addon {
                background-color: var(--alx-bg-elevated) !important;
                border-color: var(--alx-border-strong) !important;
                color: var(--alx-text-secondary) !important;
                border-radius: 10px 0 0 10px !important;
            }
            .input-group .form-control:last-child {
                border-radius: 0 10px 10px 0 !important;
            }
            label, label.control-label, .form-label {
                color: #d4d4d8 !important;
                font-weight: 600 !important;
                font-size: 12.5px !important;
                margin-bottom: 6px !important;
            }
            .text-muted, p.small.text-muted, .help-block {
                color: var(--alx-text-muted) !important;
                font-size: 12px !important;
            }

            /* Select2 Dark Precision Overrides */
            .select2-container--default .select2-selection--single,
            .select2-container--default .select2-selection--multiple {
                background-color: var(--alx-bg-input) !important;
                border: 1px solid var(--alx-border-strong) !important;
                border-radius: 10px !important;
                min-height: 38px !important;
                padding: 4px 8px !important;
            }
            .select2-container--default .select2-selection--single .select2-selection__rendered {
                color: var(--alx-text-primary) !important;
                line-height: 28px !important;
            }
            .select2-container--default .select2-selection--single .select2-selection__arrow {
                height: 36px !important;
            }
            .select2-dropdown {
                background-color: var(--alx-bg-elevated) !important;
                border: 1px solid var(--alx-border-strong) !important;
                border-radius: 10px !important;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
                overflow: hidden;
            }
            .select2-results__option {
                background-color: var(--alx-bg-elevated) !important;
                color: var(--alx-text-primary) !important;
                padding: 8px 12px !important;
                font-size: 13px !important;
            }
            .select2-container--default .select2-results__option[aria-selected=true] {
                background-color: rgba(14, 165, 233, 0.15) !important;
                color: #38bdf8 !important;
            }
            .select2-container--default .select2-results__option--highlighted[aria-selected] {
                background-color: var(--alx-accent) !important;
                color: #ffffff !important;
            }
            .select2-container--default .select2-selection--multiple .select2-selection__choice {
                background-color: rgba(14, 165, 233, 0.18) !important;
                border: 1px solid rgba(56, 189, 248, 0.35) !important;
                color: #38bdf8 !important;
                border-radius: 6px !important;
            }

            /* 6. Industry-Standard Tactile Buttons (.btn, .alx-btn, .alx-admin-btn, .alx-link-btn) */
            .btn, .alx-btn, .alx-admin-btn, .alx-link-btn {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 6px !important;
                font-family: 'Plus Jakarta Sans', 'Inter', sans-serif !important;
                font-weight: 600 !important;
                border-radius: 10px !important;
                font-size: 12.5px !important;
                line-height: 1.3 !important;
                padding: 8px 16px !important;
                border: 1px solid transparent !important;
                transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s ease, background 0.15s ease, border-color 0.15s ease !important;
                text-decoration: none !important;
                cursor: pointer;
                white-space: nowrap;
            }
            .btn-sm, .btn-group-sm > .btn {
                padding: 6px 13px !important;
                font-size: 12px !important;
                border-radius: 9px !important;
            }
            .btn-xs, .btn-group-xs > .btn {
                padding: 4px 9px !important;
                font-size: 11px !important;
                border-radius: 7px !important;
            }
            .btn:hover:not(:disabled), .alx-btn:hover, .alx-admin-btn:hover, .alx-link-btn:hover {
                transform: translateY(-1px) !important;
            }
            .btn:active:not(:disabled), .alx-btn:active, .alx-admin-btn:active, .alx-link-btn:active {
                transform: translateY(0) scale(0.98) !important;
            }

            /* Button Variants */
            .btn-primary, .alx-btn-create, .alx-admin-btn-create, .alx-link-btn-orange {
                background: linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%) !important;
                border-color: rgba(56, 189, 248, 0.4) !important;
                color: #ffffff !important;
                box-shadow: 0 2px 10px rgba(14, 165, 233, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
            }
            .btn-primary:hover, .alx-btn-create:hover, .alx-admin-btn-create:hover, .alx-link-btn-orange:hover {
                background: linear-gradient(180deg, #38bdf8 0%, #0ea5e9 100%) !important;
                box-shadow: 0 6px 16px rgba(14, 165, 233, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.28) !important;
                color: #ffffff !important;
            }
            .btn-success, .btn-green {
                background: linear-gradient(180deg, #10b981 0%, #059669 100%) !important;
                border-color: rgba(52, 211, 153, 0.4) !important;
                color: #ffffff !important;
                box-shadow: 0 2px 10px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
            }
            .btn-success:hover, .btn-green:hover {
                background: linear-gradient(180deg, #34d399 0%, #10b981 100%) !important;
                box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.28) !important;
                color: #ffffff !important;
            }
            .btn-danger, .alx-btn-delete-all, .alx-link-btn-green {
                background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%) !important;
                border-color: rgba(248, 113, 113, 0.4) !important;
                color: #ffffff !important;
                box-shadow: 0 2px 10px rgba(239, 68, 68, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
            }
            .btn-danger:hover, .alx-btn-delete-all:hover, .alx-link-btn-green:hover {
                background: linear-gradient(180deg, #f87171 0%, #ef4444 100%) !important;
                box-shadow: 0 6px 16px rgba(239, 68, 68, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.28) !important;
                color: #ffffff !important;
            }
            .btn-warning {
                background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%) !important;
                border-color: rgba(251, 191, 36, 0.4) !important;
                color: #ffffff !important;
                box-shadow: 0 2px 10px rgba(245, 158, 11, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
            }
            .btn-default, .alx-btn-search, .alx-admin-btn-search, .alx-link-btn-gray, .alx-btn-set {
                background: var(--alx-bg-elevated) !important;
                color: var(--alx-text-primary) !important;
                border: 1px solid var(--alx-border-strong) !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
            }
            .btn-default:hover, .alx-btn-search:hover, .alx-admin-btn-search:hover, .alx-link-btn-gray:hover, .alx-btn-set:hover {
                background: #27272a !important;
                border-color: rgba(56, 189, 248, 0.45) !important;
                color: #ffffff !important;
            }

            /* 7. Labels, Badges & Status Pills */
            .label {
                display: inline-flex !important;
                align-items: center !important;
                font-weight: 700 !important;
                border-radius: 6px !important;
                padding: 3px 8px !important;
                font-size: 11px !important;
                letter-spacing: 0.02em;
            }
            .label-primary, .label-info {
                background: rgba(14, 165, 233, 0.14) !important;
                color: #38bdf8 !important;
                border: 1px solid rgba(14, 165, 233, 0.3) !important;
            }
            .label-success {
                background: rgba(16, 185, 129, 0.14) !important;
                color: #34d399 !important;
                border: 1px solid rgba(16, 185, 129, 0.3) !important;
            }
            .label-danger {
                background: rgba(239, 68, 68, 0.14) !important;
                color: #f87171 !important;
                border: 1px solid rgba(239, 68, 68, 0.3) !important;
            }
            .label-warning {
                background: rgba(245, 158, 11, 0.14) !important;
                color: #fbbf24 !important;
                border: 1px solid rgba(245, 158, 11, 0.3) !important;
            }
            .label-default {
                background: rgba(255, 255, 255, 0.07) !important;
                color: var(--alx-text-secondary) !important;
                border: 1px solid var(--alx-border-strong) !important;
            }

            /* 8. Modals, Alerts & Callouts */
            .modal-content {
                background: var(--alx-bg-surface) !important;
                border: 1px solid var(--alx-border-strong) !important;
                border-radius: 16px !important;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65) !important;
                overflow: hidden;
            }
            .modal-header {
                background: rgba(255, 255, 255, 0.02) !important;
                border-bottom: 1px solid var(--alx-border) !important;
                padding: 16px 22px !important;
                color: #ffffff !important;
            }
            .modal-title { font-weight: 700 !important; font-size: 16px !important; color: #ffffff !important; }
            .modal-header .close { color: var(--alx-text-secondary) !important; opacity: 0.8; text-shadow: none; }
            .modal-header .close:hover { color: #ffffff !important; opacity: 1; }
            .modal-body { background: var(--alx-bg-surface) !important; padding: 22px !important; color: var(--alx-text-primary) !important; }
            .modal-footer {
                background: rgba(255, 255, 255, 0.015) !important;
                border-top: 1px solid var(--alx-border) !important;
                padding: 14px 22px !important;
            }

            .alert {
                border-radius: 12px !important;
                padding: 14px 18px !important;
                font-size: 13px !important;
                font-weight: 500 !important;
            }
            .alert-danger {
                background: rgba(239, 68, 68, 0.12) !important;
                border: 1px solid rgba(239, 68, 68, 0.35) !important;
                color: #fca5a5 !important;
            }
            .alert-warning {
                background: rgba(245, 158, 11, 0.12) !important;
                border: 1px solid rgba(245, 158, 11, 0.35) !important;
                color: #fde68a !important;
            }
            .alert-success {
                background: rgba(16, 185, 129, 0.12) !important;
                border: 1px solid rgba(16, 185, 129, 0.35) !important;
                color: #a7f3d0 !important;
            }
            .alert-info {
                background: rgba(14, 165, 233, 0.12) !important;
                border: 1px solid rgba(14, 165, 233, 0.35) !important;
                color: #bae6fd !important;
            }

            .callout {
                border-radius: 12px !important;
                background: var(--alx-bg-elevated) !important;
                border: 1px solid var(--alx-border-strong) !important;
                color: var(--alx-text-primary) !important;
            }

            /* 9. Nav Tabs & Pagination */
            .nav-tabs-custom {
                background: transparent !important;
                box-shadow: none !important;
                margin-bottom: 22px !important;
            }
            .nav-tabs-custom > .nav-tabs {
                border-bottom: none !important;
                display: flex;
                gap: 6px;
                overflow-x: auto;
                background: var(--alx-bg-surface) !important;
                border: 1px solid var(--alx-border) !important;
                border-radius: 13px !important;
                padding: 6px !important;
                white-space: nowrap;
            }
            .nav-tabs-custom > .nav-tabs > li { margin-bottom: 0 !important; border-top: none !important; }
            .nav-tabs-custom > .nav-tabs > li > a {
                border: 1px solid transparent !important;
                border-radius: 9px !important;
                color: var(--alx-text-secondary) !important;
                padding: 8px 16px !important;
                font-size: 13px !important;
                font-weight: 600 !important;
                margin: 0 !important;
                transition: all 0.15s ease;
            }
            .nav-tabs-custom > .nav-tabs > li > a:hover {
                color: #ffffff !important;
                background: var(--alx-bg-elevated) !important;
            }
            .nav-tabs-custom > .nav-tabs > li.active > a,
            .nav-tabs-custom > .nav-tabs > li.active > a:hover {
                background: rgba(14, 165, 233, 0.14) !important;
                color: #38bdf8 !important;
                border: 1px solid rgba(56, 189, 248, 0.3) !important;
            }

            .pagination > li > a, .pagination > li > span {
                background: var(--alx-bg-elevated) !important;
                border: 1px solid var(--alx-border-strong) !important;
                color: var(--alx-text-secondary) !important;
                border-radius: 8px !important;
                margin: 0 3px !important;
                padding: 5px 11px !important;
                font-size: 12.5px !important;
                font-weight: 600 !important;
            }
            .pagination > li > a:hover {
                background: #27272a !important;
                color: #ffffff !important;
                border-color: rgba(56, 189, 248, 0.4) !important;
            }
            .pagination > .active > a, .pagination > .active > span {
                background: var(--alx-accent) !important;
                border-color: var(--alx-accent) !important;
                color: #ffffff !important;
            }

            /* 10. Mobile & Tablet Responsiveness */
            @media (max-width: 767px) {
                .content-header { padding: 16px 14px 6px 14px !important; }
                .content-header > h1 { font-size: 19px !important; }
                .content-header > h1 > small { display: block; margin-left: 0 !important; margin-top: 4px; }
                .content { padding: 12px 14px 24px 14px !important; }
                .box-header, .alx-card-header, .alx-admin-header {
                    flex-direction: column !important;
                    align-items: stretch !important;
                    padding: 14px 16px !important;
                    gap: 10px !important;
                }
                .box-header > .box-tools {
                    position: static !important;
                    float: none !important;
                    padding: 0 !important;
                    margin-top: 8px !important;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .alx-admin-controls, .alx-search-group {
                    width: 100% !important;
                    flex-wrap: wrap !important;
                }
                .alx-admin-input, .alx-search-group .form-control {
                    flex: 1 1 100% !important;
                    width: 100% !important;
                }
                .box-body { padding: 16px !important; }
            }
            /* 11. Segmented Control Fix for Bootstrap .btn-group[data-toggle="buttons"] */
            .btn-group[data-toggle="buttons"] {
                display: inline-flex !important;
                background: #09090b !important;
                border: 1px solid var(--alx-border-strong) !important;
                border-radius: 12px !important;
                padding: 4px !important;
                gap: 4px !important;
                width: 100%;
            }
            .btn-group[data-toggle="buttons"] > .btn {
                flex: 1 !important;
                background: transparent !important;
                border: 1px solid transparent !important;
                color: var(--alx-text-secondary) !important;
                box-shadow: none !important;
                border-radius: 9px !important;
                padding: 8px 12px !important;
                font-size: 12.5px !important;
                font-weight: 600 !important;
                margin: 0 !important;
            }
            .btn-group[data-toggle="buttons"] > .btn:hover {
                color: #ffffff !important;
                background: rgba(255, 255, 255, 0.04) !important;
                transform: none !important;
            }
            .btn-group[data-toggle="buttons"] > .btn.active,
            .btn-group[data-toggle="buttons"] > .btn.active:hover,
            .btn-group[data-toggle="buttons"] > .btn.active:focus {
                background: linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%) !important;
                border-color: rgba(56, 189, 248, 0.45) !important;
                color: #ffffff !important;
                box-shadow: 0 2px 10px rgba(14, 165, 233, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.22) !important;
            }

            /* 12. Next-Gen Admin Layout Shell Overrides */
            .main-header .logo {
                display: flex !important;
                align-items: center !important;
                justify-content: flex-start !important;
                padding: 0 20px !important;
                gap: 10px !important;
            }
            .alx-brand-badge {
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                padding: 2px 7px;
                border-radius: 6px;
                background: rgba(14, 165, 233, 0.15);
                border: 1px solid rgba(56, 189, 248, 0.35);
                color: #38bdf8;
                line-height: 1.4;
            }
            .alx-topbar-pill {
                display: inline-flex;
                align-items: center;
                gap: 7px;
                padding: 6px 13px;
                border-radius: 9px;
                font-size: 12px;
                font-weight: 600;
                background: #141418;
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #e4e4e7 !important;
                margin: 9px 6px 0 0;
                transition: all 0.15s ease;
                text-decoration: none !important;
            }
            .alx-topbar-pill:hover {
                background: #1f1f26 !important;
                border-color: rgba(56, 189, 248, 0.45);
                color: #38bdf8 !important;
            }
            .alx-topbar-pill.danger:hover {
                border-color: rgba(239, 68, 68, 0.45);
                color: #f87171 !important;
                background: rgba(239, 68, 68, 0.1) !important;
            }
            .alx-nav-badge {
                margin-left: auto;
                font-size: 10.5px;
                font-weight: 700;
                padding: 1px 7px;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.06);
                color: #a1a1aa;
                border: 1px solid rgba(255, 255, 255, 0.08);
                font-variant-numeric: tabular-nums;
            }
            .sidebar-menu > li.active > a .alx-nav-badge {
                background: rgba(14, 165, 233, 0.25);
                color: #ffffff;
                border-color: rgba(56, 189, 248, 0.4);
            }
            .sidebar-menu > li > a {
                display: flex !important;
                align-items: center !important;
            }
        </style>
    </head>
    <body class="hold-transition skin-blue fixed sidebar-mini">
        <div class="wrapper">
            @php
                $isSuperOwner = Auth::user()->id === 1;
                $navServerCount = $isSuperOwner
                    ? \Pterodactyl\Models\Server::count()
                    : \Pterodactyl\Models\Server::where('owner_id', Auth::user()->id)->count();
                $navUserCount = \Pterodactyl\Models\User::count();
                $navNodeCount = \Pterodactyl\Models\Node::count();
            @endphp
            <header class="main-header">
                <a href="{{ route('admin.index') }}" class="logo">
                    @if(config('app.logo'))
                        <img src="{{ config('app.logo') }}" alt="Logo" style="max-height: 28px; max-width: 100%; vertical-align: middle;">
                    @else
                        <span style="font-weight:800; letter-spacing:-0.03em;">alx<span style="color:#38bdf8;">zen</span></span>
                    @endif
                    <span class="alx-brand-badge">Admin</span>
                </a>
                <nav class="navbar navbar-static-top">
                    <a href="#" class="sidebar-toggle" data-toggle="push-menu" role="button">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </a>
                    <div class="navbar-custom-menu">
                        <ul class="nav navbar-nav" style="display:flex; align-items:center; padding-right: 12px;">
                            <li class="hidden-xs">
                                <span class="alx-topbar-pill" style="cursor:default; background:rgba(16,185,129,0.08); border-color:rgba(16,185,129,0.25); color:#34d399 !important;">
                                    <span style="width:6px; height:6px; border-radius:50%; background:#10b981; box-shadow:0 0 8px #10b981; display:inline-block;"></span>
                                    {{ $isSuperOwner ? 'Super Owner (ID 1)' : 'Sub-Admin' }}
                                </span>
                            </li>
                            <li>
                                <a href="{{ route('index') }}" class="alx-topbar-pill" style="padding: 6px 13px !important;" title="Return to Client Dashboard">
                                    <i class="fa fa-external-link" style="color:#38bdf8;"></i>
                                    <span class="hidden-xs">Client Panel</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('account') }}" class="alx-topbar-pill" style="padding: 6px 13px !important;">
                                    <img src="https://www.gravatar.com/avatar/{{ md5(strtolower(Auth::user()->email)) }}?s=64" style="width:18px; height:18px; border-radius:50%;" alt="Avatar">
                                    <span class="hidden-xs">{{ Auth::user()->username }}</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('auth.logout') }}" id="logoutButton" class="alx-topbar-pill danger" style="padding: 6px 11px !important;" title="Logout">
                                    <i class="fa fa-power-off"></i>
                                </a>
                            </li>
                        </ul>
                    </div>
                </nav>
            </header>
            <aside class="main-sidebar">
                <section class="sidebar">
                    <ul class="sidebar-menu" data-widget="tree" style="padding-top: 8px; padding-bottom: 24px;">
                        <li class="header">COMMAND CENTER</li>
                        <li class="{{ Route::currentRouteName() !== 'admin.index' ?: 'active' }}">
                            <a href="{{ route('admin.index') }}">
                                <i class="fa fa-compass"></i> <span>Overview</span>
                            </a>
                        </li>
                        @if($isSuperOwner)
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.settings') ?: 'active' }}">
                            <a href="{{ route('admin.settings')}}">
                                <i class="fa fa-sliders"></i> <span>Panel Settings</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.announcements') ?: 'active' }}">
                            <a href="{{ route('admin.announcements')}}">
                                <i class="fa fa-bullhorn"></i> <span>Announcements</span>
                            </a>
                        </li>
                        @endif
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.api') ?: 'active' }}">
                            <a href="{{ route('admin.api.index')}}">
                                <i class="fa fa-key"></i> <span>Application API</span>
                            </a>
                        </li>

                        <li class="header">CLOUD FLEET &amp; USERS</li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.servers') ?: 'active' }}">
                            <a href="{{ route('admin.servers') }}">
                                <i class="fa fa-server"></i> <span>Servers</span>
                                <span class="alx-nav-badge">{{ $navServerCount }}</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.expiration') ?: 'active' }}">
                            <a href="{{ route('admin.expiration') }}">
                                <i class="fa fa-clock-o"></i> <span>Expiration Manager</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.users') ?: 'active' }}">
                            <a href="{{ route('admin.users') }}">
                                <i class="fa fa-users"></i> <span>Users &amp; Clients</span>
                                <span class="alx-nav-badge">{{ $navUserCount }}</span>
                            </a>
                        </li>

                        <li class="header">INFRASTRUCTURE</li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.nodes') ?: 'active' }}">
                            <a href="{{ route('admin.nodes') }}">
                                <i class="fa fa-sitemap"></i> <span>Nodes &amp; Wings</span>
                                <span class="alx-nav-badge">{{ $navNodeCount }}</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.locations') ?: 'active' }}">
                            <a href="{{ route('admin.locations') }}">
                                <i class="fa fa-globe"></i> <span>Locations</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.databases') ?: 'active' }}">
                            <a href="{{ route('admin.databases') }}">
                                <i class="fa fa-database"></i> <span>Database Hosts</span>
                            </a>
                        </li>

                        <li class="header">RUNTIME &amp; EGGS</li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.nests') ?: 'active' }}">
                            <a href="{{ route('admin.nests') }}">
                                <i class="fa fa-cubes"></i> <span>Nests &amp; Eggs</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.mounts') ?: 'active' }}">
                            <a href="{{ route('admin.mounts') }}">
                                <i class="fa fa-hdd-o"></i> <span>Storage Mounts</span>
                            </a>
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
