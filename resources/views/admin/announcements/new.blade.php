@extends('layouts.admin')

@section('title')
    Create Announcement
@endsection

@section('content-header')
    <h1>Create Announcement<small>Compose and publish a new system-wide broadcast banner.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.announcements') }}">Announcements</a></li>
        <li class="active">Create</li>
    </ol>
@endsection

@section('content')
<form action="{{ route('admin.announcements.store') }}" method="POST">
    @csrf
    <div class="row">
        <div class="col-md-8">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title"><i class="fa fa-bullhorn" style="color:#38bdf8;margin-right:8px;"></i>Broadcast Message Content</h3>
                </div>
                <div class="box-body">
                    <div class="form-group">
                        <label for="title" class="control-label">Headline Title <span class="field-required"></span></label>
                        <input type="text" name="title" id="title" class="form-control" value="{{ old('title') }}" placeholder="e.g. Scheduled Node Maintenance or Holiday Promo" required />
                        <p class="text-muted small">Short headline displayed at the top of the announcement card.</p>
                    </div>

                    <div class="form-group" style="margin-bottom:0;">
                        <label for="content" class="control-label">Announcement Body <span class="field-required"></span></label>
                        <textarea name="content" id="content" class="form-control" rows="6" placeholder="Write the announcement message that clients will see..." required>{{ old('content') }}</textarea>
                        <p class="text-muted small" style="margin-bottom:0;">Plain text with line breaks is supported and safely rendered in the client dashboard and console.</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title"><i class="fa fa-sliders" style="color:#34d399;margin-right:8px;"></i>Delivery &amp; Targeting</h3>
                </div>
                <div class="box-body">
                    <div class="form-group">
                        <label for="type" class="control-label">Alert Severity <span class="field-required"></span></label>
                        <select name="type" id="type" class="form-control">
                            <option value="info" {{ old('type') == 'info' ? 'selected' : '' }}>Info (Cyan Accent)</option>
                            <option value="promo" {{ old('type') == 'promo' ? 'selected' : '' }}>Promo (Emerald Accent)</option>
                            <option value="warning" {{ old('type') == 'warning' ? 'selected' : '' }}>Warning (Amber Accent)</option>
                            <option value="critical" {{ old('type') == 'critical' ? 'selected' : '' }}>Critical (Rose Accent)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="priority" class="control-label">Display Priority (1 - 4) <span class="field-required"></span></label>
                        <input type="number" name="priority" id="priority" class="form-control" value="{{ old('priority', 2) }}" min="1" max="4" required />
                        <p class="text-muted small">Higher priority numbers are pinned first.</p>
                    </div>

                    <div class="form-group">
                        <label for="expires_at" class="control-label">Auto-Expire Timestamp</label>
                        <input type="datetime-local" name="expires_at" id="expires_at" class="form-control" value="{{ old('expires_at') }}" />
                        <p class="text-muted small">Leave blank to keep active indefinitely.</p>
                    </div>

                    <div class="form-group">
                        <label class="control-label">Target Display Locations</label>
                        <div style="padding-top:4px;">
                            <label class="checkbox-inline" style="color:#e4e4e7;font-weight:500;">
                                <input type="checkbox" name="target_display[]" value="dashboard" checked> Client Dashboard
                            </label>
                            <label class="checkbox-inline" style="color:#e4e4e7;font-weight:500;">
                                <input type="checkbox" name="target_display[]" value="console" checked> Server Console
                            </label>
                        </div>
                    </div>

                    <div class="form-group" style="margin-bottom:0;">
                        <label class="control-label">Publication State</label>
                        <div style="padding-top:4px;">
                            <label class="checkbox-inline" style="color:#34d399;font-weight:600;">
                                <input type="checkbox" name="is_active" value="1" checked> Publish Immediately
                            </label>
                        </div>
                    </div>
                </div>
                <div class="box-footer" style="display:flex;align-items:center;justify-content:space-between;">
                    <a href="{{ route('admin.announcements') }}" class="btn btn-default btn-sm">Cancel</a>
                    <button type="submit" class="btn btn-success btn-sm"><i class="fa fa-paper-plane" style="margin-right:5px;"></i> Publish Announcement</button>
                </div>
            </div>
        </div>
    </div>
</form>
@endsection
