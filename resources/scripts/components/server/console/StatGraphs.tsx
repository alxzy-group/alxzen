import React, { useEffect, useRef } from 'react';
import { ServerContext } from '@/state/server';
import { SocketEvent } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { Line } from 'react-chartjs-2';
import { useChart, useChartTickLabel } from '@/components/server/console/chart';
import { bytesToString } from '@/lib/formatters';
import ChartBlock from '@/components/server/console/ChartBlock';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import styled, { keyframes } from 'styled-components';

const pulseAnim = keyframes`
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.25); }
`;

const NetBadgeContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const NetBadge = styled.div<{ $color: 'in' | 'out' }>`
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 10.5px;
    font-weight: 700;
    background: ${(p) => (p.$color === 'in' ? 'rgba(14, 165, 233, 0.12)' : 'rgba(16, 185, 129, 0.12)')};
    border: 1px solid ${(p) => (p.$color === 'in' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(52, 211, 153, 0.3)')};
    color: ${(p) => (p.$color === 'in' ? '#38bdf8' : '#34d399')};
    transition: all 0.2s ease;
`;

const PulseDot = styled.span<{ $active?: boolean; $color: 'in' | 'out' }>`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${(p) => (p.$color === 'in' ? '#38bdf8' : '#34d399')};
    display: inline-block;
    animation: ${(p) => (p.$active ? pulseAnim : 'none')} 1.4s ease-in-out infinite;
`;

export default () => {
    const status = ServerContext.useStoreState((state) => state.status.value);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const previous = useRef<Record<'tx' | 'rx', number>>({ tx: -1, rx: -1 });

    const cpu = useChartTickLabel('CPU', limits.cpu, '%', 2);
    const memory = useChartTickLabel('Memory', limits.memory, 'MiB');
    const network = useChart('Network', {
        sets: 2,
        options: {
            scales: {
                y: {
                    ticks: {
                        callback(value) {
                            return bytesToString(typeof value === 'string' ? parseInt(value, 10) : value) + '/s';
                        },
                    },
                },
            },
        },
        callback(opts, index) {
            return {
                ...opts,
                label: !index ? 'Inbound' : 'Outbound',
                borderColor: !index ? '#38bdf8' : '#10b981',
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
                    gradient.addColorStop(0, !index ? 'rgba(56, 189, 248, 0.28)' : 'rgba(16, 185, 129, 0.28)');
                    gradient.addColorStop(1, !index ? 'rgba(56, 189, 248, 0.0)' : 'rgba(16, 185, 129, 0.0)');
                    return gradient;
                },
                borderWidth: 2,
                tension: 0.35,
                fill: true,
            };
        },
    });

    useEffect(() => {
        if (status === 'offline') {
            cpu.clear();
            memory.clear();
            network.clear();
        }
    }, [status]);

    useWebsocketEvent(SocketEvent.STATS, (data: string) => {
        let values: any = {};
        try {
            values = JSON.parse(data);
        } catch (e) {
            return;
        }
        cpu.push(values.cpu_absolute);
        memory.push(Math.floor(values.memory_bytes / 1024 / 1024));

        const rxRate = previous.current.rx < 0 ? 0 : Math.max(0, values.network.rx_bytes - previous.current.rx);
        const txRate = previous.current.tx < 0 ? 0 : Math.max(0, values.network.tx_bytes - previous.current.tx);

        network.push([rxRate, txRate]);
        previous.current = { tx: values.network.tx_bytes, rx: values.network.rx_bytes };
    });

    const isOnline = status === 'running' || status === 'starting';

    return (
        <>
            <ChartBlock title={'CPU Load'}>
                <Line {...cpu.props} />
            </ChartBlock>
            <ChartBlock title={'Memory'}>
                <Line {...memory.props} />
            </ChartBlock>
            <ChartBlock
                title={'Network I/O'}
                legend={
                    <NetBadgeContainer>
                        <Tooltip arrow content={'Inbound (Download)'}>
                            <NetBadge $color={'in'}>
                                <PulseDot $color={'in'} $active={isOnline} />
                                ↓ IN
                            </NetBadge>
                        </Tooltip>
                        <Tooltip arrow content={'Outbound (Upload)'}>
                            <NetBadge $color={'out'}>
                                <PulseDot $color={'out'} $active={isOnline} />
                                ↑ OUT
                            </NetBadge>
                        </Tooltip>
                    </NetBadgeContainer>
                }
            >
                <Line {...network.props} />
            </ChartBlock>
        </>
    );
};
