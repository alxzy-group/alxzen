import React, { useContext, useEffect, useState } from 'react';
import Spinner from '@/components/elements/Spinner';
import useFlash from '@/plugins/useFlash';
import Can from '@/components/elements/Can';
import CreateBackupButton from '@/components/server/backups/CreateBackupButton';
import FlashMessageRender from '@/components/FlashMessageRender';
import BackupRow from '@/components/server/backups/BackupRow';
import tw from 'twin.macro';
import getServerBackups, { Context as ServerBackupContext } from '@/api/swr/getServerBackups';
import { ServerContext } from '@/state/server';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Pagination from '@/components/elements/Pagination';
import PageHeader from '@/components/elements/PageHeader';
import EmptyState from '@/components/elements/EmptyState';
import { faArchive } from '@fortawesome/free-solid-svg-icons';

const BackupContainer = () => {
    const { page, setPage } = useContext(ServerBackupContext);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { data: backups, error, isValidating } = getServerBackups();

    const backupLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.backups);

    useEffect(() => {
        if (!error) {
            clearFlashes('backups');

            return;
        }

        clearAndAddHttpError({ error, key: 'backups' });
    }, [error]);

    if (!backups || (error && isValidating)) {
        return <Spinner size={'large'} centered />;
    }

    return (
        <ServerContentBlock title={'Backups'}>
            <PageHeader
                icon={faArchive}
                title={'Backups'}
                description={'Create, download, lock, and restore container snapshots.'}
                badge={backupLimit > 0 ? `${backups.backupCount} / ${backupLimit} Used` : undefined}
                actions={
                    backupLimit > 0 && backupLimit > backups.backupCount ? (
                        <Can action={'backup.create'}>
                            <CreateBackupButton />
                        </Can>
                    ) : undefined
                }
            />
            <FlashMessageRender byKey={'backups'} css={tw`mb-4`} />
            {backupLimit === 0 ? (
                <EmptyState
                    icon={faArchive}
                    title={'Backups Disabled'}
                    description={'Backups cannot be created for this server because the backup limit is set to 0.'}
                />
            ) : (
                <Pagination data={backups} onPageSelect={setPage}>
                    {({ items }) =>
                        !items.length ? (
                            <EmptyState
                                icon={faArchive}
                                title={page > 1 ? 'No More Backups' : 'No Backups Created'}
                                description={
                                    page > 1
                                        ? "Looks like we've run out of backups to show you, try going back a page."
                                        : 'Create a container snapshot to safeguard your data before making major changes.'
                                }
                            />
                        ) : (
                            <div css={tw`flex flex-col gap-2`}>
                                {items.map((backup) => (
                                    <BackupRow key={backup.uuid} backup={backup} />
                                ))}
                            </div>
                        )
                    }
                </Pagination>
            )}
        </ServerContentBlock>
    );
};

export default () => {
    const [page, setPage] = useState<number>(1);
    return (
        <ServerBackupContext.Provider value={{ page, setPage }}>
            <BackupContainer />
        </ServerBackupContext.Provider>
    );
};
