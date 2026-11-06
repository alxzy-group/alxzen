<!DOCTYPE html>
<html>
    <head>
        <title>{{ config('app.name', 'alxzen') }}</title>
        <script>
            if (localStorage.getItem('theme') === 'light') {
                document.documentElement.classList.add('theme-light');
            }
        </script>

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
            <meta name="theme-color" content="#0ea5e9">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Inter:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet">
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
    <body class="{{ $css['body'] ?? '' }}">
        @section('content')
            @yield('above-container')
            @yield('container')
            @yield('below-container')
        @show
        @section('scripts')
            {!! $asset->js('main.js') !!}
        @show

        <div id="tsparticles-bg" style="position: fixed; inset: 0; z-index: 0; pointer-events: auto;"></div>
        <script src="https://cdn.jsdelivr.net/npm/tsparticles-slim@2.0.6/tsparticles.slim.bundle.min.js"></script>
        <script>
            document.addEventListener("DOMContentLoaded", function() {
                var themeType = (window.SiteConfiguration && window.SiteConfiguration.theme && window.SiteConfiguration.theme.type) || 'network';
                
                function loadParticles() {
                    var isLight = document.documentElement.classList.contains('theme-light') || localStorage.getItem('theme') === 'light';
                    var particleBg = "transparent";
                    var particleColor = isLight ? "rgba(14,165,233,0.5)" : "#0ea5e9";
                    var particleOpacity = isLight ? 0.4 : 0.6;
                    
                    var configs = {
                        network: {
                            background: { color: { value: particleBg } },
                            fpsLimit: 60,
                            interactivity: {
                                events: { onHover: { enable: true, mode: "grab" }, resize: true },
                                modes: { grab: { distance: 200, links: { opacity: 0.8, color: "#0ea5e9" } } }
                            },
                            particles: {
                                color: { value: particleColor },
                                links: { color: particleColor, distance: 160, enable: true, opacity: isLight ? 0.2 : 0.35, width: 1.5 },
                                move: { enable: true, speed: 1, direction: "none", outModes: { default: "bounce" } },
                                number: { density: { enable: true, area: 600 }, value: isLight ? 50 : 80 },
                                opacity: { value: particleOpacity },
                                size: { value: { min: 1.5, max: 3.5 } }
                            },
                            detectRetina: true
                        },
                        bubbles: {
                            background: { color: { value: particleBg } },
                            fpsLimit: 60,
                            interactivity: { events: { resize: true } },
                            particles: {
                                color: { value: "#38bdf8" },
                                move: { enable: true, speed: 1.5, direction: "top", outModes: { default: "out" } },
                                number: { density: { enable: true, area: 600 }, value: isLight ? 35 : 60 },
                                opacity: { value: { min: isLight ? 0.08 : 0.15, max: isLight ? 0.3 : 0.6 } },
                                size: { value: { min: 3, max: 14 } }
                            },
                            detectRetina: true
                        }
                    };

                    if (configs[themeType] && typeof tsParticles !== 'undefined') {
                        var instances = tsParticles.dom ? tsParticles.dom() : [];
                        if (instances.length > 0) {
                            instances[0].options.load(configs[themeType]);
                            instances[0].refresh();
                        } else {
                            tsParticles.load("tsparticles-bg", configs[themeType]);
                        }
                    } else if (themeType === 'saweria' && typeof tsParticles !== 'undefined') {
                        var instances = tsParticles.dom ? tsParticles.dom() : [];
                        if (instances.length > 0) {
                            instances[0].destroy();
                        }
                    }
                }

                loadParticles();

                // Watch for theme changes on html element
                var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.attributeName === "class") {
                            loadParticles();
                        }
                    });
                });
                observer.observe(document.documentElement, { attributes: true });
            });
        </script>
    </body>
</html>
