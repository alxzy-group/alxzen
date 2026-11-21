import React, { useEffect, useMemo, useState } from 'react';
import {
    faClock,
    faCloudDownloadAlt,
    faCloudUploadAlt,
    faHdd,
    faMemory,
    faMicrochip,
    faWifi,
} from '@fortawesome/free-solid-svg-icons';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import { ServerContext } from '@/state/server';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import UptimeDuration from '@/components/server/UptimeDuration';
import StatBlock from '@/components/server/console/StatBlock';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import classNames from 'classnames';
import { capitalize } from '@/lib/strings';

type Stats = Record<'memory' | 'cpu' | 'disk' | 'uptime' | 'rx' | 'tx', number>;

const getBackgroundColor = (value: number, max: number | null): string | undefined => {
    const delta = !max ? 0 : value / max;

    if (delta > 0.8) {
        if (delta > 0.9) {
            return 'bg-red-500';
        }
        return 'bg-yellow-500';
    }

    return undefined;
};

const Limit = ({ limit, children }: { limit: string | null; children: React.ReactNode }) => (
    <>
        {children}
        <span className={'ml-1 text-gray-400 text-[75%] font-normal select-none'}>/ {limit || <>&infin;</>}</span>
    </>
);

const ServerDetailsBlock = ({ className }: { className?: string }) => {
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, disk: 0, uptime: 0, tx: 0, rx: 0 });

    const status = ServerContext.useStoreState((state) => state.status.value);
    const connected = ServerContext.useStoreState((state) => state.socket.connected);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);

    const textLimits = useMemo(
        () => ({
            cpu: limits?.cpu ? `${limits.cpu}%` : null,
            memory: limits?.memory ? bytesToString(mbToBytes(limits.memory)) : null,
            disk: limits?.disk ? bytesToString(mbToBytes(limits.disk)) : null,
        }),
        [limits]
    );

    const allocation = ServerContext.useStoreState((state) => {
        const match = state.server.data!.allocations.find((allocation) => allocation.isDefault);

        return !match ? 'n/a' : `${match.alias || ip(match.ip)}:${match.port}`;
    });

    useEffect(() => {
        if (!connected || !instance) {
            return;
        }

        instance.send(SocketRequest.SEND_STATS);
    }, [instance, connected]);

    useWebsocketEvent(SocketEvent.STATS, (data) => {
        let stats: any = {};
        try {
            stats = JSON.parse(data);
        } catch (e) {
            return;
        }

        setStats({
            memory: stats.memory_bytes,
            cpu: stats.cpu_absolute,
            disk: stats.disk_bytes,
            tx: stats.network.tx_bytes,
            rx: stats.network.rx_bytes,
            uptime: stats.uptime || 0,
        });
    });

    const cpuPct = limits.cpu > 0 ? Math.min(100, (stats.cpu / limits.cpu) * 100) : Math.min(100, stats.cpu);
    const memPct = limits.memory > 0 ? Math.min(100, (stats.memory / mbToBytes(limits.memory)) * 100) : 0;
    const diskPct = limits.disk > 0 ? Math.min(100, (stats.disk / mbToBytes(limits.disk)) * 100) : 0;
    const barColor = (pct: number) => (pct > 85 ? '#ef4444' : pct > 65 ? '#f59e0b' : '#0ea5e9');

    return (
        <div className={classNames('w-full h-full grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-2.5 sm:gap-3 content-between', className)}>
            <StatBlock
                icon={faClock}
                title={'Instance Uptime'}
                color={getBackgroundColor(status === 'running' ? 0 : status !== 'offline' ? 9 : 10, 10)}
            >
                {status === null || status === 'offline' ? (
                    <span className={'text-gray-400'}>Offline</span>
                ) : stats.uptime > 0 ? (
                    <UptimeDuration uptime={stats.uptime / 1000} />
                ) : (
                    capitalize(status)
                )}
            </StatBlock>
            <StatBlock icon={faMicrochip} title={'CPU Load'} color={getBackgroundColor(stats.cpu, limits.cpu)}>
                <div>
                    {status === 'offline' ? (
                        <span className={'text-gray-400'}>0.0%</span>
                    ) : (
                        <Limit limit={textLimits.cpu}>{stats.cpu.toFixed(1)}%</Limit>
                    )}
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1.5">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${status === 'offline' ? 0 : cpuPct}%`, backgroundColor: barColor(cpuPct) }}
                        />
                    </div>
                </div>
            </StatBlock>
            <StatBlock
                icon={faMemory}
                title={'Memory Usage'}
                color={getBackgroundColor(stats.memory / 1024, limits.memory * 1024)}
            >
                <div>
                    {status === 'offline' ? (
                        <span className={'text-gray-400'}>0 B</span>
                    ) : (
                        <Limit limit={textLimits.memory}>{bytesToString(stats.memory)}</Limit>
                    )}
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1.5">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${status === 'offline' ? 0 : memPct}%`, backgroundColor: barColor(memPct) }}
                        />
                    </div>
                </div>
            </StatBlock>
            <StatBlock icon={faHdd} title={'Disk Storage'} color={getBackgroundColor(stats.disk / 1024, limits.disk * 1024)}>
                <div>
                    <Limit limit={textLimits.disk}>{bytesToString(stats.disk)}</Limit>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1.5">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${diskPct}%`, backgroundColor: barColor(diskPct) }}
                        />
                    </div>
                </div>
            </StatBlock>
            <StatBlock icon={faCloudDownloadAlt} title={'Inbound ↓'}>
                {status === 'offline' ? (
                    <span className={'text-gray-400'}>0 B</span>
                ) : (
                    <span style={{ color: '#38bdf8' }}>{bytesToString(stats.rx)}</span>
                )}
            </StatBlock>
            <StatBlock icon={faCloudUploadAlt} title={'Outbound ↑'}>
                {status === 'offline' ? (
                    <span className={'text-gray-400'}>0 B</span>
                ) : (
                    <span style={{ color: '#34d399' }}>{bytesToString(stats.tx)}</span>
                )}
            </StatBlock>
        </div>
    );
};

export default ServerDetailsBlock;
