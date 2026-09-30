<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sistem Sedang Update - {{ config('app.name', 'AlxZen Panel') }}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0b0c10;
            --card-bg: rgba(22, 24, 33, 0.65);
            --border-color: rgba(255, 255, 255, 0.08);
            --text-main: #f0f0f8;
            --text-muted: #8b8ba0;
            --accent: #3b82f6;
            --accent-glow: rgba(59, 130, 246, 0.4);
            --pulse-color: #f59e0b;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-main);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            overflow: hidden;
            position: relative;
        }

        /* Animated Background Blobs */
        .blob {
            position: absolute;
            border-radius: 50%;
            filter: blur(100px);
            opacity: 0.5;
            z-index: 0;
            animation: float 20s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
        }

        .blob-1 {
            top: -10%;
            left: 20%;
            width: 40vw;
            height: 40vw;
            background: rgba(59, 130, 246, 0.25);
            animation-delay: 0s;
        }

        .blob-2 {
            bottom: -20%;
            right: 10%;
            width: 50vw;
            height: 50vw;
            background: rgba(139, 92, 246, 0.2);
            animation-delay: -5s;
        }

        @keyframes float {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(5%, 10%) scale(1.1); }
            100% { transform: translate(-5%, -5%) scale(0.9); }
        }

        .glass-container {
            position: relative;
            z-index: 10;
            width: 90%;
            max-width: 540px;
            padding: 3.5rem 2.5rem;
            background: var(--card-bg);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border-radius: 20px;
            border: 1px solid var(--border-color);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
            animation: popIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            transform: translateY(20px);
            opacity: 0;
        }

        @keyframes popIn {
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid rgba(245, 158, 11, 0.2);
            color: var(--pulse-color);
            padding: 6px 14px;
            border-radius: 100px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 24px;
            letter-spacing: 0.5px;
        }

        .dot {
            width: 8px;
            height: 8px;
            background-color: var(--pulse-color);
            border-radius: 50%;
            box-shadow: 0 0 10px var(--pulse-color);
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
            70% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
            100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }

        h1 {
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 16px;
            letter-spacing: -0.5px;
            background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        p.desc {
            color: var(--text-muted);
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 32px;
        }

        .safe-notice {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 32px;
            border: 1px dashed rgba(255,255,255,0.1);
        }

        .safe-notice p {
            font-size: 13px;
            color: #9ca3af;
            margin: 0;
            line-height: 1.5;
        }

        .safe-notice span {
            color: #10b981;
            font-weight: 600;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: var(--accent);
            color: white;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s ease;
            box-shadow: 0 0 20px var(--accent-glow);
            border: none;
            cursor: pointer;
        }

        .btn:hover {
            background: #2563eb;
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(59, 130, 246, 0.5);
        }

        .btn svg {
            width: 18px;
            height: 18px;
        }

        .footer {
            margin-top: 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #4b5563;
        }

        .error-code {
            font-family: monospace;
            background: rgba(0,0,0,0.3);
            padding: 4px 8px;
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.05);
        }

        /* Loading Spinner inside button */
        .spinner {
            animation: spin 1s linear infinite;
            display: none;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .is-reloading .spinner {
            display: inline-block;
        }
        .is-reloading .icon-refresh {
            display: none;
        }
    </style>
</head>
<body>
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>

    <div class="glass-container">
        <div class="status-badge">
            <div class="dot"></div>
            SYSTEM MAINTENANCE
        </div>

        <h1>Mohon Maaf, Panel Sedang Update</h1>
        
        <p class="desc">
            Kami sedang melakukan pembaruan dan optimasi pada sistem panel. Mohon tunggu sebentar, proses ini biasanya tidak memakan waktu lama.
        </p>

        <div class="safe-notice">
            <p>🛡️ <span>Jangan panik!</span> Server game dan aplikasi Anda tetap berjalan dengan aman di latar belakang tanpa gangguan apa pun.</p>
        </div>

        <button class="btn" id="reloadBtn" onclick="reloadPage()">
            <svg class="icon-refresh" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <svg class="spinner" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Coba Muat Ulang
        </button>

        <div class="footer">
            <span>{{ config('app.name', 'AlxZen Panel') }}</span>
            <span class="error-code">ERR_CODE: 503</span>
        </div>
    </div>

    <script>
        function reloadPage() {
            const btn = document.getElementById('reloadBtn');
            btn.classList.add('is-reloading');
            btn.innerHTML = btn.innerHTML.replace('Coba Muat Ulang', 'Memuat...');
            
            setTimeout(() => {
                window.location.reload();
            }, 600);
        }

        // Auto reload attempt every 30 seconds
        setTimeout(() => {
            reloadPage();
        }, 30000);
    </script>
</body>
</html>
