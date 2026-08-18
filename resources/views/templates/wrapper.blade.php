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

        <div id="tsparticles" style="position: fixed; inset: 0; z-index: -1; pointer-events: none;"></div>
        <script src="https://cdn.jsdelivr.net/npm/tsparticles-slim@2.0.6/tsparticles.slim.bundle.min.js"></script>
        <script>
            document.addEventListener("DOMContentLoaded", function() {
                tsParticles.load("tsparticles", {
                    background: {
                        color: { value: "#000000" }
                    },
                    fpsLimit: 60,
                    interactivity: {
                        events: {
                            onHover: { enable: true, mode: "grab" },
                            resize: true
                        },
                        modes: {
                            grab: { distance: 140, links: { opacity: 0.5, color: "#0ea5e9" } }
                        }
                    },
                    particles: {
                        color: { value: "#0ea5e9" },
                        links: {
                            color: "#0ea5e9",
                            distance: 150,
                            enable: true,
                            opacity: 0.15,
                            width: 1
                        },
                        move: {
                            enable: true,
                            speed: 0.8,
                            direction: "none",
                            outModes: { default: "bounce" }
                        },
                        number: {
                            density: { enable: true, area: 800 },
                            value: 50
                        },
                        opacity: { value: 0.3 },
                        size: { value: { min: 1, max: 2 } }
                    },
                    detectRetina: true
                });
            });
        </script>
    </body>
</html>
