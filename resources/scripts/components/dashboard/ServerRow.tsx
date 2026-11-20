import React, { memo, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip, faMemory, faHdd, faNetworkWired, faSignal, faBolt, faServer, faClock } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip } from '@/lib/formatters';
import tw, { styled } from 'twin.macro';
import Spinner from '@/components/elements/Spinner';
import isEqual from 'react-fast-compare';
import { formatDistanceToNowStrict, isPast } from 'date-fns';

const toPercent = (val: number, max: number) => max > 0 ? Math.min((val / max) * 100, 100) : 0;

const CardWrapper = styled(Link)<{ $status: string }>`
    ${tw`relative block w-full overflow-hidden rounded-2xl no-underline`}
    background: hsl(var(--bg-card));
    border: 1px solid hsl(var(--border) / 0.8);
    border-left: 3.5px solid ${({ $status }) =>
        $status === 'running'   ? '#22c55e' :
        $status === 'starting'  ? '#38bdf8' :
        $status === 'stopping'  ? '#f59e0b' :
        $status === 'suspended' ? '#ef4444' :
        'hsl(var(--text-muted) / 0.3)'};
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    transform: translateZ(0);
    will-change: transform;
    backface-visibility: hidden;

    &:hover {
        transform: translateY(-2px);
        border-color: rgba(14, 165, 233, 0.45);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 16px rgba(14, 165, 233, 0.1);
    }

    &:hover .hover-glow {
        opacity: 1;
    }

    & > * { position: relative; z-index: 1; }
`;

const Header = styled.div`
    ${tw`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
    border-bottom: 1px solid hsl(var(--border) / 0.5);
    background: transparent;
`;

const ServerIconBox = styled.div<{ $status: string }>`
    ${tw`w-10 h-10 flex items-center justify-center rounded-xl text-[14px] flex-shrink-0 transition-all duration-200`}
    color: ${({ $status }) => $status === 'running' ? '#38bdf8' : 'hsl(var(--text-muted))'};
    background: ${({ $status }) => $status === 'running' ? 'rgba(14, 165, 233, 0.12)' : 'hsl(var(--bg-surface) / 0.7)'};
    border: 1px solid ${({ $status }) => $status === 'running' ? 'rgba(14, 165, 233, 0.3)' : 'hsl(var(--border) / 0.7)'};
`;

const ServerName = styled.h3`
    ${tw`text-base font-black tracking-tight m-0 leading-none truncate max-w-[200px] sm:max-w-xs`}
    color: hsl(var(--text-primary));
`;

const ConnectionBadge = styled.div`
    ${tw`flex items-center gap-1.5 text-[11px] font-mono`}
    color: hsl(var(--text-muted));
    background: hsl(var(--bg-surface) / 0.6);
    border: 1px solid hsl(var(--border) / 0.6);
    border-radius: 6px;
    padding: 2.5px 8px;
`;

const StatusBadge = styled.div<{ $status: string }>`
    ${tw`flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider flex-shrink-0 px-3 py-1.5 rounded-full`}
    background: ${({ $status }) =>
        $status === 'running'   ? 'rgba(34, 197, 94, 0.12)'   :
        $status === 'starting'  ? 'rgba(14, 165, 233, 0.12)'  :
        $status === 'stopping'  ? 'rgba(245, 158, 11, 0.12)'  :
        $status === 'suspended' ? 'rgba(239, 68, 68, 0.12)'   :
        'hsl(var(--bg-surface) / 0.8)'};
    color: ${({ $status }) =>
        $status === 'running'   ? '#4ade80' :
        $status === 'starting'  ? '#38bdf8' :
        $status === 'stopping'  ? '#fbbf24' :
        $status === 'suspended' ? '#f87171' :
        'hsl(var(--text-muted))'};
    border: 1px solid ${({ $status }) =>
        $status === 'running'   ? 'rgba(34, 197, 94, 0.3)'   :
        $status === 'starting'  ? 'rgba(14, 165, 233, 0.3)'  :
        $status === 'stopping'  ? 'rgba(245, 158, 11, 0.3)'  :
        $status === 'suspended' ? 'rgba(239, 68, 68, 0.3)'   :
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
    ${tw`grid grid-cols-3`}
    > div:not(:last-child) {
        border-right: 1px solid rgba(255, 255, 255, 0.06);
    }
`;

const StatBox = styled.div`
    ${tw`flex flex-col px-5 py-3.5 transition-colors duration-150`}
    &:hover {
        background: hsl(var(--bg-surface) / 0.4);
    }
`;

const StatLabel = styled.div`
    ${tw`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1.5`}
    color: hsl(var(--text-muted));
    svg { color: #38bdf8; font-size: 10px; }
`;

const StatValue = styled.div`
    ${tw`text-base font-black tracking-tight mb-2 flex items-baseline gap-1`}
    color: hsl(var(--text-primary));
    font-variant-numeric: tabular-nums;
`;

const BarTrack = styled.div`
    width: 100%;
    height: 3px;
    border-radius: 9999px;
    background: hsl(var(--border) / 0.6);
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
    background: radial-gradient(ellipse at 50% 110%, rgba(14, 165, 233, 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
    z-index: 0;
`;

export default memo(({ server, className }: { server: Server; className?: string }) => {
    const interval = useRef<any>(null);
    const [stats, setStats] = useState<ServerStats | null>(null);

    const getStats = () => getServerResourceUsage(server.uuid).then(d => setStats(d)).catch(() => {});

    useEffect(() => {
        getStats();
        interval.current = setInterval(getStats, 30000);
        return () => clearInterval(interval.current);
    }, []);

    // Smart status evaluation to fix stuck "Booting..." when server is already running
    const computeStatus = (): 'running' | 'starting' | 'stopping' | 'offline' | 'suspended' => {
        if (server.status === 'suspended' || stats?.isSuspended) return 'suspended';
        if (server.status === 'installing') return 'starting';
        if (!stats) return 'offline';

        if (stats.status === 'running') return 'running';
        if (stats.status === 'stopping') return 'stopping';

        // Fix: If Wings reports "starting", but the container is actively alive:
        if (stats.uptime > 0 || stats.memoryUsageInBytes > 0 || stats.cpuUsagePercent > 0) {
            return 'running';
        }

        if (stats.status === 'starting') return 'starting';

        return 'offline';
    };

    const status = computeStatus();
    const isRunning = status === 'running';

    const cpuPct  = stats ? Math.min(stats.cpuUsagePercent, 100) : 0;
    const memPct  = stats ? toPercent(stats.memoryUsageInBytes, server.limits.memory * 1024 * 1024) : 0;
    const diskPct = stats ? toPercent(stats.diskUsageInBytes, server.limits.disk * 1024 * 1024) : 0;

    // Color: low → sky blue, mid → amber, high → red
    const barColor = (pct: number) => pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#0ea5e9';

    const allocation = server.allocations.find(a => a.isDefault);
    const address = allocation?.alias || ip(allocation?.ip || '');

    return (
        <CardWrapper
            to={`/server/${server.id}`}
            className={className}
            $status={status}
        >
            <HoverGlow className="hover-glow" />

            <Header>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ServerIconBox $status={status}>
                        <FontAwesomeIcon icon={faServer} />
                    </ServerIconBox>
                    <div>
                        <ServerName title={server.name}>{server.name}</ServerName>
                        <div css={tw`flex flex-wrap items-center gap-2 mt-1.5`}>
                            <ConnectionBadge>
                                <FontAwesomeIcon icon={faNetworkWired} style={{ fontSize: 9 }} />
                                {address}:{allocation?.port}
                            </ConnectionBadge>
                            {server.expiresAt && (
                                <ConnectionBadge style={{ 
                                    color: isPast(new Date(server.expiresAt)) ? '#ef4444' : 'hsl(var(--text-muted))',
                                    borderColor: isPast(new Date(server.expiresAt)) ? 'rgba(239, 68, 68, 0.3)' : 'hsl(var(--border) / 0.6)',
                                    backgroundColor: isPast(new Date(server.expiresAt)) ? 'rgba(239, 68, 68, 0.1)' : 'hsl(var(--bg-surface) / 0.6)',
                                }}>
                                    <FontAwesomeIcon icon={faClock} style={{ fontSize: 9 }} />
                                    {isPast(new Date(server.expiresAt)) 
                                        ? 'Expired' 
                                        : `Expires in ${formatDistanceToNowStrict(new Date(server.expiresAt))}`}
                                </ConnectionBadge>
                            )}
                        </div>
                    </div>
                </div>
                <StatusBadge $status={status}>
                    <div className="dot" />
                    {status === 'running' ? 'Online' : status === 'starting' ? 'Starting' : status === 'stopping' ? 'Stopping' : status === 'suspended' ? 'Suspended' : 'Offline'}
                </StatusBadge>
            </Header>

            {isRunning && stats ? (
                <StatsGrid key="stats">
                    <StatBox>
                        <StatLabel><FontAwesomeIcon icon={faMicrochip} /> CPU</StatLabel>
                        <StatValue>{stats.cpuUsagePercent.toFixed(1)}%</StatValue>
                        <BarTrack>
                            <BarFill 
                                $color={barColor(cpuPct)}
                                style={{ width: `${cpuPct}%` }}
                            />
                        </BarTrack>
                    </StatBox>
                    <StatBox>
                        <StatLabel><FontAwesomeIcon icon={faMemory} /> RAM</StatLabel>
                        <StatValue>
                            {bytesToString(stats.memoryUsageInBytes)}
                            {server.limits.memory > 0 && (
                                <span css={tw`text-[10px] text-neutral-400 font-normal`}>
                                    / {bytesToString(server.limits.memory * 1024 * 1024)}
                                </span>
                            )}
                        </StatValue>
                        <BarTrack>
                            <BarFill 
                                $color={barColor(memPct)}
                                style={{ width: `${memPct}%` }}
                            />
                        </BarTrack>
                    </StatBox>
                    <StatBox>
                        <StatLabel><FontAwesomeIcon icon={faHdd} /> Disk</StatLabel>
                        <StatValue>
                            {bytesToString(stats.diskUsageInBytes)}
                            {server.limits.disk > 0 && (
                                <span css={tw`text-[10px] text-neutral-400 font-normal`}>
                                    / {bytesToString(server.limits.disk * 1024 * 1024)}
                                </span>
                            )}
                        </StatValue>
                        <BarTrack>
                            <BarFill 
                                $color={barColor(diskPct)}
                                style={{ width: `${diskPct}%` }}
                            />
                        </BarTrack>
                    </StatBox>
                </StatsGrid>
            ) : status === 'starting' ? (
                <div css={tw`px-6 py-4 flex items-center justify-between`}>
                    <div css={tw`flex items-center gap-2.5 text-sky-400 font-semibold text-xs`}>
                        <FontAwesomeIcon icon={faBolt} className="animate-pulse" />
                        <span>Memulai Container Server...</span>
                    </div>
                    <div css={tw`flex items-center gap-3 text-neutral-400 font-mono text-[11px]`}>
                        <span>{server.limits.memory ? `${server.limits.memory / 1024} GB RAM` : '∞ RAM'}</span>
                        <span className="text-neutral-600">•</span>
                        <span>{server.limits.disk ? `${server.limits.disk / 1024} GB Disk` : '∞ Disk'}</span>
                    </div>
                </div>
            ) : status === 'suspended' ? (
                <div 
                    css={tw`px-6 py-4 flex items-center justify-between text-xs`}
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)' }}
                >
                    <div css={tw`flex items-center gap-2 text-red-400 font-semibold`}>
                        <div css={tw`w-2 h-2 rounded-full bg-red-500`} />
                        <span>Server Ditangguhkan (Suspended)</span>
                    </div>
                </div>
            ) : (
                <div css={tw`px-6 py-4 flex items-center justify-between text-xs`}>
                    <div css={tw`flex items-center gap-2 text-neutral-400`}>
                        <FontAwesomeIcon icon={faSignal} className="text-neutral-500 text-xs" />
                        <span className="font-medium text-neutral-400">Server Offline</span>
                    </div>
                    <div css={tw`flex items-center gap-3 text-neutral-400 font-mono text-[11px]`}>
                        <span>{server.limits.memory ? `${server.limits.memory / 1024} GB RAM` : '∞ RAM'}</span>
                        <span className="text-neutral-600">•</span>
                        <span>{server.limits.disk ? `${server.limits.disk / 1024} GB Disk` : '∞ Disk'}</span>
                        {server.limits.cpu > 0 && (
                            <>
                                <span className="text-neutral-600">•</span>
                                <span>{server.limits.cpu}% CPU</span>
                            </>
                        )}
                    </div>
                </div>
            )}
        </CardWrapper>
    );
}, isEqual);
