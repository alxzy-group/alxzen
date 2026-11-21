import React, { memo, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip, faMemory, faHdd, faNetworkWired, faServer, faClock, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import tw, { styled } from 'twin.macro';
import isEqual from 'react-fast-compare';
import { formatDistanceToNowStrict, isPast } from 'date-fns';
import copy from 'copy-to-clipboard';

const toPercent = (val: number, max: number) => max > 0 ? Math.min((val / max) * 100, 100) : 0;

const CardWrapper = styled(Link)<{ $status: string }>`
    ${tw`relative flex flex-col justify-between w-full overflow-hidden rounded-2xl no-underline`}
    min-height: 176px;
    background: hsl(var(--bg-card));
    border: 1px solid hsl(var(--border) / 0.85);
    border-left: 3.5px solid ${({ $status }) =>
        $status === 'running'   ? '#10b981' :
        $status === 'starting'  ? '#0ea5e9' :
        $status === 'stopping'  ? '#f59e0b' :
        $status === 'suspended' ? '#ef4444' :
        'hsl(var(--text-muted) / 0.35)'};
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.04);
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.2s ease;
    transform: translateZ(0);
    will-change: transform;
    backface-visibility: hidden;

    &:hover {
        transform: translateY(-2px);
        border-color: rgba(14, 165, 233, 0.45);
        box-shadow: 0 10px 26px rgba(0, 0, 0, 0.32), 0 0 18px rgba(14, 165, 233, 0.12);
    }

    &:hover .hover-glow {
        opacity: 1;
    }

    & > * { position: relative; z-index: 1; }
`;

const Header = styled.div`
    ${tw`px-5 py-4 flex items-center justify-between gap-3`}
    border-bottom: 1px solid hsl(var(--border) / 0.55);
    background: hsl(var(--bg-elevated) / 0.35);
`;

const ServerIconBox = styled.div<{ $status: string }>`
    ${tw`w-10 h-10 flex items-center justify-center rounded-xl text-[14px] flex-shrink-0 transition-all duration-200`}
    color: ${({ $status }) =>
        $status === 'running'   ? '#34d399' :
        $status === 'starting'  ? '#38bdf8' :
        $status === 'stopping'  ? '#fbbf24' :
        $status === 'suspended' ? '#f87171' :
        'hsl(var(--text-muted))'};
    background: ${({ $status }) =>
        $status === 'running'   ? 'rgba(16, 185, 129, 0.12)' :
        $status === 'starting'  ? 'rgba(14, 165, 233, 0.12)' :
        $status === 'stopping'  ? 'rgba(245, 158, 11, 0.12)' :
        $status === 'suspended' ? 'rgba(239, 68, 68, 0.12)'  :
        'hsl(var(--bg-surface) / 0.8)'};
    border: 1px solid ${({ $status }) =>
        $status === 'running'   ? 'rgba(16, 185, 129, 0.28)' :
        $status === 'starting'  ? 'rgba(14, 165, 233, 0.28)' :
        $status === 'stopping'  ? 'rgba(245, 158, 11, 0.28)' :
        $status === 'suspended' ? 'rgba(239, 68, 68, 0.28)'  :
        'hsl(var(--border) / 0.7)'};
`;

const ServerName = styled.h3`
    ${tw`text-base font-extrabold tracking-tight m-0 leading-tight truncate max-w-[180px] sm:max-w-[260px]`}
    color: hsl(var(--text-primary));
`;

const ConnectionBadge = styled.button`
    ${tw`inline-flex items-center gap-1.5 text-[11px] font-mono cursor-pointer transition-all duration-150 outline-none`}
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
        $status === 'running'   ? 'rgba(16, 185, 129, 0.12)'  :
        $status === 'starting'  ? 'rgba(14, 165, 233, 0.12)'  :
        $status === 'stopping'  ? 'rgba(245, 158, 11, 0.12)'  :
        $status === 'suspended' ? 'rgba(239, 68, 68, 0.12)'   :
        'hsl(var(--bg-surface) / 0.85)'};
    color: ${({ $status }) =>
        $status === 'running'   ? '#34d399' :
        $status === 'starting'  ? '#38bdf8' :
        $status === 'stopping'  ? '#fbbf24' :
        $status === 'suspended' ? '#f87171' :
        'hsl(var(--text-muted))'};
    border: 1px solid ${({ $status }) =>
        $status === 'running'   ? 'rgba(16, 185, 129, 0.3)'   :
        $status === 'starting'  ? 'rgba(14, 165, 233, 0.3)'   :
        $status === 'stopping'  ? 'rgba(245, 158, 11, 0.3)'   :
        $status === 'suspended' ? 'rgba(239, 68, 68, 0.3)'    :
        'hsl(var(--border) / 0.7)'};

    .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        box-shadow: 0 0 6px currentColor;
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
    svg { color: #38bdf8; font-size: 10px; }
`;

const StatValue = styled.div`
    ${tw`text-sm sm:text-base font-extrabold tracking-tight mb-2 flex items-baseline gap-1 flex-wrap`}
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
    box-shadow: 0 0 6px ${({ $color }) => $color};
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: width;
    transform: translateZ(0);
`;

const HoverGlow = styled.div`
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 110%, rgba(14, 165, 233, 0.09) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
    z-index: 0;
`;

export default memo(({ server, className }: { server: Server; className?: string }) => {
    const interval = useRef<any>(null);
    const [stats, setStats] = useState<ServerStats | null>(null);
    const [copied, setCopied] = useState(false);

    const getStats = () => getServerResourceUsage(server.uuid).then(d => setStats(d)).catch(() => {});

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
    const cpuPct  = isActive && stats ? toPercent(stats.cpuUsagePercent, cpuMax) : 0;
    const memPct  = isActive && stats && server.limits.memory > 0
        ? toPercent(stats.memoryUsageInBytes, server.limits.memory * 1024 * 1024)
        : 0;
    const diskPct = stats && server.limits.disk > 0
        ? toPercent(stats.diskUsageInBytes, server.limits.disk * 1024 * 1024)
        : 0;

    const barColor = (pct: number) => pct > 85 ? '#ef4444' : pct > 65 ? '#f59e0b' : '#0ea5e9';

    const allocation = server.allocations.find(a => a.isDefault);
    const address = `${allocation?.alias || ip(allocation?.ip || '')}:${allocation?.port || ''}`;

    const handleCopyAddress = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        copy(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    const cpuLimitStr = server.limits.cpu > 0 ? `${server.limits.cpu}%` : '∞';
    const memLimitStr = server.limits.memory > 0 ? bytesToString(mbToBytes(server.limits.memory)) : '∞';
    const diskLimitStr = server.limits.disk > 0 ? bytesToString(mbToBytes(server.limits.disk)) : '∞';

    return (
        <CardWrapper
            to={`/server/${server.id}`}
            className={className}
            $status={status}
        >
            <HoverGlow className="hover-glow" />

            <Header>
                <div css={tw`flex items-center gap-3 min-w-0 flex-1`}>
                    <ServerIconBox $status={status}>
                        <FontAwesomeIcon icon={faServer} />
                    </ServerIconBox>
                    <div css={tw`min-w-0 flex-1`}>
                        <ServerName title={server.name}>{server.name}</ServerName>
                        <div css={tw`flex flex-wrap items-center gap-1.5 mt-1.5`}>
                            <ConnectionBadge type="button" onClick={handleCopyAddress} title="Klik untuk salin IP:Port">
                                <FontAwesomeIcon icon={copied ? faCheck : faNetworkWired} style={{ fontSize: 9, color: copied ? '#34d399' : '#38bdf8' }} />
                                <span>{address}</span>
                                <FontAwesomeIcon icon={faCopy} style={{ fontSize: 9, opacity: 0.55 }} />
                            </ConnectionBadge>
                            {server.expiresAt && (
                                <ExpiryBadge style={{
                                    color: isPast(new Date(server.expiresAt)) ? '#f87171' : 'hsl(var(--text-muted))',
                                    borderColor: isPast(new Date(server.expiresAt)) ? 'rgba(239, 68, 68, 0.35)' : 'hsl(var(--border) / 0.65)',
                                    backgroundColor: isPast(new Date(server.expiresAt)) ? 'rgba(239, 68, 68, 0.1)' : 'hsl(var(--bg-surface) / 0.65)',
                                }}>
                                    <FontAwesomeIcon icon={faClock} style={{ fontSize: 9 }} />
                                    {isPast(new Date(server.expiresAt))
                                        ? 'Expired'
                                        : formatDistanceToNowStrict(new Date(server.expiresAt))}
                                </ExpiryBadge>
                            )}
                        </div>
                    </div>
                </div>
                <StatusBadge $status={status}>
                    <div className="dot" />
                    {status === 'running' ? 'Online' : status === 'starting' ? 'Starting' : status === 'stopping' ? 'Stopping' : status === 'suspended' ? 'Suspended' : 'Offline'}
                </StatusBadge>
            </Header>

            {/* Unified 3-column Metric Grid across ALL server states so every card in the dashboard has identical height & visual rhythm */}
            <StatsGrid>
                <StatBox>
                    <StatLabel>
                        <span css={tw`flex items-center gap-1.5`}><FontAwesomeIcon icon={faMicrochip} /> CPU</span>
                        <span css={tw`text-[9px] font-mono opacity-75`}>{cpuLimitStr}</span>
                    </StatLabel>
                    <StatValue>
                        {isActive && stats ? `${stats.cpuUsagePercent.toFixed(1)}%` : '0.0%'}
                    </StatValue>
                    <BarTrack>
                        <BarFill
                            $color={barColor(cpuPct)}
                            style={{ width: `${cpuPct}%` }}
                        />
                    </BarTrack>
                </StatBox>

                <StatBox>
                    <StatLabel>
                        <span css={tw`flex items-center gap-1.5`}><FontAwesomeIcon icon={faMemory} /> RAM</span>
                        <span css={tw`text-[9px] font-mono opacity-75`}>{memLimitStr}</span>
                    </StatLabel>
                    <StatValue>
                        {isActive && stats ? bytesToString(stats.memoryUsageInBytes) : '0 B'}
                    </StatValue>
                    <BarTrack>
                        <BarFill
                            $color={barColor(memPct)}
                            style={{ width: `${memPct}%` }}
                        />
                    </BarTrack>
                </StatBox>

                <StatBox>
                    <StatLabel>
                        <span css={tw`flex items-center gap-1.5`}><FontAwesomeIcon icon={faHdd} /> Disk</span>
                        <span css={tw`text-[9px] font-mono opacity-75`}>{diskLimitStr}</span>
                    </StatLabel>
                    <StatValue>
                        {stats ? bytesToString(stats.diskUsageInBytes) : '0 B'}
                    </StatValue>
                    <BarTrack>
                        <BarFill
                            $color={barColor(diskPct)}
                            style={{ width: `${diskPct}%` }}
                        />
                    </BarTrack>
                </StatBox>
            </StatsGrid>

            {/* Next-Gen Cloud Card Footer Strip */}
            <div
                css={tw`px-5 py-2.5 flex items-center justify-between text-[11px] font-semibold`}
                style={{
                    borderTop: '1px solid hsl(var(--border) / 0.45)',
                    background: 'hsl(var(--bg-surface) / 0.4)',
                    color: 'hsl(var(--text-muted))',
                }}
            >
                <span css={tw`font-mono text-[10.5px] opacity-80`}>
                    ID: {server.id} {server.node ? `· ${server.node}` : ''}
                </span>
                <span css={tw`flex items-center gap-1.5 font-bold`} style={{ color: '#38bdf8' }}>
                    <span>Open Console</span>
                    <span>→</span>
                </span>
            </div>
        </CardWrapper>
    );
}, isEqual);
