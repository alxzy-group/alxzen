import React, { memo, useState, useEffect } from 'react';
import { ServerContext } from '@/state/server';
import Can from '@/components/elements/Can';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import isEqual from 'react-fast-compare';
import Spinner from '@/components/elements/Spinner';
import Features from '@feature/Features';
import Console from '@/components/server/console/Console';
import StatGraphs from '@/components/server/console/StatGraphs';
import PowerButtons from '@/components/server/console/PowerButtons';
import ServerDetailsBlock from '@/components/server/console/ServerDetailsBlock';
import { Alert } from '@/components/elements/alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faNetworkWired, faCopy, faCheck, faClock } from '@fortawesome/free-solid-svg-icons';
import { ip } from '@/lib/formatters';
import copy from 'copy-to-clipboard';
import tw, { styled } from 'twin.macro';

export type PowerAction = 'start' | 'stop' | 'restart' | 'kill';

const HeaderCard = styled.div<{ $status: string | null }>`
    ${tw`w-full rounded-2xl p-4 sm:p-5 mb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4`}
    background: hsl(var(--bg-card));
    border: 1px solid hsl(var(--border) / 0.85);
    border-left: 3.5px solid ${({ $status }) =>
        $status === 'running'  ? '#10b981' :
        $status === 'starting' ? '#0ea5e9' :
        $status === 'stopping' ? '#f59e0b' :
        'hsl(var(--text-muted) / 0.35)'};
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.04);
`;

const ServerIconBox = styled.div<{ $status: string | null }>`
    ${tw`w-11 h-11 flex items-center justify-center rounded-xl text-base flex-shrink-0`}
    color: ${({ $status }) =>
        $status === 'running'  ? '#34d399' :
        $status === 'starting' ? '#38bdf8' :
        $status === 'stopping' ? '#fbbf24' :
        'hsl(var(--text-muted))'};
    background: ${({ $status }) =>
        $status === 'running'  ? 'rgba(16, 185, 129, 0.12)' :
        $status === 'starting' ? 'rgba(14, 165, 233, 0.12)' :
        $status === 'stopping' ? 'rgba(245, 158, 11, 0.12)' :
        'hsl(var(--bg-surface) / 0.8)'};
    border: 1px solid ${({ $status }) =>
        $status === 'running'  ? 'rgba(16, 185, 129, 0.28)' :
        $status === 'starting' ? 'rgba(14, 165, 233, 0.28)' :
        $status === 'stopping' ? 'rgba(245, 158, 11, 0.28)' :
        'hsl(var(--border) / 0.7)'};
`;

const StatusPill = styled.span<{ $status: string | null }>`
    ${tw`inline-flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0`}
    background: ${({ $status }) =>
        $status === 'running'  ? 'rgba(16, 185, 129, 0.12)' :
        $status === 'starting' ? 'rgba(14, 165, 233, 0.12)' :
        $status === 'stopping' ? 'rgba(245, 158, 11, 0.12)' :
        'hsl(var(--bg-surface) / 0.85)'};
    color: ${({ $status }) =>
        $status === 'running'  ? '#34d399' :
        $status === 'starting' ? '#38bdf8' :
        $status === 'stopping' ? '#fbbf24' :
        'hsl(var(--text-muted))'};
    border: 1px solid ${({ $status }) =>
        $status === 'running'  ? 'rgba(16, 185, 129, 0.3)' :
        $status === 'starting' ? 'rgba(14, 165, 233, 0.3)' :
        $status === 'stopping' ? 'rgba(245, 158, 11, 0.3)' :
        'hsl(var(--border) / 0.7)'};

    .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        box-shadow: 0 0 6px currentColor;
    }
`;

const MetaBadge = styled.button`
    ${tw`inline-flex items-center gap-1.5 text-xs font-mono cursor-pointer transition-all duration-150 outline-none`}
    color: hsl(var(--text-secondary));
    background: hsl(var(--bg-surface) / 0.8);
    border: 1px solid hsl(var(--border) / 0.8);
    border-radius: 8px;
    padding: 3px 10px;

    &:hover {
        color: #38bdf8;
        border-color: rgba(14, 165, 233, 0.45);
        background: rgba(14, 165, 233, 0.08);
    }
`;

const ServerConsoleContainer = () => {
    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const description = ServerContext.useStoreState((state) => state.server.data!.description);
    const isInstalling = ServerContext.useStoreState((state) => state.server.isInstalling);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    const eggFeatures = ServerContext.useStoreState((state) => state.server.data!.eggFeatures, isEqual);
    const isNodeUnderMaintenance = ServerContext.useStoreState((state) => state.server.data!.isNodeUnderMaintenance);
    const expiresAt = ServerContext.useStoreState((state) => state.server.data!.expiresAt);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const allocation = ServerContext.useStoreState((state) => {
        const match = state.server.data!.allocations.find((a) => a.isDefault);
        return !match ? 'n/a' : `${match.alias || ip(match.ip)}:${match.port}`;
    });

    const [hasNotified, setHasNotified] = useState(false);
    const [copiedIp, setCopiedIp] = useState(false);

    useEffect(() => {
        if (!expiresAt || hasNotified) return;

        const expirationDate = new Date(expiresAt);
        const hoursLeft = (expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60);
        if (hoursLeft > 0 && hoursLeft <= 12) {
            if (Notification.permission === 'granted') {
                new Notification(`Server Expiring Soon`, {
                    body: `Your server "${name}" akan kedaluwarsa dalam kurang dari 12 jam. Segera perpanjang!`,
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then((permission) => {
                    if (permission === 'granted') {
                        new Notification(`Server Expiring Soon`, {
                            body: `Your server "${name}" akan kedaluwarsa dalam kurang dari 12 jam. Segera perpanjang!`,
                        });
                    }
                });
            }
            setHasNotified(true);
        }
    }, [expiresAt, hasNotified, name]);

    const expirationDate = expiresAt ? new Date(expiresAt) : null;
    const isExpired = expirationDate ? expirationDate.getTime() <= new Date().getTime() : false;
    const hoursLeft = expirationDate ? (expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60) : null;
    const isExpiringSoon = hoursLeft !== null && hoursLeft > 0 && hoursLeft <= 12;

    const getRemainingTimeText = (date: Date) => {
        const diffMs = date.getTime() - new Date().getTime();
        if (isNaN(diffMs)) return 'beberapa saat';
        const totalMinutes = Math.floor(diffMs / 1000 / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        if (hours > 0 && minutes > 0) return `${hours} jam ${minutes} menit`;
        if (hours > 0) return `${hours} jam`;
        if (minutes > 0) return `${minutes} menit`;
        return 'kurang dari semenit';
    };

    const handleCopyAllocation = () => {
        copy(allocation);
        setCopiedIp(true);
        setTimeout(() => setCopiedIp(false), 1800);
    };

    return (
        <ServerContentBlock title={'Console'}>
            {(isNodeUnderMaintenance || isInstalling || isTransferring) && (
                <Alert type={'warning'} className={'mb-4'}>
                    {isNodeUnderMaintenance
                        ? 'The node of this server is currently under maintenance and all actions are unavailable.'
                        : isInstalling
                        ? 'This server is currently running its installation process and most actions are unavailable.'
                        : 'This server is currently being transferred to another node and all actions are unavailable.'}
                </Alert>
            )}
            {isExpiringSoon && (
                <Alert type={'danger'} className={'mb-4'}>
                    <span className="flex-1">
                        Peringatan: Server Anda akan kedaluwarsa dalam <strong>{getRemainingTimeText(expirationDate!)}</strong>. Harap segera perpanjang layanan untuk menghindari suspensi.
                    </span>
                </Alert>
            )}
            {isExpired && (
                <Alert type={'danger'} className={'mb-4'}>
                    <span className="flex-1">Peringatan: Masa aktif server ini telah habis.</span>
                </Alert>
            )}

            {/* Unified Responsive Console Hero Header matching ServerRow design */}
            <HeaderCard $status={status}>
                <div css={tw`flex items-start sm:items-center gap-3.5 min-w-0 flex-1`}>
                    <ServerIconBox $status={status}>
                        <FontAwesomeIcon icon={faServer} />
                    </ServerIconBox>
                    <div css={tw`min-w-0 flex-1`}>
                        <div css={tw`flex flex-wrap items-center gap-2.5`}>
                            <h1
                                css={tw`text-xl sm:text-2xl font-extrabold tracking-tight m-0 truncate`}
                                style={{ color: 'hsl(var(--text-primary))' }}
                            >
                                {name}
                            </h1>
                            <StatusPill $status={status}>
                                <span className="dot" />
                                {status === 'running' ? 'Online' : status === 'starting' ? 'Starting' : status === 'stopping' ? 'Stopping' : 'Offline'}
                            </StatusPill>
                        </div>
                        {description && (
                            <p css={tw`text-xs sm:text-sm font-medium mt-1 mb-0 line-clamp-1`} style={{ color: 'hsl(var(--text-muted))' }}>
                                {description}
                            </p>
                        )}
                        <div css={tw`flex flex-wrap items-center gap-2 mt-2`}>
                            <MetaBadge type="button" onClick={handleCopyAllocation} title="Klik untuk salin IP:Port">
                                <FontAwesomeIcon icon={copiedIp ? faCheck : faNetworkWired} style={{ fontSize: 10, color: copiedIp ? '#34d399' : '#38bdf8' }} />
                                <span>{allocation}</span>
                                <FontAwesomeIcon icon={faCopy} style={{ fontSize: 10, opacity: 0.6 }} />
                            </MetaBadge>
                            {expirationDate && (
                                <MetaBadge as="div" style={{ cursor: 'default' }}>
                                    <FontAwesomeIcon icon={faClock} style={{ fontSize: 10, color: isExpired ? '#f87171' : '#38bdf8' }} />
                                    <span>
                                        {isExpired ? 'Expired' : `Active until ${expirationDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                                    </span>
                                </MetaBadge>
                            )}
                        </div>
                    </div>
                </div>

                <div css={tw`w-full lg:w-auto flex-shrink-0`}>
                    <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                        <PowerButtons className={'flex w-full lg:w-auto items-center gap-2 sm:gap-2.5'} />
                    </Can>
                </div>
            </HeaderCard>

            {/* Uniform Telemetry Grid */}
            <div className={'mb-4'}>
                <ServerDetailsBlock />
            </div>

            {/* Console Terminal */}
            <div className={'mb-4'}>
                <Spinner.Suspense>
                    <Console />
                </Spinner.Suspense>
            </div>

            {/* Real-Time Resource Charts */}
            <div className={'grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4'}>
                <Spinner.Suspense>
                    <StatGraphs />
                </Spinner.Suspense>
            </div>
            <Features enabled={eggFeatures} />
        </ServerContentBlock>
    );
};

export default memo(ServerConsoleContainer, isEqual);
