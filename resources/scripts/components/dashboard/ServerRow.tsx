import React, { memo, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthernet, faHdd, faMemory, faMicrochip, faServer, faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import tw, { styled } from 'twin.macro';
import Spinner from '@/components/elements/Spinner';
import isEqual from 'react-fast-compare';

// --- STYLED COMPONENTS ---

// Container utama untuk Server Row
const RowContainer = styled(Link)`
    ${tw`block w-full mb-4 rounded-xl transition-all duration-300 relative overflow-hidden`}
    ${tw`bg-gray-800/40 border border-white/5`}
    text-decoration: none;

    &:hover {
        ${tw`bg-gray-800/70 border-blue-500/30 shadow-lg`}
        transform: translateY(-2px);
    }
`;

// Wrapper untuk konten agar layout rapi (Grid System)
const ContentGrid = styled.div`
    ${tw`grid grid-cols-12 gap-4 p-4 items-center`}
`;

// Bagian Icon Server (Kiri)
const IconBox = styled.div<{ $status: ServerPowerState | undefined }>`
    ${tw`flex items-center justify-center w-12 h-12 rounded-lg bg-gray-900/50 text-xl shadow-inner transition-colors duration-300`}
    
    color: ${({ $status }) => {
        switch ($status) {
            case 'running': return '#10b981'; // Emerald 500
            case 'offline': return '#ef4444'; // Red 500
            case 'starting': return '#f59e0b'; // Amber 500
            default: return '#6b7280'; // Gray 500
        }
    }};
`;

// Indikator Status (Dot Bercahaya)
const StatusDot = styled.div<{ $status: ServerPowerState | undefined }>`
    ${tw`w-2.5 h-2.5 rounded-full mr-2 shadow-sm`}
    
    background-color: ${({ $status }) => {
        switch ($status) {
            case 'running': return '#10b981';
            case 'offline': return '#ef4444';
            case 'starting': return '#f59e0b';
            default: return '#6b7280';
        }
    }};

    box-shadow: 0 0 10px ${({ $status }) => {
        switch ($status) {
            case 'running': return 'rgba(16, 185, 129, 0.4)';
            case 'offline': return 'rgba(239, 68, 68, 0.4)';
            case 'starting': return 'rgba(245, 158, 11, 0.4)';
            default: return 'transparent';
        }
    }};
`;

// Badge untuk IP Address
const IpBadge = styled.div`
    ${tw`inline-flex items-center px-2 py-1 rounded bg-black/20 text-xs font-mono text-gray-300 border border-white/5 mt-1`}
`;

// Style untuk Ikon Resource agar berwarna
const ResourceIcon = styled(FontAwesomeIcon)<{ $type: 'cpu' | 'mem' | 'disk'; $alarm: boolean }>`
    ${tw`mr-2 text-sm`}
    ${props => props.$alarm && tw`text-red-500 animate-pulse`}
    
    color: ${({ $type, $alarm }) => {
        if ($alarm) return undefined; // Biarkan class text-red-500 menangani
        switch ($type) {
            case 'cpu': return '#3b82f6'; // Blue
            case 'mem': return '#a855f7'; // Purple
            case 'disk': return '#f97316'; // Orange
            default: return 'currentColor';
        }
    }};
`;

const StatLabel = styled.span`
    ${tw`text-xs text-gray-500 uppercase font-bold tracking-wider ml-1`}
`;

// --- LOGIC SECTION ---

const isAlarmState = (current: number, limit: number): boolean => limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

type Timer = ReturnType<typeof setInterval>;

export default memo(({ server, className }: { server: Server; className?: string }) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats] = useState<ServerStats | null>(null);

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then((data) => setStats(data))
            .catch((error) => console.error(error));

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    useEffect(() => {
        if (isSuspended) return;

        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });

        return () => {
            interval.current && clearInterval(interval.current);
        };
    }, [isSuspended]);

    const alarms = { cpu: false, memory: false, disk: false };
    if (stats) {
        alarms.cpu = server.limits.cpu === 0 ? false : stats.cpuUsagePercent >= server.limits.cpu * 0.9;
        alarms.memory = isAlarmState(stats.memoryUsageInBytes, server.limits.memory);
        alarms.disk = server.limits.disk === 0 ? false : isAlarmState(stats.diskUsageInBytes, server.limits.disk);
    }

    const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : 'Unlimited';
    const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : 'Unlimited';
    const cpuLimit = server.limits.cpu !== 0 ? server.limits.cpu + ' %' : 'Unlimited';

    return (
        <RowContainer to={`/server/${server.id}`} className={className}>
            <ContentGrid>
                {/* Bagian Nama Server & IP */}
                <div css={tw`col-span-12 sm:col-span-5 lg:col-span-5 flex items-center`}>
                    <IconBox $status={server.isTransferring ? 'starting' : stats?.status}>
                        <FontAwesomeIcon icon={faServer} />
                    </IconBox>
                    <div css={tw`ml-4`}>
                        <div css={tw`flex items-center mb-0.5`}>
                            <StatusDot $status={server.isTransferring ? 'starting' : stats?.status} />
                            <p css={tw`text-lg font-bold text-gray-100 tracking-tight leading-none`}>{server.name}</p>
                        </div>
                        
                        {/* Allocation Display */}
                        <IpBadge>
                            <FontAwesomeIcon icon={faNetworkWired} css={tw`mr-1.5 opacity-50`} />
                            {server.allocations
                                .filter((alloc) => alloc.isDefault)
                                .map((allocation) => (
                                    <span key={allocation.ip + allocation.port.toString()}>
                                        {allocation.alias || ip(allocation.ip)}:{allocation.port}
                                    </span>
                                ))}
                        </IpBadge>
                    </div>
                </div>

                {/* Bagian Status / Statistik */}
                <div css={tw`col-span-12 sm:col-span-7 lg:col-span-7`}>
                    {!stats || isSuspended ? (
                        <div css={tw`flex justify-end items-center h-full`}>
                            {isSuspended ? (
                                <span css={tw`bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide`}>
                                    {server.status === 'suspended' ? 'Suspended' : 'Connection Error'}
                                </span>
                            ) : server.isTransferring || server.status ? (
                                <span css={tw`bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide flex items-center`}>
                                    <Spinner size={'small'} css={tw`mr-2`} />
                                    {server.isTransferring
                                        ? 'Transferring'
                                        : server.status === 'installing'
                                        ? 'Installing'
                                        : server.status === 'restoring_backup'
                                        ? 'Restoring'
                                        : 'Unavailable'}
                                </span>
                            ) : (
                                <div css={tw`opacity-50`}>
                                    <Spinner size={'small'} />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div css={tw`grid grid-cols-3 gap-4`}>
                            {/* CPU */}
                            <div css={tw`flex flex-col items-center sm:items-start bg-gray-900/30 rounded p-2 border border-white/5`}>
                                <div css={tw`flex items-center text-gray-200 font-mono text-sm`}>
                                    <ResourceIcon icon={faMicrochip} $type="cpu" $alarm={alarms.cpu} />
                                    {stats.cpuUsagePercent.toFixed(1)}%
                                </div>
                                <StatLabel>CPU Load</StatLabel>
                            </div>

                            {/* RAM */}
                            <div css={tw`flex flex-col items-center sm:items-start bg-gray-900/30 rounded p-2 border border-white/5`}>
                                <div css={tw`flex items-center text-gray-200 font-mono text-sm`}>
                                    <ResourceIcon icon={faMemory} $type="mem" $alarm={alarms.memory} />
                                    {bytesToString(stats.memoryUsageInBytes)}
                                </div>
                                <StatLabel>Memory</StatLabel>
                            </div>

                            {/* DISK */}
                            <div css={tw`flex flex-col items-center sm:items-start bg-gray-900/30 rounded p-2 border border-white/5`}>
                                <div css={tw`flex items-center text-gray-200 font-mono text-sm`}>
                                    <ResourceIcon icon={faHdd} $type="disk" $alarm={alarms.disk} />
                                    {bytesToString(stats.diskUsageInBytes)}
                                </div>
                                <StatLabel>Disk</StatLabel>
                            </div>
                        </div>
                    )}
                </div>
            </ContentGrid>
        </RowContainer>
    );
}, isEqual);    