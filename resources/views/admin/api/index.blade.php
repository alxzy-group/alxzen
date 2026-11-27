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
.alx-key-code {
    background: rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 5px 10px;
    font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
    font-size: 12px;
    color: #38bdf8;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
}
.alx-copy-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #cbd5e1;
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s ease;
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
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
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
.alx-empty-state {
    text-align: center;
    padding: 48px 20px;
}
.alx-empty-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: rgba(14, 165, 233, 0.1);
    border: 1px solid rgba(56, 189, 248, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    color: #38bdf8;
    margin: 0 auto 14px auto;
}
</style>

<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">
                    <i class="fa fa-key" style="color: #38bdf8; margin-right: 8px;"></i>
                    Credentials List
                    <span class="label label-primary" style="margin-left: 8px;">{{ count($keys) }} {{ str_plural('Key', count($keys)) }}</span>
                </h3>
                <div class="box-tools">
                    <a href="{{ route('admin.api.new') }}" class="btn btn-sm btn-primary">
                        <i class="fa fa-plus-circle" style="margin-right: 4px;"></i> Create New Key
                    </a>
                </div>
            </div>

            @if(!$isOwner)
                <div style="padding: 12px 20px 0 20px;">
                    <div class="alert alert-info" style="margin-bottom: 0;">
                        <i class="fa fa-shield" style="margin-right: 6px;"></i>
                        Menampilkan Application API Key milik akun Anda. Key Anda terproteksi: <strong>Dapat Create Server &amp; User (Bot Auto-Order)</strong> dan <strong>Read-Only</strong> pada fitur lainnya (tidak dapat menghapus server/egg).
                    </div>
                </div>
            @endif

            <div class="box-body table-responsive no-padding">
                @if(count($keys) > 0)
                    <table class="table table-hover" style="min-width: 820px;">
                        <thead>
                            <tr>
                                <th>API Key / Token</th>
                                <th>Memo / Description</th>
                                <th>Scope Policy</th>
                                <th>Created By</th>
                                <th>Last Used</th>
                                <th>Created At</th>
                                <th class="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($keys as $key)
                                <tr>
                                    <td class="middle">
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
                                    <td class="middle">
                                        <strong style="color: #f4f4f5;">{{ $key->memo }}</strong>
                                    </td>
                                    <td class="middle">
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
                                    <td class="middle">
                                        <a href="{{ route('admin.users.view', $key->user->id) }}" style="color: #38bdf8; font-weight: 500;">
                                            <i class="fa fa-user-circle" style="margin-right: 4px;"></i> {{ $key->user->username }}
                                        </a>
                                    </td>
                                    <td class="middle" style="white-space: nowrap;">
                                        @if(!is_null($key->last_used_at))
                                            <span style="color: #cbd5e1;"><i class="fa fa-clock-o" style="color: #71717a; margin-right: 4px;"></i> @datetimeHuman($key->last_used_at)</span>
                                        @else
                                            <span class="text-muted">&mdash; Never</span>
                                        @endif
                                    </td>
                                    <td class="middle" style="white-space: nowrap;">
                                        <span class="text-muted">@datetimeHuman($key->created_at)</span>
                                    </td>
                                    <td class="middle text-right">
                                        <a href="#" class="btn btn-xs btn-danger" data-action="revoke-key" data-attr="{{ $key->identifier }}" title="Revoke Credentials">
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
                        <p style="margin: 0 0 16px 0; color: #71717a; font-size: 13px;">Buat API Key untuk mengintegrasikan bot Discord, sistem billing, atau script otomatisasi.</p>
                        <a href="{{ route('admin.api.new') }}" class="btn btn-sm btn-primary">
                            <i class="fa fa-plus-circle" style="margin-right: 4px;"></i> Buat API Key Sekarang
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
