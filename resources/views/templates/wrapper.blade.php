<!DOCTYPE html>
<html>
    <head>
        <title>{{ config('app.name', 'alxzen') }}</title>

        @section('meta')
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
            <meta name="csrf-token" content="{{ csrf_token() }}">
            <meta name="robots" content="noindex">
            <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png">
            <link rel="icon" type="image/png" href="/favicons/favicon-32x32.png" sizes="32x32">
            <link rel="icon" type="image/png" href="/favicons/favicon-16x16.png" sizes="16x16">
            <link rel="manifest" href="/favicons/manifest.json">
            <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#bc6e3c">
            <link rel="shortcut icon" href="/favicons/favicon.ico">
            <meta name="msapplication-config" content="/favicons/browserconfig.xml">
            <meta name="theme-color" content="#0e4688">
        @show

        @section('user-data')
            @if(!is_null(Auth::user()))
                <script>
                    window.PterodactylUser = {!! json_encode(Auth::user()->toVueObject()) !!};
                </script>
            @endif
            @if(!empty($siteConfiguration))
                <script>
                    window.SiteConfiguration = {!! json_encode($siteConfiguration) !!};
                </script>
            @endif
        @show

        @yield('assets')

        @include('layouts.scripts')
    </head>
    <body class="{{ $css['body'] ?? 'bg-neutral-50' }}">
        @section('content')
            @yield('above-container')
            @yield('container')
            @yield('below-container')
        @show
        @section('scripts')
            {!! $asset->js('main.js') !!}
        @show

        <div id="tsparticles-bg" style="position: fixed; inset: 0; z-index: -1;"></div>
        <script src="https://cdn.jsdelivr.net/npm/tsparticles-slim@2.0.6/tsparticles.slim.bundle.min.js"></script>
        <script>
            document.addEventListener("DOMContentLoaded", function() {
                var themeType = (window.SiteConfiguration && window.SiteConfiguration.theme && window.SiteConfiguration.theme.type) || 'network';
                
                var configs = {
                    network: {
                        background: { color: { value: "#09090b" } },
                        fpsLimit: 60,
                        interactivity: {
                            events: { onHover: { enable: true, mode: "grab" }, resize: true },
                            modes: { grab: { distance: 200, links: { opacity: 0.8, color: "#0ea5e9" } } }
                        },
                        particles: {
                            color: { value: "#0ea5e9" },
                            links: { color: "#0ea5e9", distance: 160, enable: true, opacity: 0.35, width: 1.5 },
                            move: { enable: true, speed: 1, direction: "none", outModes: { default: "bounce" } },
                            number: { density: { enable: true, area: 600 }, value: 80 },
                            opacity: { value: 0.6 },
                            size: { value: { min: 1.5, max: 3.5 } }
                        },
                        detectRetina: true
                    },
                    bubbles: {
                        background: { color: { value: "#09090b" } },
                        fpsLimit: 60,
                        interactivity: { events: { resize: true } },
                        particles: {
                            color: { value: "#38bdf8" },
                            move: { enable: true, speed: 1.5, direction: "top", outModes: { default: "out" } },
                            number: { density: { enable: true, area: 600 }, value: 60 },
                            opacity: { value: { min: 0.15, max: 0.6 } },
                            size: { value: { min: 3, max: 14 } }
                        },
                        detectRetina: true
                    }
                };

                if (configs[themeType] && typeof tsParticles !== 'undefined') {
                    tsParticles.load("tsparticles-bg", configs[themeType]);
                }
            });
        </script>
    </body>
</html>
