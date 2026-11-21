@include('partials/admin.settings.notice')

@section('settings::nav')
    @yield('settings::notice')
    <div style="margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div style="display: inline-flex; background: #111113; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 13px; padding: 5px; gap: 4px; flex-wrap: wrap;">
            <a href="{{ route('admin.settings') }}"
               style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 18px; border-radius: 9px; font-size: 13px; font-weight: 700; text-decoration: none; transition: all 0.15s ease; {{ $activeTab === 'basic' ? 'background: linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; box-shadow: 0 2px 10px rgba(14, 165, 233, 0.25);' : 'color: #a1a1aa;' }}">
                <i class="fa fa-sliders"></i> General &amp; Brand
            </a>
            <a href="{{ route('admin.settings.mail') }}"
               style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 18px; border-radius: 9px; font-size: 13px; font-weight: 700; text-decoration: none; transition: all 0.15s ease; {{ $activeTab === 'mail' ? 'background: linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; box-shadow: 0 2px 10px rgba(14, 165, 233, 0.25);' : 'color: #a1a1aa;' }}">
                <i class="fa fa-envelope-o"></i> SMTP &amp; Mail
            </a>
            <a href="{{ route('admin.settings.advanced') }}"
               style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 18px; border-radius: 9px; font-size: 13px; font-weight: 700; text-decoration: none; transition: all 0.15s ease; {{ $activeTab === 'advanced' ? 'background: linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; box-shadow: 0 2px 10px rgba(14, 165, 233, 0.25);' : 'color: #a1a1aa;' }}">
                <i class="fa fa-magic"></i> Theme, Subdomain &amp; Security
            </a>
        </div>
        <div style="display: inline-flex; align-items: center; gap: 8px; font-size: 12px; color: #71717a; background: #111113; border: 1px solid rgba(255,255,255,0.06); padding: 7px 14px; border-radius: 10px;">
            <i class="fa fa-shield" style="color: #38bdf8;"></i>
            <span>Owner Only Configuration</span>
        </div>
    </div>
@endsection
