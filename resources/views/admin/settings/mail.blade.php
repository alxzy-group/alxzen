@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'mail'])

@section('title')
    Mail Settings
@endsection

@section('content-header')
    <h1>SMTP &amp; Transactional Mail<small>Configure outbound SMTP relay server and sender identity.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Mail Settings</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')

    <style>
        .alx-mail-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 20px;
            margin-bottom: 24px;
        }
        .alx-mail-col-7 { grid-column: span 7; }
        .alx-mail-col-5 { grid-column: span 5; }
        @media (max-width: 991px) {
            .alx-mail-col-7, .alx-mail-col-5 { grid-column: span 12; }
        }
        .alx-mail-card {
            background: #111113;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 24px;
            height: 100%;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        .alx-mail-head {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            padding-bottom: 16px;
            margin-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .alx-mail-icon {
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

    @if($disabled)
        <div class="alert alert-info">
            <i class="fa fa-info-circle"></i> This interface is limited to instances using SMTP as the mail driver. Please either use <code>php artisan p:environment:mail</code> command to update your email settings, or set <code>MAIL_DRIVER=smtp</code> in your environment file.
        </div>
    @else
        <form>
            <div class="alx-mail-grid">
                <div class="alx-mail-col-7">
                    <div class="alx-mail-card">
                        <div class="alx-mail-head">
                            <div class="alx-mail-icon">
                                <i class="fa fa-server"></i>
                            </div>
                            <div>
                                <h3 style="margin:0; font-size:16px; font-weight:700; color:#fff;">SMTP Relay Server</h3>
                                <p style="margin:3px 0 0 0; font-size:12.5px; color:#a1a1aa;">Configure host, port, encryption protocol, and authentication credentials.</p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="form-group col-md-6">
                                <label class="control-label">SMTP Host Address</label>
                                <input required type="text" class="form-control" name="mail:mailers:smtp:host" value="{{ old('mail:mailers:smtp:host', config('mail.mailers.smtp.host')) }}" placeholder="smtp.example.com" />
                                <p class="text-muted small">Outbound SMTP server hostname or IP.</p>
                            </div>
                            <div class="form-group col-md-3">
                                <label class="control-label">SMTP Port</label>
                                <input required type="number" class="form-control" name="mail:mailers:smtp:port" value="{{ old('mail:mailers:smtp:port', config('mail.mailers.smtp.port')) }}" placeholder="587" />
                            </div>
                            <div class="form-group col-md-3">
                                <label class="control-label">Encryption</label>
                                @php
                                    $encryption = old('mail:mailers:smtp:encryption', config('mail.mailers.smtp.encryption'));
                                @endphp
                                <select name="mail:mailers:smtp:encryption" class="form-control">
                                    <option value="" @if($encryption === '') selected @endif>None</option>
                                    <option value="tls" @if($encryption === 'tls') selected @endif>TLS</option>
                                    <option value="ssl" @if($encryption === 'ssl') selected @endif>SSL</option>
                                </select>
                            </div>
                            <div class="form-group col-md-6" style="margin-bottom:0;">
                                <label class="control-label">SMTP Username <span class="field-optional"></span></label>
                                <input type="text" class="form-control" name="mail:mailers:smtp:username" value="{{ old('mail:mailers:smtp:username', config('mail.mailers.smtp.username')) }}" />
                            </div>
                            <div class="form-group col-md-6" style="margin-bottom:0;">
                                <label class="control-label">SMTP Password <span class="field-optional"></span></label>
                                <input type="password" class="form-control" name="mail:mailers:smtp:password" placeholder="Leave blank to keep existing" />
                                <p class="text-muted small" style="margin-bottom:0;">Enter <code>!e</code> to clear existing password.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="alx-mail-col-5">
                    <div class="alx-mail-card">
                        <div class="alx-mail-head">
                            <div class="alx-mail-icon" style="background: rgba(16, 185, 129, 0.12); border-color: rgba(52, 211, 153, 0.28); color: #34d399;">
                                <i class="fa fa-envelope-open-o"></i>
                            </div>
                            <div>
                                <h3 style="margin:0; font-size:16px; font-weight:700; color:#fff;">Sender Identity</h3>
                                <p style="margin:3px 0 0 0; font-size:12.5px; color:#a1a1aa;">Define the From address and display name seen by recipients.</p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="form-group col-md-12">
                                <label class="control-label">Mail From Address</label>
                                <input required type="email" class="form-control" name="mail:from:address" value="{{ old('mail:from:address', config('mail.from.address')) }}" placeholder="no-reply@example.com" />
                                <p class="text-muted small">Originating email address for all panel notifications.</p>
                            </div>
                            <div class="form-group col-md-12" style="margin-bottom:0;">
                                <label class="control-label">Mail From Display Name <span class="field-optional"></span></label>
                                <input type="text" class="form-control" name="mail:from:name" value="{{ old('mail:from:name', config('mail.from.name')) }}" placeholder="Alxzen Cloud Panel" />
                                <p class="text-muted small" style="margin-bottom:0;">Sender name displayed in the recipient's inbox.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="alx-save-bar">
                <div style="font-size: 12.5px; color: #a1a1aa;">
                    <i class="fa fa-paper-plane" style="color: #38bdf8; margin-right: 6px;"></i>
                    Saving will automatically restart the mail queue worker to apply changes.
                </div>
                <div style="display:flex; gap:10px;">
                    {{ csrf_field() }}
                    <button type="button" id="testButton" class="btn btn-default">
                        <i class="fa fa-flask"></i> Save &amp; Send Test Mail
                    </button>
                    <button type="button" id="saveButton" class="btn btn-primary">
                        <i class="fa fa-check-circle"></i> Save Mail Settings
                    </button>
                </div>
            </div>
        </form>
    @endif
@endsection

@section('footer-scripts')
    @parent
    <script>
        function saveSettings() {
            return $.ajax({
                method: 'PATCH',
                url: '/admin/settings/mail',
                contentType: 'application/json',
                data: JSON.stringify({
                    'mail:mailers:smtp:host': $('input[name="mail:mailers:smtp:host"]').val(),
                    'mail:mailers:smtp:port': $('input[name="mail:mailers:smtp:port"]').val(),
                    'mail:mailers:smtp:encryption': $('select[name="mail:mailers:smtp:encryption"]').val(),
                    'mail:mailers:smtp:username': $('input[name="mail:mailers:smtp:username"]').val(),
                    'mail:mailers:smtp:password': $('input[name="mail:mailers:smtp:password"]').val(),
                    'mail:from:address': $('input[name="mail:from:address"]').val(),
                    'mail:from:name': $('input[name="mail:from:name"]').val()
                }),
                headers: { 'X-CSRF-Token': $('input[name="_token"]').val() }
            }).fail(function (jqXHR) {
                showErrorDialog(jqXHR, 'save');
            });
        }

        function testSettings() {
            swal({
                type: 'info',
                title: 'Test Mail Settings',
                text: 'Click "Test" to begin the test.',
                showCancelButton: true,
                confirmButtonText: 'Test',
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            }, function () {
                $.ajax({
                    method: 'POST',
                    url: '/admin/settings/mail/test',
                    headers: { 'X-CSRF-TOKEN': $('input[name="_token"]').val() }
                }).fail(function (jqXHR) {
                    showErrorDialog(jqXHR, 'test');
                }).done(function () {
                    swal({
                        title: 'Success',
                        text: 'The test message was sent successfully.',
                        type: 'success'
                    });
                });
            });
        }

        function saveAndTestSettings() {
            saveSettings().done(testSettings);
        }

        function showErrorDialog(jqXHR, verb) {
            console.error(jqXHR);
            var errorText = '';
            if (!jqXHR.responseJSON) {
                errorText = jqXHR.responseText;
            } else if (jqXHR.responseJSON.error) {
                errorText = jqXHR.responseJSON.error;
            } else if (jqXHR.responseJSON.errors) {
                $.each(jqXHR.responseJSON.errors, function (i, v) {
                    if (v.detail) {
                        errorText += v.detail + ' ';
                    }
                });
            }

            swal({
                title: 'Whoops!',
                text: 'An error occurred while attempting to ' + verb + ' mail settings: ' + errorText,
                type: 'error'
            });
        }

        $(document).ready(function () {
            $('#testButton').on('click', saveAndTestSettings);
            $('#saveButton').on('click', function () {
                saveSettings().done(function () {
                    swal({
                        title: 'Success',
                        text: 'Mail settings have been updated successfully and the queue worker was restarted to apply these changes.',
                        type: 'success'
                    });
                });
            });
        });
    </script>
@endsection
