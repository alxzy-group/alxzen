@extends('layouts.admin')

@section('title')
    Application API
@endsection

@section('content-header')
    <h1>Application API<small>Control access credentials for managing this Panel via the Application API.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Application API</li>
    </ol>
@endsection

@section('content')
<style>
/* --- ALXZEN APPLICATION API CREDENTIALS LIST STYLING --- */
.alx-api-card {
    background: #111111;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}
.alx-card-header-flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;
}
.alx-card-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #f8fafc;
    display: flex;
    align-items: center;
    gap: 10px;
}
.alx-count-badge {
    background: rgba(14, 165, 233, 0.15);
    border: 1px solid rgba(14, 165, 233, 0.3);
    color: #38bdf8;
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 20px;
    font-weight: 600;
}
.alx-btn-create {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 18px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    border: none;
    color: #ffffff;
    box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
    transition: all 0.2s ease;
    text-decoration: none !important;
}
.alx-btn-create:hover {
    background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
    box-shadow: 0 6px 20px rgba(14, 165, 233, 0.45);
    color: #ffffff;
    transform: translateY(-1px);
}
.alx-table-container {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.015);
}
.alx-table {
    width: 100%;
    margin-bottom: 0;
    border-collapse: separate;
    border-spacing: 0;
}
.alx-table th {
    background: rgba(255, 255, 255, 0.04);
    color: #94a3b8;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.alx-table td {
    padding: 14px 16px;
    vertical-align: middle;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    color: #e2e8f0;
    font-size: 13px;
}
.alx-table tr:hover td {
    background: rgba(255, 255, 255, 0.025);
}
.alx-key-code {
    background: rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 6px 12px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 12px;
    color: #38bdf8;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}
.alx-copy-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #cbd5e1;
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;
}
.alx-copy-btn:hover {
    background: rgba(14, 165, 233, 0.2);
    border-color: rgba(14, 165, 233, 0.4);
    color: #38bdf8;
}
.alx-scope-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 9px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
}
.alx-scope-owner {
    background: rgba(16, 185, 129, 0.12);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.25);
}
.alx-scope-sub {
    background: rgba(14, 165, 233, 0.12);
    color: #38bdf8;
    border: 1px solid rgba(14, 165, 233, 0.25);
}
.alx-btn-revoke {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.25);
    color: #f87171;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    cursor: pointer;
    text-decoration: none !important;
}
.alx-btn-revoke:hover {
    background: #ef4444;
    color: #ffffff;
    border-color: #ef4444;
    transform: translateY(-1px);
}
.alx-empty-state {
    text-align: center;
    padding: 50px 20px;
}
.alx-empty-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    color: #64748b;
    margin: 0 auto 16px auto;
}
</style>

<div class="row">
    <div class="col-xs-12">
        <div class="alx-api-card">
            <div class="alx-card-header-flex">
                <div class="alx-card-title">
                    <i class="fa fa-key" style="color: #0ea5e9;"></i>
                    Credentials List
                    <span class="alx-count-badge">{{ count($keys) }} {{ str_plural('Key', count($keys)) }}</span>
                </div>
                <div>
                    <a href="{{ route('admin.api.new') }}" class="alx-btn-create">
                        <i class="fa fa-plus-circle"></i> Create New Key
                    </a>
                </div>
            </div>

            @if(!$isOwner)
                <div style="background: rgba(14, 165, 233, 0.06); border: 1px solid rgba(14, 165, 233, 0.2); border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; color: #94a3b8;">
                    <i class="fa fa-shield" style="color: #38bdf8; margin-right: 6px;"></i>
                    Menampilkan Application API Key milik akun Anda. Key Anda terproteksi: <strong>Dapat Create Server &amp; User (Bot Auto-Order)</strong> dan <strong>Read-Only</strong> pada fitur lainnya (tidak dapat menghapus server/egg).
                </div>
            @endif

            <div class="alx-table-container table-responsive">
                @if(count($keys) > 0)
                    <table class="alx-table">
                        <thead>
                            <tr>
                                <th>API Key / Token</th>
                                <th>Memo / Description</th>
                                <th>Scope Policy</th>
                                <th>Created By</th>
                                <th>Last Used</th>
                                <th>Created At</th>
                                <th style="text-align: right;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($keys as $key)
                                <tr>
                                    <td>
                                        <div class="alx-key-code">
                                            @if (Auth::user()->is($key->user))
                                                @php $fullToken = $key->identifier . decrypt($key->token); @endphp
                                                <span>{{ $key->identifier . decrypt($key->token) }}</span>
                                                <button type="button" class="alx-copy-btn" onclick="copyToClipboard('{{ $fullToken }}', this)" title="Copy API Key">
                                                    <i class="fa fa-copy"></i>
                                                </button>
                                            @else
                                                <span>{{ $key->identifier . '••••••••••••••••' }}</span>
                                            @endif
                                        </div>
                                    </td>
                                    <td>
                                        <strong style="color: #f1f5f9;">{{ $key->memo }}</strong>
                                    </td>
                                    <td>
                                        @if($key->user_id === 1)
                                            <span class="alx-scope-badge alx-scope-owner">
                                                <i class="fa fa-star"></i> Full Access
                                            </span>
                                        @else
                                            <span class="alx-scope-badge alx-scope-sub">
                                                <i class="fa fa-shield"></i> Create Server &amp; User
                                            </span>
                                        @endif
                                    </td>
                                    <td>
                                        <a href="{{ route('admin.users.view', $key->user->id) }}" style="color: #38bdf8; font-weight: 500;">
                                            <i class="fa fa-user-circle" style="margin-right: 4px;"></i> {{ $key->user->username }}
                                        </a>
                                    </td>
                                    <td>
                                        @if(!is_null($key->last_used_at))
                                            <span style="color: #cbd5e1;"><i class="fa fa-clock-o" style="color: #64748b; margin-right: 4px;"></i> @datetimeHuman($key->last_used_at)</span>
                                        @else
                                            <span style="color: #64748b;">&mdash; Never</span>
                                        @endif
                                    </td>
                                    <td>
                                        <span style="color: #94a3b8;">@datetimeHuman($key->created_at)</span>
                                    </td>
                                    <td style="text-align: right;">
                                        <a href="#" class="alx-btn-revoke" data-action="revoke-key" data-attr="{{ $key->identifier }}" title="Revoke Credentials">
                                            <i class="fa fa-trash-o"></i>
                                        </a>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                @else
                    <div class="alx-empty-state">
                        <div class="alx-empty-icon"><i class="fa fa-key"></i></div>
                        <h4 style="margin: 0 0 6px 0; color: #f8fafc; font-size: 16px; font-weight: 600;">Belum Ada Application API Key</h4>
                        <p style="margin: 0 0 16px 0; color: #64748b; font-size: 13px;">Buat API Key untuk mengintegrasikan bot Discord, sistem billing, atau script otomatisasi.</p>
                        <a href="{{ route('admin.api.new') }}" class="alx-btn-create">
                            <i class="fa fa-plus-circle"></i> Buat API Key Sekarang
                        </a>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        function copyToClipboard(text, btnElement) {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(function() {
                    showCopied(btnElement);
                });
            } else {
                var textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    showCopied(btnElement);
                } catch (err) {}
                document.body.removeChild(textArea);
            }
        }

        function showCopied(el) {
            var $el = $(el);
            var originalHtml = $el.html();
            $el.html('<i class="fa fa-check" style="color:#34d399;"></i>');
            setTimeout(function() {
                $el.html(originalHtml);
            }, 1800);
        }

        $(document).ready(function() {
            $('[data-action="revoke-key"]').click(function (event) {
                var self = $(this);
                event.preventDefault();
                swal({
                    type: 'error',
                    title: 'Revoke API Key?',
                    text: 'Setelah API Key ini di-revoke, bot atau aplikasi yang menggunakannya tidak akan dapat mengakses panel lagi.',
                    showCancelButton: true,
                    allowOutsideClick: true,
                    closeOnConfirm: false,
                    confirmButtonText: 'Revoke Key',
                    confirmButtonColor: '#ef4444',
                    showLoaderOnConfirm: true
                }, function () {
                    $.ajax({
                        method: 'DELETE',
                        url: '/admin/api/revoke/' + self.data('attr'),
                        headers: {
                            'X-CSRF-TOKEN': '{{ csrf_token() }}'
                        }
                    }).done(function () {
                        swal({
                            type: 'success',
                            title: 'Berhasil!',
                            text: 'API Key telah berhasil di-revoke.'
                        });
                        self.closest('tr').slideUp(300, function() { $(this).remove(); });
                    }).fail(function (jqXHR) {
                        console.error(jqXHR);
                        swal({
                            type: 'error',
                            title: 'Gagal!',
                            text: 'Terjadi kesalahan saat mencabut API Key.'
                        });
                    });
                });
            });
        });
    </script>
@endsection
