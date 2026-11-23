import React, { memo, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMicrochip,
    faMemory,
    faHdd,
    faNetworkWired,
    faServer,
    faClock,
    faCopy,
    faCheck,
    faFolderOpen,
    faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import { Link, useHistory } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import tw, { styled } from 'twin.macro';
import isEqual from 'react-fast-compare';
import { differenceInDays, formatDistanceToNowStrict, isPast } from 'date-fns';
import copy from 'copy-to-clipboard';

const toPercent = (val: number, max: number) => (max > 0 ? Math.min((val / max) * 100, 100) : 0);

const CardWrapper = styled(Link) <{ $status: string }>`
    ${tw`relative flex flex-col justify-between w-full overflow-hidden rounded-2xl no-underline`}
    min-height: 176px;
    background: hsl(var(--bg-card));
    border: 1px solid hsl(var(--border) / 0.85);
    border-left: 3.5px solid
        ${({ $status }) =>
        $status === 'running'
            ? '#10b981'
            : $status === 'starting'
                ? '#0ea5e9'
                : $status === 'stopping'
                    ? '#f59e0b'
                    : $status === 'suspended'
                        ? '#ef4444'
                        : 'hsl(var(--text-muted) / 0.35)'};
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.04);
    transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.18s ease, box-shadow 0.18s ease;
    transform: translateZ(0);
    will-change: transform;
    backface-visibility: hidden;

    &:hover {
        transform: translateY(-2px);
        border-color: rgba(14, 165, 233, 0.45);
        box-shadow: 0 10px 26px rgba(0, 0, 0, 0.32), 0 0 16px rgba(14, 165, 233, 0.12);
    }

    & > * {
        position: relative;
        z-index: 1;
    }

    @keyframes alxStatusPulse {
        0%,
        100% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.45;
            transform: scale(0.85);
        }
    }
`;

const ListWrapper = styled(Link) <{ $status: string }>`
    ${tw`relative flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full overflow-hidden rounded-2xl px-5 py-3.5 no-underline`}
    background: hsl(var(--bg-card));
    border: 1px solid hsl(var(--border) / 0.85);
    border-left: 3.5px solid
        ${({ $status }) =>
        $status === 'running'
            ? '#10b981'
            : $status === 'starting'
                ? '#0ea5e9'
                : $status === 'stopping'
                    ? '#f59e0b'
                    : $status === 'suspended'
                        ? '#ef4444'
                        : 'hsl(var(--text-muted) / 0.35)'};
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.03);
    transition: transform 0.16s ease, border-color 0.16s ease, background-color 0.16s ease;
    transform: translateZ(0);

    &:hover {
        transform: translateY(-1px);
        background: hsl(var(--bg-elevated));
        border-color: rgba(14, 165, 233, 0.45);
    }

    @keyframes alxStatusPulse {
        0%,
        100% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.45;
            transform: scale(0.85);
        }
    }
`;

const Header = styled.div`
    ${tw`px-5 py-4 flex items-center justify-between gap-3`}
    border-bottom: 1px solid hsl(var(--border) / 0.55);
    background: hsl(var(--bg-elevated) / 0.35);
`;

const ServerIconBox = styled.div<{ $status: string }>`
    ${tw`w-10 h-10 flex items-center justify-center rounded-xl text-[14px] flex-shrink-0 transition-colors duration-150`}
    color: ${({ $status }) =>
        $status === 'running'
            ? '#34d399'
            : $status === 'starting'
                ? '#38bdf8'
                : $status === 'stopping'
                    ? '#fbbf24'
                    : $status === 'suspended'
                        ? '#f87171'
                        : 'hsl(var(--text-muted))'};
    background: ${({ $status }) =>
        $status === 'running'
            ? 'rgba(16, 185, 129, 0.12)'
            : $status === 'starting'
                ? 'rgba(14, 165, 233, 0.12)'
                : $status === 'stopping'
                    ? 'rgba(245, 158, 11, 0.12)'
                    : $status === 'suspended'
                        ? 'rgba(239, 68, 68, 0.12)'
                        : 'hsl(var(--bg-surface) / 0.8)'};
    border: 1px solid
        ${({ $status }) =>
        $status === 'running'
            ? 'rgba(16, 185, 129, 0.28)'
            : $status === 'starting'
                ? 'rgba(14, 165, 233, 0.28)'
                : $status === 'stopping'
                    ? 'rgba(245, 158, 11, 0.28)'
                    : $status === 'suspended'
                        ? 'rgba(239, 68, 68, 0.28)'
                        : 'hsl(var(--border) / 0.7)'};
`;

const ServerName = styled.h3`
    ${tw`text-base font-extrabold tracking-tight m-0 leading-tight truncate max-w-[180px] sm:max-w-[260px]`}
    color: hsl(var(--text-primary));
`;

const ConnectionBadge = styled.button`
    ${tw`inline-flex items-center gap-1.5 text-[11px] font-mono cursor-pointer transition-colors duration-150 outline-none`}
    color: hsl(var(--text-secondary));
    background: hsl(var(--bg-surface) / 0.75);
    border: 1px solid hsl(var(--border) / 0.75);
    border-radius: 7px;
    padding: 2.5px 8px;

    &:hover {
        color: #38bdf8;
        border-color: rgba(14, 165, 233, 0.45);
        background: rgba(14, 165, 233, 0.08);
    }
`;

const ExpiryBadge = styled.div`
    ${tw`inline-flex items-center gap-1.5 text-[11px] font-medium`}
    color: hsl(var(--text-muted));
    background: hsl(var(--bg-surface) / 0.65);
    border: 1px solid hsl(var(--border) / 0.65);
    border-radius: 7px;
    padding: 2.5px 8px;
`;

const StatusBadge = styled.div<{ $status: string }>`
    ${tw`flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider flex-shrink-0 px-3 py-1.5 rounded-full`}
    background: ${({ $status }) =>
        $status === 'running'
            ? 'rgba(16, 185, 129, 0.12)'
            : $status === 'starting'
                ? 'rgba(14, 165, 233, 0.12)'
                : $status === 'stopping'
                    ? 'rgba(245, 158, 11, 0.12)'
                    : $status === 'suspended'
                        ? 'rgba(239, 68, 68, 0.12)'
                        : 'hsl(var(--bg-surface) / 0.85)'};
    color: ${({ $status }) =>
        $status === 'running'
            ? '#34d399'
            : $status === 'starting'
                ? '#38bdf8'
                : $status === 'stopping'
                    ? '#fbbf24'
                    : $status === 'suspended'
                        ? '#f87171'
                        : 'hsl(var(--text-muted))'};
    border: 1px solid
        ${({ $status }) =>
        $status === 'running'
            ? 'rgba(16, 185, 129, 0.3)'
            : $status === 'starting'
                ? 'rgba(14, 165, 233, 0.3)'
                : $status === 'stopping'
                    ? 'rgba(245, 158, 11, 0.3)'
                    : $status === 'suspended'
                        ? 'rgba(239, 68, 68, 0.3)'
                        : 'hsl(var(--border) / 0.7)'};

    .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        box-shadow: 0 0 6px currentColor;
        ${({ $status }) =>
        ($status === 'running' || $status === 'starting') &&
        'animation: alxStatusPulse 2s ease-in-out infinite;'}
    }
`;

const StatsGrid = styled.div`
    ${tw`grid grid-cols-3 flex-1`}
    > div:not(:last-child) {
        border-right: 1px solid hsl(var(--border) / 0.45);
    }
`;

const StatBox = styled.div`
    ${tw`flex flex-col justify-between px-4 sm:px-5 py-3.5 transition-colors duration-150`}
    &:hover {
        background: hsl(var(--bg-surface) / 0.35);
    }
`;

const StatLabel = styled.div`
    ${tw`flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5`}
    color: hsl(var(--text-muted));
    svg {
        color: #38bdf8;
        font-size: 10px;
    }
`;

const StatValue = styled.div`
    ${tw`text-sm sm:text-base font-extrabold tracking-tight mb-2 flex items-baseline justify-between gap-1`}
    color: hsl(var(--text-primary));
    font-variant-numeric: tabular-nums;
`;

const BarTrack = styled.div`
    width: 100%;
    height: 4px;
    border-radius: 9999px;
    background: hsl(var(--border) / 0.65);
    overflow: hidden;
`;

const BarFill = styled.div<{ $color: string }>`
    height: 100%;
    border-radius: 9999px;
    background: ${({ $color }) => $color};
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: width;
    transform: translateZ(0);
`;

const QuickActionPill = styled.button`
    ${tw`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors duration-150 outline-none`}
    background: hsl(var(--bg-elevated));
    border: 1px solid hsl(var(--border));
    color: hsl(var(--text-secondary));

    &:hover {
        color: #38bdf8;
        border-color: rgba(56, 189, 248, 0.45);
        background: rgba(14, 165, 233, 0.08);
    }
`;

export default memo(
    ({
        server,
        className,
        viewMode = 'grid',
        maskIp = false,
    }: {
        server: Server;
        className?: string;
        viewMode?: 'grid' | 'list';
        maskIp?: boolean;
    }) => {
        const history = useHistory();
        const interval = useRef<any>(null);
        const [stats, setStats] = useState<ServerStats | null>(null);
        const [copied, setCopied] = useState(false);

        const getStats = () =>
            getServerResourceUsage(server.uuid)
                .then((d) => setStats(d))
                .catch(() => { });

        useEffect(() => {
            getStats();
            interval.current = setInterval(getStats, 30000);
            return () => clearInterval(interval.current);
        }, []);

        const computeStatus = (): 'running' | 'starting' | 'stopping' | 'offline' | 'suspended' => {
            if (server.status === 'suspended' || stats?.isSuspended) return 'suspended';
            if (server.status === 'installing') return 'starting';
            if (!stats) return 'offline';

            if (stats.status === 'running') return 'running';
            if (stats.status === 'stopping') return 'stopping';

            if (stats.uptime > 0 || stats.memoryUsageInBytes > 0 || stats.cpuUsagePercent > 0) {
                return 'running';
            }

            if (stats.status === 'starting') return 'starting';

            return 'offline';
        };

        const status = computeStatus();
        const isActive = status === 'running' || status === 'starting';

        const cpuMax = server.limits.cpu > 0 ? server.limits.cpu : 100;
        const cpuPct = isActive && stats ? toPercent(stats.cpuUsagePercent, cpuMax) : 0;
        const memPct =
            isActive && stats && server.limits.memory > 0
                ? toPercent(stats.memoryUsageInBytes, server.limits.memory * 1024 * 1024)
                : 0;
        const diskPct =
            stats && server.limits.disk > 0 ? toPercent(stats.diskUsageInBytes, server.limits.disk * 1024 * 1024) : 0;

        const barColor = (pct: number) => (pct > 85 ? '#ef4444' : pct > 65 ? '#f59e0b' : '#0ea5e9');

        const allocation = server.allocations.find((a) => a.isDefault);
        const address = `${allocation?.alias || ip(allocation?.ip || '')}:${allocation?.port || ''}`;
        const displayAddress = maskIp ? `•••.•••.•••:${allocation?.port || '••••'}` : address;

        const handleCopyAddress = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();
            copy(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        };

        const handleOpenFiles = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();
            history.push(`/server/${server.id}/files`);
        };

        const cpuLimitStr = server.limits.cpu > 0 ? `${server.limits.cpu}%` : '∞';
        const memLimitStr = server.limits.memory > 0 ? bytesToString(mbToBytes(server.limits.memory)) : '∞';
        const diskLimitStr = server.limits.disk > 0 ? bytesToString(mbToBytes(server.limits.disk)) : '∞';

        const expiryDate = server.expiresAt ? new Date(server.expiresAt) : null;
        const expired = expiryDate ? isPast(expiryDate) : false;
        const expiringSoon = expiryDate && !expired ? differenceInDays(expiryDate, new Date()) <= 3 : false;

        const statusLabel =
            status === 'running'
                ? 'Online'
                : status === 'starting'
                    ? 'Starting'
                    : status === 'stopping'
                        ? 'Stopping'
                        : status === 'suspended'
                            ? 'Suspended'
                            : 'Offline';

        if (viewMode === 'list') {
            return (
                <ListWrapper to={`/server/${server.id}`} className={className} $status={status}>
                    <div css={tw`flex items-center gap-3.5 min-w-0 lg:w-1/3`}>
                        <ServerIconBox $status={status}>
                            <FontAwesomeIcon icon={faServer} />
                        </ServerIconBox>
                        <div css={tw`min-w-0 flex-1`}>
                            <div css={tw`flex items-center gap-2`}>
                                <ServerName title={server.name}>{server.name}</ServerName>
                                <StatusBadge $status={status} style={{ padding: '2px 8px', fontSize: 9 }}>
                                    <div className="dot" />
                                    {statusLabel}
                                </StatusBadge>
                            </div>
                            <div css={tw`flex flex-wrap items-center gap-1.5 mt-1`}>
                                <ConnectionBadge type="button" onClick={handleCopyAddress} title="Klik untuk salin IP:Port">
                                    <FontAwesomeIcon
                                        icon={copied ? faCheck : maskIp ? faEyeSlash : faNetworkWired}
                                        style={{ fontSize: 9, color: copied ? '#34d399' : '#38bdf8' }}
                                    />
                                    <span>{displayAddress}</span>
                                </ConnectionBadge>
                                {expiryDate && (
                                    <ExpiryBadge
                                        style={{
                                            color: expired ? '#f87171' : expiringSoon ? '#fbbf24' : 'hsl(var(--text-muted))',
                                            borderColor: expired
                                                ? 'rgba(239, 68, 68, 0.35)'
                                                : expiringSoon
                                                    ? 'rgba(245, 158, 11, 0.35)'
                                                    : 'hsl(var(--border) / 0.65)',
                                            backgroundColor: expired
                                                ? 'rgba(239, 68, 68, 0.1)'
                                                : expiringSoon
                                                    ? 'rgba(245, 158, 11, 0.08)'
                                                    : 'hsl(var(--bg-surface) / 0.65)',
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faClock} style={{ fontSize: 9 }} />
                                        {expired ? 'Expired' : formatDistanceToNowStrict(expiryDate)}
                                    </ExpiryBadge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div css={tw`grid grid-cols-3 gap-4 flex-1 min-w-0 lg:max-w-md`}>
                        <div>
                            <div css={tw`flex items-center justify-between text-[10px] font-bold uppercase mb-1`} style={{ color: 'hsl(var(--text-muted))' }}>
                                <span>CPU</span>
                                <span css={tw`font-mono`}>{isActive && stats ? `${stats.cpuUsagePercent.toFixed(1)}%` : '0.0%'}</span>
                            </div>
                            <BarTrack style={{ height: 3 }}>
                                <BarFill $color={barColor(cpuPct)} style={{ width: `${cpuPct}%` }} />
                            </BarTrack>
                        </div>
                        <div>
                            <div css={tw`flex items-center justify-between text-[10px] font-bold uppercase mb-1`} style={{ color: 'hsl(var(--text-muted))' }}>
                                <span>RAM</span>
                                <span css={tw`font-mono`}>{isActive && stats ? bytesToString(stats.memoryUsageInBytes) : '0 B'}</span>
                            </div>
                            <BarTrack style={{ height: 3 }}>
                                <BarFill $color={barColor(memPct)} style={{ width: `${memPct}%` }} />
                            </BarTrack>
                        </div>
                        <div>
                            <div css={tw`flex items-center justify-between text-[10px] font-bold uppercase mb-1`} style={{ color: 'hsl(var(--text-muted))' }}>
                                <span>Disk</span>
                                <span css={tw`font-mono`}>{stats ? bytesToString(stats.diskUsageInBytes) : '0 B'}</span>
                            </div>
                            <BarTrack style={{ height: 3 }}>
                                <BarFill $color={barColor(diskPct)} style={{ width: `${diskPct}%` }} />
                            </BarTrack>
                        </div>
                    </div>

                    <div css={tw`flex items-center justify-end gap-2 flex-shrink-0`}>
                        <QuickActionPill type="button" onClick={handleOpenFiles} title="Open File Manager">
                            <FontAwesomeIcon icon={faFolderOpen} style={{ fontSize: 10 }} />
                            <span>Files</span>
                        </QuickActionPill>
                        <span
                            css={tw`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold`}
                            style={{
                                background: 'rgba(14, 165, 233, 0.12)',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                color: '#38bdf8',
                            }}
                        >
                            <span>Console</span>
                            <span>&rarr;</span>
                        </span>
                    </div>
                </ListWrapper>
            );
        }

        return (
            <CardWrapper to={`/server/${server.id}`} className={className} $status={status}>
                <Header>
                    <div css={tw`flex items-center gap-3 min-w-0 flex-1`}>
                        <ServerIconBox $status={status}>
                            <FontAwesomeIcon icon={faServer} />
                        </ServerIconBox>
                        <div css={tw`min-w-0 flex-1`}>
                            <ServerName title={server.name}>{server.name}</ServerName>
                            <div css={tw`flex flex-wrap items-center gap-1.5 mt-1.5`}>
                                <ConnectionBadge type="button" onClick={handleCopyAddress} title="Klik untuk salin IP:Port">
                                    <FontAwesomeIcon
                                        icon={copied ? faCheck : maskIp ? faEyeSlash : faNetworkWired}
                                        style={{ fontSize: 9, color: copied ? '#34d399' : '#38bdf8' }}
                                    />
                                    <span>{displayAddress}</span>
                                    <FontAwesomeIcon icon={faCopy} style={{ fontSize: 9, opacity: 0.55 }} />
                                </ConnectionBadge>
                                {expiryDate && (
                                    <ExpiryBadge
                                        style={{
                                            color: expired ? '#f87171' : expiringSoon ? '#fbbf24' : 'hsl(var(--text-muted))',
                                            borderColor: expired
                                                ? 'rgba(239, 68, 68, 0.35)'
                                                : expiringSoon
                                                    ? 'rgba(245, 158, 11, 0.35)'
                                                    : 'hsl(var(--border) / 0.65)',
                                            backgroundColor: expired
                                                ? 'rgba(239, 68, 68, 0.1)'
                                                : expiringSoon
                                                    ? 'rgba(245, 158, 11, 0.08)'
                                                    : 'hsl(var(--bg-surface) / 0.65)',
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faClock} style={{ fontSize: 9 }} />
                                        {expired ? 'Expired' : formatDistanceToNowStrict(expiryDate)}
                                    </ExpiryBadge>
                                )}
                            </div>
                        </div>
                    </div>
                    <StatusBadge $status={status}>
                        <div className="dot" />
                        {statusLabel}
                    </StatusBadge>
                </Header>

                <StatsGrid>
                    <StatBox>
                        <StatLabel>
                            <span css={tw`flex items-center gap-1.5`}>
                                <FontAwesomeIcon icon={faMicrochip} /> CPU
                            </span>
                            <span css={tw`text-[9px] font-mono opacity-75`}>{cpuLimitStr}</span>
                        </StatLabel>
                        <StatValue>
                            <span>{isActive && stats ? `${stats.cpuUsagePercent.toFixed(1)}%` : '0.0%'}</span>
                            <span css={tw`text-[10px] font-mono font-bold`} style={{ color: 'hsl(var(--text-muted))' }}>
                                {Math.round(cpuPct)}%
                            </span>
                        </StatValue>
                        <BarTrack>
                            <BarFill $color={barColor(cpuPct)} style={{ width: `${cpuPct}%` }} />
                        </BarTrack>
                    </StatBox>

                    <StatBox>
                        <StatLabel>
                            <span css={tw`flex items-center gap-1.5`}>
                                <FontAwesomeIcon icon={faMemory} /> RAM
                            </span>
                            <span css={tw`text-[9px] font-mono opacity-75`}>{memLimitStr}</span>
                        </StatLabel>
                        <StatValue>
                            <span>{isActive && stats ? bytesToString(stats.memoryUsageInBytes) : '0 B'}</span>
                            {server.limits.memory > 0 && (
                                <span css={tw`text-[10px] font-mono font-bold`} style={{ color: 'hsl(var(--text-muted))' }}>
                                    {Math.round(memPct)}%
                                </span>
                            )}
                        </StatValue>
                        <BarTrack>
                            <BarFill $color={barColor(memPct)} style={{ width: `${memPct}%` }} />
                        </BarTrack>
                    </StatBox>

                    <StatBox>
                        <StatLabel>
                            <span css={tw`flex items-center gap-1.5`}>
                                <FontAwesomeIcon icon={faHdd} /> Disk
                            </span>
                            <span css={tw`text-[9px] font-mono opacity-75`}>{diskLimitStr}</span>
                        </StatLabel>
                        <StatValue>
                            <span>{stats ? bytesToString(stats.diskUsageInBytes) : '0 B'}</span>
                            {server.limits.disk > 0 && (
                                <span css={tw`text-[10px] font-mono font-bold`} style={{ color: 'hsl(var(--text-muted))' }}>
                                    {Math.round(diskPct)}%
                                </span>
                            )}
                        </StatValue>
                        <BarTrack>
                            <BarFill $color={barColor(diskPct)} style={{ width: `${diskPct}%` }} />
                        </BarTrack>
                    </StatBox>
                </StatsGrid>

                <div
                    css={tw`px-5 py-2.5 flex items-center justify-between text-[11px] font-semibold`}
                    style={{
                        borderTop: '1px solid hsl(var(--border) / 0.45)',
                        background: 'hsl(var(--bg-surface) / 0.4)',
                        color: 'hsl(var(--text-muted))',
                    }}
                >
                    <span css={tw`font-mono text-[10.5px] opacity-80 truncate`}>
                        ID: {server.id} {server.node ? `· ${server.node}` : ''}
                    </span>
                    <div css={tw`flex items-center gap-2.5 flex-shrink-0`}>
                        <QuickActionPill type="button" onClick={handleOpenFiles} title="Quick Open File Manager">
                            <FontAwesomeIcon icon={faFolderOpen} style={{ fontSize: 10 }} />
                            <span>Files</span>
                        </QuickActionPill>
                        <span css={tw`flex items-center gap-1 font-bold`} style={{ color: '#38bdf8' }}>
                            <span>Console</span>
                            <span>&rarr;</span>
                        </span>
                    </div>
                </div>
            </CardWrapper>
        );
    },
    isEqual
);
