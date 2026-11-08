import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ITerminalOptions, Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { SearchBarAddon } from 'xterm-addon-search-bar';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { Unicode11Addon } from 'xterm-addon-unicode11';
import { ScrollDownHelperAddon } from '@/plugins/XtermScrollDownHelperAddon';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ServerContext } from '@/state/server';
import { usePermissions } from '@/plugins/usePermissions';
import { theme as th } from 'twin.macro';
import { debounce } from 'debounce';
import { usePersistedState } from '@/plugins/usePersistedState';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import classNames from 'classnames';
import { ChevronDoubleRightIcon } from '@heroicons/react/solid';

import 'xterm/css/xterm.css';
import styles from './style.module.css';

const theme = {
    background: 'transparent',
    cursor: 'transparent',
    black: '#09090b',
    red: '#E54B4B',
    green: '#4ade80',
    yellow: '#FAED70',
    blue: '#396FE2',
    magenta: '#BB80B3',
    cyan: '#2DDAFD',
    white: '#a1a1aa',
    brightBlack: 'rgba(255, 255, 255, 0.2)',
    brightRed: '#FF5370',
    brightGreen: '#4ade80',
    brightYellow: '#FFCB6B',
    brightBlue: '#82AAFF',
    brightMagenta: '#C792EA',
    brightCyan: '#89DDFF',
    brightWhite: '#ffffff',
    selection: '#FAF089',
};

const isMobileScreen = () => typeof window !== 'undefined' && window.innerWidth < 768;

const initialFontSize = isMobileScreen() ? 11 : 13;

const terminalProps: ITerminalOptions = {
    disableStdin: true,
    cursorStyle: 'underline',
    allowTransparency: true,
    fontSize: initialFontSize,
    lineHeight: 1.25,
    fontFamily: th('fontFamily.mono'),
    rows: 30,
    theme: theme,
};

export default () => {
    const TERMINAL_PRELUDE = '\u001b[1m\u001b[33mcontainer@alxzen~ \u001b[0m';
    const ref = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const terminal = useMemo(() => new Terminal({ ...terminalProps }), []);
    const fitAddon = useMemo(() => new FitAddon(), []);
    const searchAddon = useMemo(() => new SearchAddon(), []);
    const searchBar = useMemo(() => new SearchBarAddon({ searchAddon }), [searchAddon]);
    const webLinksAddon = useMemo(() => new WebLinksAddon(), []);
    const unicode11Addon = useMemo(() => new Unicode11Addon(), []);
    const scrollDownHelperAddon = useMemo(() => new ScrollDownHelperAddon(), []);

    const { connected, instance } = ServerContext.useStoreState((state) => state.socket);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const [canSendCommands] = usePermissions(['control.console']);
    const serverId = ServerContext.useStoreState((state) => state.server.data!.id);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    const [history, setHistory] = usePersistedState<string[]>(`${serverId}:command_history`, []);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const [isMobile, setIsMobile] = useState<boolean>(isMobileScreen);
    const [fontSize, setFontSize] = useState<number>(initialFontSize);

    const [isLightMode, setIsLightMode] = useState(
        document.documentElement.classList.contains('theme-light') || localStorage.getItem('theme') === 'light'
    );

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsLightMode(document.documentElement.classList.contains('theme-light'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (terminal) {
            terminal.options.theme = isLightMode ? {
                ...theme,
                foreground: '#0f172a',
                cursor: '#0f172a',
                black: '#0f172a',
                white: '#334155',
                brightBlack: 'rgba(0, 0, 0, 0.5)',
                brightWhite: '#020617',
            } : theme;
        }
    }, [isLightMode, terminal]);

    const zIndex = `
    .xterm-search-bar__addon {
        z-index: 10;
    }`;

    const handleConsoleOutput = (line: string, prelude = false) =>
        terminal.writeln((prelude ? TERMINAL_PRELUDE : '') + line.replace(/(?:\r\n|\r|\n)$/im, '') + '\u001b[0m');

    const handleTransferStatus = (status: string) => {
        switch (status) {
            case 'failure':
                terminal.writeln(TERMINAL_PRELUDE + 'Transfer has failed.\u001b[0m');
                return;
        }
    };

    const handleDaemonErrorOutput = (line: string) =>
        terminal.writeln(
            TERMINAL_PRELUDE + '\u001b[1m\u001b[41m' + line.replace(/(?:\r\n|\r|\n)$/im, '') + '\u001b[0m'
        );

    const handlePowerChangeEvent = (state: string) =>
        terminal.writeln(TERMINAL_PRELUDE + 'Server marked as ' + state + '...\u001b[0m');

    const handleCommandKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            const newIndex = Math.min(historyIndex + 1, history!.length - 1);
            setHistoryIndex(newIndex);
            e.currentTarget.value = history![newIndex] || '';
            e.preventDefault();
        }

        if (e.key === 'ArrowDown') {
            const newIndex = Math.max(historyIndex - 1, -1);
            setHistoryIndex(newIndex);
            e.currentTarget.value = history![newIndex] || '';
        }

        const command = e.currentTarget.value;
        if (e.key === 'Enter' && command.length > 0) {
            setHistory((prevHistory) => [command, ...prevHistory!].slice(0, 32));
            setHistoryIndex(-1);

            instance && instance.send('send command', command);
            e.currentTarget.value = '';
        }
    };

    useEffect(() => {
        if (connected && ref.current && !terminal.element) {
            terminal.loadAddon(fitAddon);
            terminal.loadAddon(searchAddon);
            terminal.loadAddon(searchBar);
            terminal.loadAddon(webLinksAddon);
            terminal.loadAddon(unicode11Addon);
            terminal.loadAddon(scrollDownHelperAddon);

            terminal.open(ref.current);
            terminal.unicode.activeVersion = '11';

            try {
                fitAddon.fit();
            } catch (e) {}

            searchBar.addNewStyle(zIndex);

            terminal.attachCustomKeyEventHandler((e: KeyboardEvent) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                    document.execCommand('copy');
                    return false;
                } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                    e.preventDefault();
                    searchBar.show();
                    return false;
                } else if (e.key === 'Escape') {
                    searchBar.hidden();
                }
                return true;
            });
        }
    }, [terminal, connected]);

    // Auto-detect mobile vs desktop on screen resize and adapt font & fit
    useEffect(() => {
        const handleResize = debounce(() => {
            const mobile = isMobileScreen();
            setIsMobile(mobile);
            const targetSize = mobile ? 11 : 13;
            setFontSize(targetSize);

            if (terminal && terminal.element) {
                terminal.options.fontSize = targetSize;
                try {
                    fitAddon.fit();
                } catch (e) {}
            }
        }, 120);

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [terminal, fitAddon]);

    // Observe outer container resizing (e.g. user drags resize-y handle)
    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver(
            debounce(() => {
                if (terminal && terminal.element) {
                    try {
                        fitAddon.fit();
                    } catch (e) {}
                }
            }, 30)
        );

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [terminal, fitAddon]);

    // Handle manual font size adjustment
    useEffect(() => {
        if (terminal && terminal.element) {
            terminal.options.fontSize = fontSize;
            try {
                fitAddon.fit();
            } catch (e) {}
        }
    }, [fontSize, terminal, fitAddon]);

    useEffect(() => {
        const listeners: Record<string, (s: string) => void> = {
            [SocketEvent.STATUS]: handlePowerChangeEvent,
            [SocketEvent.CONSOLE_OUTPUT]: handleConsoleOutput,
            [SocketEvent.INSTALL_OUTPUT]: handleConsoleOutput,
            [SocketEvent.TRANSFER_LOGS]: handleConsoleOutput,
            [SocketEvent.TRANSFER_STATUS]: handleTransferStatus,
            [SocketEvent.DAEMON_MESSAGE]: (line) => handleConsoleOutput(line, true),
            [SocketEvent.DAEMON_ERROR]: handleDaemonErrorOutput,
        };

        if (connected && instance) {
            if (!isTransferring) {
                terminal.clear();
            }

            Object.keys(listeners).forEach((key: string) => {
                instance.addListener(key, listeners[key]);
            });
            instance.send(SocketRequest.SEND_LOGS);
        }

        return () => {
            if (instance) {
                Object.keys(listeners).forEach((key: string) => {
                    instance.removeListener(key, listeners[key]);
                });
            }
        };
    }, [connected, instance]);

    const handleZoomIn = () => setFontSize((s) => Math.min(18, s + 1));
    const handleZoomOut = () => setFontSize((s) => Math.max(9, s - 1));
    const handleRefit = () => {
        try {
            fitAddon.fit();
        } catch (e) {}
    };

    return (
        <div
            ref={containerRef}
            style={{ zIndex: 40, backgroundColor: 'hsl(var(--bg-elevated))' }}
            className={classNames(
                styles.terminal,
                'relative rounded-2xl overflow-hidden resize-y transition-colors duration-200 min-h-[340px] border shadow-2xl',
                {
                    'border-sky-500/40 shadow-[0_4px_25px_-5px_rgba(14,165,233,0.2)]': status === 'running',
                    'border-blue-500/40 shadow-[0_4px_25px_-5px_rgba(59,130,246,0.2)]': status === 'starting',
                    'border-white/10 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)]': status === 'offline' || status === 'stopping',
                }
            )}
        >
            {/* Top Toolbar: macOS dots, Accent Bar, Device Mode & Font Zoom */}
            <div 
                className="w-full h-9 transition-colors flex items-center justify-between px-3 select-none border-b"
                style={{ backgroundColor: 'hsl(var(--bg-overlay) / 0.9)', borderBottomColor: 'hsl(var(--border) / 0.8)' }}
            >
                {/* Left: Window Dots & Status */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 mr-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 hidden sm:inline-block">
                        Terminal Console
                    </span>
                    <span 
                        className={classNames('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', {
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30': status === 'running',
                            'bg-blue-500/10 text-blue-400 border border-blue-500/30': status === 'starting',
                            'bg-gray-500/10 text-gray-400 border border-gray-500/30': status === 'offline' || status === 'stopping',
                        })}
                    >
                        {status || 'Connecting'}
                    </span>
                </div>

                {/* Center: Accent Bar */}
                <div className="flex-1 h-full flex items-center justify-center px-2">
                    <div className="w-12 h-1 rounded-full opacity-30 bg-gray-500" />
                </div>

                {/* Right: Device Detection Badge & Zoom Controls */}
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium text-gray-400 px-2 py-0.5 rounded bg-white/[0.04] border border-white/5 hidden xs:inline-block">
                        {isMobile ? '📱 Mobile' : '💻 Desktop'} ({fontSize}px)
                    </span>
                    <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-lg p-0.5">
                        <button
                            type="button"
                            onClick={handleZoomOut}
                            className="px-2 py-0.5 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                            title="Perkecil Font Terminal"
                        >
                            A-
                        </button>
                        <button
                            type="button"
                            onClick={handleZoomIn}
                            className="px-2 py-0.5 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                            title="Perbesar Font Terminal"
                        >
                            A+
                        </button>
                        <button
                            type="button"
                            onClick={handleRefit}
                            className="px-2 py-0.5 text-[10px] font-bold text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded transition-colors"
                            title="Auto Fit Layar"
                        >
                            Fit
                        </button>
                    </div>
                </div>
            </div>

            <SpinnerOverlay visible={!connected} size={'large'} />
            
            {/* Terminal Viewport Container */}
            <div
                className={classNames(styles.container, styles.overflows_container, 'bg-transparent flex-1', { 'rounded-b': !canSendCommands })}
            >
                <div className={'h-full flex-1 w-full'}>
                    <div id={styles.terminal} ref={ref} />
                </div>
            </div>

            {canSendCommands && (
                <div className={classNames('relative', styles.overflows_container)}>
                    <input
                        className={classNames('peer', styles.command_input)}
                        type={'text'}
                        placeholder={'Type a command...'}
                        aria-label={'Console command input.'}
                        disabled={!instance || !connected}
                        onKeyDown={handleCommandKeyDown}
                        autoCorrect={'off'}
                        autoCapitalize={'none'}
                    />
                    <div className={styles.command_icon}>
                        <ChevronDoubleRightIcon className={'w-4 h-4'} />
                    </div>
                </div>
            )}
        </div>
    );
};
