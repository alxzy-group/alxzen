@extends('layouts.admin')

@section('title')
    Application API - New Credentials
@endsection

@section('content-header')
    <h1>Application API<small>Generate new credentials for managing this Panel via the Application API.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.api.index') }}">Application API</a></li>
        <li class="active">New Credentials</li>
    </ol>
@endsection

@section('content')
<style>
/* --- ALXZEN APPLICATION API CREATOR STYLING --- */
.alx-api-card {
    background: #111111;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}
.alx-policy-banner {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    background: rgba(14, 165, 233, 0.08);
    border: 1px solid rgba(14, 165, 233, 0.25);
    border-radius: 14px;
    padding: 16px 20px;
    margin-bottom: 24px;
}
.alx-policy-banner.owner-mode {
    background: rgba(16, 185, 129, 0.08);
    border-color: rgba(16, 185, 129, 0.25);
}
.alx-policy-icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: rgba(14, 165, 233, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #38bdf8;
    flex-shrink: 0;
}
.alx-policy-banner.owner-mode .alx-policy-icon {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
}
.alx-policy-text h4 {
    margin: 0 0 6px 0;
    font-size: 15px;
    font-weight: 700;
    color: #f1f5f9;
}
.alx-policy-text p {
    margin: 0;
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.6;
}
.alx-presets-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    margin-bottom: 20px;
}
.alx-presets-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #64748b;
    margin-right: 6px;
}
.alx-preset-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
    color: #e2e8f0;
    cursor: pointer;
    transition: all 0.2s ease;
}
.alx-preset-btn:hover {
    background: rgba(14, 165, 233, 0.15);
    border-color: rgba(14, 165, 233, 0.4);
    color: #38bdf8;
    transform: translateY(-1px);
}
.alx-preset-btn.preset-recommend {
    background: rgba(14, 165, 233, 0.12);
    border-color: rgba(14, 165, 233, 0.35);
    color: #38bdf8;
}
.alx-resource-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(255, 255, 255, 0.02);
    margin-bottom: 12px;
    transition: all 0.2s ease;
}
.alx-resource-item:hover {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.035);
}
.alx-res-info {
    display: flex;
    align-items: center;
    gap: 14px;
    max-width: 50%;
}
.alx-res-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #38bdf8;
    flex-shrink: 0;
}
.alx-res-meta h5 {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
    color: #f8fafc;
}
.alx-res-meta p {
    margin: 0;
    font-size: 12px;
    color: #64748b;
    line-height: 1.4;
}
.alx-seg-control {
    display: inline-flex;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 4px;
    gap: 4px;
}
.alx-seg-btn {
    position: relative;
    cursor: pointer;
    margin: 0;
}
.alx-seg-btn input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}
.alx-seg-btn span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 500;
    color: #94a3b8;
    transition: all 0.2s ease;
    user-select: none;
}
.alx-seg-btn input:checked + span {
    background: #0ea5e9;
    color: #ffffff;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(14, 165, 233, 0.35);
}
.alx-seg-btn.seg-none input:checked + span {
    background: #334155;
    color: #cbd5e1;
    box-shadow: none;
}
.alx-seg-btn.disabled {
    cursor: not-allowed;
    opacity: 0.35;
}
.alx-seg-btn.disabled span {
    color: #475569;
    background: transparent !important;
    box-shadow: none !important;
}
.alx-sub-badge {
    display: inline-block;
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 4px;
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
    margin-left: 4px;
    font-weight: 600;
}
.alx-submit-card {
    position: sticky;
    top: 20px;
}
.alx-form-input {
    background: #0a0a0a !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    color: #ffffff !important;
    border-radius: 10px !important;
    padding: 12px 14px !important;
    font-size: 13px !important;
}
.alx-form-input:focus {
    border-color: #0ea5e9 !important;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2) !important;
}
.alx-btn-generate {
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    border: none;
    color: #ffffff;
    box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
    transition: all 0.2s ease;
    cursor: pointer;
}
.alx-btn-generate:hover {
    background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
    box-shadow: 0 6px 20px rgba(14, 165, 233, 0.45);
    transform: translateY(-1px);
}
@media (max-width: 991px) {
    .alx-resource-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
    .alx-res-info {
        max-width: 100%;
    }
    .alx-seg-control {
        width: 100%;
        justify-content: space-between;
    }
    .alx-seg-btn {
        flex: 1;
        text-align: center;
    }
    .alx-seg-btn span {
        width: 100%;
        justify-content: center;
    }
}
</style>

<div class="row">
    @if(!$isOwner)
        <div class="col-xs-12">
            <div class="alx-policy-banner">
                <div class="alx-policy-icon"><i class="fa fa-shield"></i></div>
                <div class="alx-policy-text">
                    <h4>Sub-Admin API Key Protection Policy</h4>
                    <p>API Key yang Anda buat dilindungi oleh kebijakan keamanan otomatis: <strong>Hanya dapat membuat server (Create Server)</strong> dan akses <strong>Read-Only</strong> pada fitur lainnya. Izin <strong>Delete Server</strong>, <strong>Delete Egg</strong>, serta <strong>Edit Egg</strong> dinonaktifkan demi stabilitas dan keamanan panel.</p>
                </div>
            </div>
        </div>
    @else
        <div class="col-xs-12">
            <div class="alx-policy-banner owner-mode">
                <div class="alx-policy-icon"><i class="fa fa-star"></i></div>
                <div class="alx-policy-text">
                    <h4>Super Admin Privilege</h4>
                    <p>Anda login sebagai <strong>Owner (ID 1)</strong>. Anda memiliki akses penuh untuk mengatur izin Read maupun Read & Write ke seluruh resource API panel tanpa pembatasan.</p>
                </div>
            </div>
        </div>
    @endif

    <form method="POST" action="{{ route('admin.api.new') }}">
        <div class="col-md-8 col-xs-12">
            <div class="alx-api-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
                    <h3 style="margin: 0; font-size: 17px; font-weight: 700; color: #f8fafc;">
                        <i class="fa fa-key" style="color: #0ea5e9; margin-right: 8px;"></i> Resource Permissions
                    </h3>
                </div>

                {{-- QUICK PRESETS --}}
                <div class="alx-presets-bar">
                    <span class="alx-presets-label"><i class="fa fa-bolt"></i> Quick Presets:</span>
                    <button type="button" class="alx-preset-btn preset-recommend" onclick="applyPreset('server-bot')">
                        <i class="fa fa-robot"></i> Bot Create Server (Recommended)
                    </button>
                    <button type="button" class="alx-preset-btn" onclick="applyPreset('read-all')">
                        <i class="fa fa-eye"></i> Read-Only All
                    </button>
                    <button type="button" class="alx-preset-btn" onclick="applyPreset('none-all')">
                        <i class="fa fa-ban"></i> None All
                    </button>
                </div>

                @php
                    $resMeta = [
                        'servers' => ['icon' => 'fa-server', 'desc' => $isOwner ? 'View, create, configure and delete game servers.' : 'Deploy new game servers. (Delete Server is strictly protected).'],
                        'nodes' => ['icon' => 'fa-sitemap', 'desc' => 'Daemon host nodes and system infrastructure health.'],
                        'allocations' => ['icon' => 'fa-plug', 'desc' => 'IP addresses and networking ports for server allocation.'],
                        'users' => ['icon' => 'fa-users', 'desc' => $isOwner ? 'User client accounts and credentials lookup.' : 'Create client user accounts for new servers and lookup credentials.'],
                        'locations' => ['icon' => 'fa-globe', 'desc' => 'Geographical clustering for node organization.'],
                        'nests' => ['icon' => 'fa-th-large', 'desc' => 'Game packages and parent service groups.'],
                        'eggs' => ['icon' => 'fa-cubes', 'desc' => 'Docker egg configurations and environment variables.'],
                        'database_hosts' => ['icon' => 'fa-database', 'desc' => 'External relational database management hosts.'],
                        'server_databases' => ['icon' => 'fa-table', 'desc' => 'Database instances bound to specific servers.'],
                    ];
                @endphp

                <div class="alx-resource-list">
                    @foreach($resources as $resource)
                        @php
                            $meta = $resMeta[$resource] ?? ['icon' => 'fa-folder', 'desc' => 'Manage ' . $resource];
                            $canWrite = $isOwner || in_array($resource, ['servers', 'users']);
                        @endphp
                        <div class="alx-resource-item">
                            <div class="alx-res-info">
                                <div class="alx-res-icon">
                                    <i class="fa {{ $meta['icon'] }}"></i>
                                </div>
                                <div class="alx-res-meta">
                                    <h5>{{ str_replace('_', ' ', title_case($resource)) }}</h5>
                                    <p>{{ $meta['desc'] }}</p>
                                </div>
                            </div>

                            <div class="alx-seg-control">
                                {{-- NONE --}}
                                <label class="alx-seg-btn seg-none" for="n_{{ $resource }}">
                                    <input type="radio" id="n_{{ $resource }}" name="r_{{ $resource }}" value="{{ $permissions['n'] }}" checked>
                                    <span>None</span>
                                </label>

                                {{-- READ --}}
                                <label class="alx-seg-btn" for="r_{{ $resource }}">
                                    <input type="radio" id="r_{{ $resource }}" name="r_{{ $resource }}" value="{{ $permissions['r'] }}">
                                    <span>Read</span>
                                </label>

                                {{-- READ & WRITE --}}
                                @if($canWrite)
                                    <label class="alx-seg-btn" for="rw_{{ $resource }}">
                                        <input type="radio" id="rw_{{ $resource }}" name="r_{{ $resource }}" value="{{ $permissions['rw'] }}">
                                        <span>
                                            @if(!$isOwner && $resource === 'servers')
                                                <i class="fa fa-plus-circle"></i> Create Only <span class="alx-sub-badge">No Delete</span>
                                            @elseif(!$isOwner && $resource === 'users')
                                                <i class="fa fa-user-plus"></i> Create User
                                            @else
                                                Read &amp; Write
                                            @endif
                                        </span>
                                    </label>
                                @else
                                    <label class="alx-seg-btn disabled" title="Khusus Super Admin: Sub-Admin hanya diizinkan Read-Only">
                                        <input type="radio" disabled>
                                        <span><i class="fa fa-lock"></i> Locked</span>
                                    </label>
                                @endif
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>

        <div class="col-md-4 col-xs-12">
            <div class="alx-api-card alx-submit-card">
                <h4 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #f8fafc;">
                    <i class="fa fa-info-circle" style="color: #0ea5e9; margin-right: 6px;"></i> Key Details
                </h4>

                <div class="form-group" style="margin-bottom: 20px;">
                    <label class="control-label" for="memoField" style="color: #e2e8f0; font-size: 13px; font-weight: 600;">
                        Description / Memo <span class="field-required" style="color: #f87171;">*</span>
                    </label>
                    <input id="memoField" type="text" name="memo" class="form-control alx-form-input" placeholder="e.g. Discord Bot Store, WHMCS Billing, Deployment Script" required>
                    <span class="help-block" style="font-size: 11px; color: #64748b; margin-top: 6px;">
                        Beri deskripsi penggunaan API Key ini agar mudah diidentifikasi.
                    </span>
                </div>

                <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 10px; padding: 14px; margin-bottom: 20px;">
                    <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                        <i class="fa fa-lock" style="color: #38bdf8; margin-right: 4px;"></i>
                        Setelah API key dibuat, token rahasia (<code>ptla_...</code>) akan ditampilkan dan dapat disalin untuk bot/aplikasi Anda.
                    </p>
                </div>

                {{ csrf_field() }}
                <button type="submit" class="alx-btn-generate">
                    <i class="fa fa-plus-circle" style="margin-right: 6px;"></i> Generate API Key
                </button>
            </div>
        </div>
    </form>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        function applyPreset(preset) {
            if (preset === 'server-bot') {
                // Servers & Users: Read & Write (3) for automated deployment bots (create user + create server)
                $('input[name="r_servers"][value="3"]').prop('checked', true).trigger('change');
                $('input[name="r_users"][value="3"]').prop('checked', true).trigger('change');
                
                // Read on all other read-accessible resources
                ['nodes', 'allocations', 'locations', 'nests', 'eggs'].forEach(function(res) {
                    $('input[name="r_' + res + '"][value="1"]').prop('checked', true).trigger('change');
                });
                
                // None on database hosts
                ['database_hosts', 'server_databases'].forEach(function(res) {
                    $('input[name="r_' + res + '"][value="0"]').prop('checked', true).trigger('change');
                });
            } else if (preset === 'read-all') {
                $('input[type="radio"][value="1"]:not(:disabled)').each(function() {
                    $(this).prop('checked', true).trigger('change');
                });
            } else if (preset === 'none-all') {
                $('input[type="radio"][value="0"]:not(:disabled)').each(function() {
                    $(this).prop('checked', true).trigger('change');
                });
            }
        }
    </script>
@endsection
