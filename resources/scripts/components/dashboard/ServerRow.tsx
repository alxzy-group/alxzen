import React, { memo, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip, faMemory, faHdd, faNetworkWired, faSignal, faBolt, faServer } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip } from '@/lib/formatters';
import tw, { styled } from 'twin.macro';
import Spinner from '@/components/elements/Spinner';
import isEqual from 'react-fast-compare';
import { motion, AnimatePresence } from 'framer-motion';

// Purple design system tokens
// Primary: #7c3aed / #a78bfa / #c4b5fd
// Surface: rgba(124,58,237,0.06) border rgba(124,58,237,0.15)
// BG: #09090f → #0c0b14

const toPercent = (val: number, max: number) => max > 0 ? Math.min((val / max) * 100, 100) : 0;

const globalStyles = `
@keyframes srv-bar-in {
    from { width: 0%; opacity: 0; }
}
@keyframes srv-border-breathe {
    0%,100% { border-left-color: rgba(14, 165, 233, 0.3); }
    50%      { border-left-color: rgba(14, 165, 233, 0.8); }
}
`;

const InjectStyles = () => <style dangerouslySetInnerHTML={{ __html: globalStyles }} />;

const CardWrapper = styled(motion(Link))<{ $status: string }>`
    ${tw`relative block w-full overflow-hidden`}
    background: hsl(var(--bg-elevated));
    border: 3px solid hsl(var(--text-primary));
    border-radius: 12px;
    box-shadow: 6px 6px 0px hsl(var(--text-primary));
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease;
    isolation: isolate;
    text-decoration: none;

    &:hover {
        transform: translate(3px, 3px);
        box-shadow: 3px 3px 0px hsl(var(--text-primary));
        background: hsl(var(--bg-surface));
    }
    
    border-left: 4px solid ${({ $status }) =>
        $status === 'running'  ? '#4ade80' :
        $status === 'starting' ? '#0ea5e9' :
        $status === 'offline'  ? 'hsl(var(--text-muted))' : '#facc15'};
    
    & > * { position: relative; z-index: 1; }
`;

const Header = styled.div`
    ${tw`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
    border-bottom: 1px solid hsl(var(--border));
    background: transparent;
`;

const ServerIconBox = styled.div`
    ${tw`w-9 h-9 flex items-center justify-center rounded-lg text-[13px]`}
    color: hsl(var(--text-secondary));
    background: hsl(var(--bg-elevated));
    border: 1px solid hsl(var(--border));
    flex-shrink: 0;
`;

const ServerName = styled.h3`
    ${tw`text-base font-black tracking-tight m-0 leading-none`}
    color: hsl(var(--text-primary));
`;

const ConnectionBadge = styled.div`
    ${tw`flex items-center gap-2 text-[11px] font-mono mt-1.5`}
    color: hsl(var(--text-muted));
    background: hsl(var(--bg-elevated));
    border: 1px solid hsl(var(--border));
    border-radius: 6px;
    padding: 2px 8px;
`;

const StatusBadge = styled.div<{ $status: string }>`
    ${tw`flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest flex-shrink-0`}
    padding: 5px 12px;
    border-radius: 6px;
    background: ${({ $status }) =>
        $status === 'running'  ? 'rgba(34,197,94,0.1)'    :
        $status === 'starting' ? 'rgba(14,165,233,0.12)' :
        $status === 'offline'  ? 'hsl(var(--gray-700) / 0.5)'  : 'rgba(234,179,8,0.1)'};
    color: ${({ $status }) =>
        $status === 'running'  ? '#4ade80' :
        $status === 'starting' ? '#38bdf8' :
        $status === 'offline'  ? 'hsl(var(--gray-300))' : '#facc15'};
    border: 1px solid ${({ $status }) =>
        $status === 'running'  ? 'rgba(34,197,94,0.2)'    :
        $status === 'starting' ? 'rgba(14,165,233,0.3)'  :
        $status === 'offline'  ? 'hsl(var(--gray-600) / 0.5)'  : 'rgba(234,179,8,0.2)'};

    .dot {
        width: 6px; height: 6px;
        border-radius: 50%;
        background: currentColor;
        box-shadow: 0 0 6px currentColor;
    }
`;

const StatsGrid = styled.div`
    ${tw`grid grid-cols-3`}
`;

const StatBox = styled.div`
    ${tw`flex flex-col px-5 py-4`}
    transition: background 0.2s;
    &:not(:last-child) { border-right: 1px solid hsl(var(--border)); }
    &:hover { background: hsl(var(--bg-elevated)); }
`;

const StatLabel = styled.div`
    ${tw`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mb-2`}
    color: hsl(var(--text-muted));
    svg { color: hsl(var(--accent)); }
`;

const StatValue = styled.div`
    ${tw`text-lg font-black tracking-tight mb-2`}
    color: hsl(var(--text-primary));
    font-variant-numeric: tabular-nums;
`;

const BarTrack = styled.div`
    width: 100%; height: 2px;
    background: hsl(var(--border));
`;

const BarFill = styled(motion.div)<{ $color: string }>`
    height: 100%;
    background: ${({ $color }) => $color};
    box-shadow: 0 0 6px ${({ $color }) => $color};
`;

const OfflineState = styled(motion.div)`
    ${tw`flex flex-col items-center justify-center py-7 text-center gap-2`}
`;

const HoverGlow = styled(motion.div)`
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 50% 110%, rgba(14,165,233,0.15) 0%, transparent 70%);
    opacity: 0; pointer-events: none; z-index: 0;
`;

export default memo(({ server, className }: { server: Server; className?: string }) => {
    const interval = useRef<any>(null);
    const [stats, setStats] = useState<ServerStats | null>(null);
    const [hovered, setHovered] = useState(false);

    const getStats = () => getServerResourceUsage(server.uuid).then(d => setStats(d)).catch(() => {});

    useEffect(() => {
        getStats();
        interval.current = setInterval(getStats, 30000);
        return () => clearInterval(interval.current);
    }, []);

    const status = stats?.status || (server.status === 'installing' ? 'starting' : 'offline');
    const isRunning = status === 'running';

    const cpuPct  = stats ? Math.min(stats.cpuUsagePercent, 100) : 0;
    const memPct  = stats ? toPercent(stats.memoryUsageInBytes, server.limits.memory * 1024 * 1024) : 0;
    const diskPct = stats ? toPercent(stats.diskUsageInBytes, server.limits.disk * 1024 * 1024) : 0;

    // Color: low → sky blue, mid → amber, high → red
    const barColor = (pct: number) => pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#0ea5e9';

    const allocation = server.allocations.find(a => a.isDefault);
    const address = allocation?.alias || ip(allocation?.ip || '');

    return (
        <>
            <InjectStyles />
            <CardWrapper
                to={`/server/${server.id}`}
                className={className}
                $status={status}
                onHoverStart={() => setHovered(true)}
                onHoverEnd={() => setHovered(false)}
                whileHover={{
                    y: -3,
                    boxShadow: '0 12px 40px -10px rgba(0,0,0,0.5)',
                    borderColor: 'rgba(14, 165, 233, 0.3)',
                }}
                animate={status === 'starting' ? {
                    boxShadow: ['0 0 0 rgba(14,165,233,0)', '0 0 24px rgba(14,165,233,0.25)', '0 0 0 rgba(14,165,233,0)']
                } : {}}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            >
                <HoverGlow animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.3 }} />

                <Header>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <ServerIconBox>
                            <FontAwesomeIcon icon={faServer} />
                        </ServerIconBox>
                        <div>
                            <ServerName>{server.name}</ServerName>
                            <ConnectionBadge>
                                <FontAwesomeIcon icon={faNetworkWired} style={{ fontSize: 9 }} />
                                {address}:{allocation?.port}
                            </ConnectionBadge>
                        </div>
                    </div>
                    <StatusBadge $status={status}>
                        <div className="dot" />
                        {status === 'running' ? 'Online' : status === 'starting' ? 'Starting' : status === 'offline' ? 'Offline' : 'Standby'}
                    </StatusBadge>
                </Header>

                <AnimatePresence mode="wait">
                    {!isRunning ? (
                        <OfflineState key="off"
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25 }}
                        >
                            <FontAwesomeIcon
                                icon={status === 'starting' ? faBolt : faSignal}
                                style={{ fontSize: 24, color: status === 'starting' ? 'hsl(var(--accent))' : 'hsl(var(--border))', marginBottom: 4 }}
                            />
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>
                                {status === 'starting' ? 'Booting...' : 'Offline'}
                            </span>
                        </OfflineState>
                    ) : !stats ? (
                        <motion.div key="load" css={tw`p-10 flex justify-center`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Spinner size="small" />
                        </motion.div>
                    ) : (
                        <StatsGrid key="stats">
                            <StatBox>
                                <StatLabel><FontAwesomeIcon icon={faMicrochip} /> CPU</StatLabel>
                                <StatValue>{stats.cpuUsagePercent.toFixed(1)}%</StatValue>
                                <BarTrack><BarFill $color={barColor(cpuPct)}
                                    initial={{ width: '0%' }} animate={{ width: `${cpuPct}%` }}
                                    transition={{ duration: 1.1, ease: 'easeOut' }} /></BarTrack>
                            </StatBox>
                            <StatBox>
                                <StatLabel><FontAwesomeIcon icon={faMemory} /> RAM</StatLabel>
                                <StatValue>{bytesToString(stats.memoryUsageInBytes)}</StatValue>
                                <BarTrack><BarFill $color={barColor(memPct)}
                                    initial={{ width: '0%' }} animate={{ width: `${memPct}%` }}
                                    transition={{ duration: 1.1, ease: 'easeOut', delay: 0.12 }} /></BarTrack>
                            </StatBox>
                            <StatBox>
                                <StatLabel><FontAwesomeIcon icon={faHdd} /> Disk</StatLabel>
                                <StatValue>{bytesToString(stats.diskUsageInBytes)}</StatValue>
                                <BarTrack><BarFill $color={barColor(diskPct)}
                                    initial={{ width: '0%' }} animate={{ width: `${diskPct}%` }}
                                    transition={{ duration: 1.1, ease: 'easeOut', delay: 0.24 }} /></BarTrack>
                            </StatBox>
                        </StatsGrid>
                    )}
                </AnimatePresence>
            </CardWrapper>
        </>
    );
}, isEqual);