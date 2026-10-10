import React, { memo } from 'react';
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
import { useState, useEffect } from 'react';

export type PowerAction = 'start' | 'stop' | 'restart' | 'kill';

const ServerConsoleContainer = () => {
    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const description = ServerContext.useStoreState((state) => state.server.data!.description);
    const isInstalling = ServerContext.useStoreState((state) => state.server.isInstalling);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    const eggFeatures = ServerContext.useStoreState((state) => state.server.data!.eggFeatures, isEqual);
    const isNodeUnderMaintenance = ServerContext.useStoreState((state) => state.server.data!.isNodeUnderMaintenance);
    const expiresAt = ServerContext.useStoreState((state) => state.server.data!.expiresAt);

    const [hasNotified, setHasNotified] = useState(false);

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
            <div className={'grid grid-cols-4 gap-4 mb-4'}>
                <div className={'hidden sm:block sm:col-span-2 lg:col-span-3 pr-4'}>
                    <h1 className={'text-4xl font-black text-white tracking-tighter mb-1 line-clamp-1'}>
                        {name}
                    </h1>
                    <p className={'text-sm font-medium text-gray-400 line-clamp-2'}>{description}</p>
                </div>
                <div className={'col-span-4 sm:col-span-2 lg:col-span-1 self-end'}>
                    <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                        <PowerButtons className={'flex sm:justify-end space-x-2'} />
                    </Can>
                </div>
            </div>
            <div className={'mb-4 flex items-center justify-end'}>
                <ServerDetailsBlock className={'flex flex-wrap gap-2 sm:gap-4'} />
            </div>

            {/* Console */}
            <div className={'mb-4'}>
                <Spinner.Suspense>
                    <Console />
                </Spinner.Suspense>
            </div>
            
            {/* Horizontal Graphs */}
            <div className={'grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 mb-4'}>
                <Spinner.Suspense>
                    <StatGraphs />
                </Spinner.Suspense>
            </div>
            <Features enabled={eggFeatures} />
        </ServerContentBlock>
    );
};

export default memo(ServerConsoleContainer, isEqual);
