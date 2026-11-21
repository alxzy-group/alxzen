import React, { useEffect, useState } from 'react';
import getServerDatabases from '@/api/server/databases/getServerDatabases';
import { ServerContext } from '@/state/server';
import { httpErrorToHuman } from '@/api/http';
import FlashMessageRender from '@/components/FlashMessageRender';
import DatabaseRow from '@/components/server/databases/DatabaseRow';
import Spinner from '@/components/elements/Spinner';
import CreateDatabaseButton from '@/components/server/databases/CreateDatabaseButton';
import Can from '@/components/elements/Can';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import Fade from '@/components/elements/Fade';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { useDeepMemoize } from '@/plugins/useDeepMemoize';
import PageHeader from '@/components/elements/PageHeader';
import EmptyState from '@/components/elements/EmptyState';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const databaseLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.databases);

    const { addError, clearFlashes } = useFlash();
    const [loading, setLoading] = useState(true);

    const databases = useDeepMemoize(ServerContext.useStoreState((state) => state.databases.data));
    const setDatabases = ServerContext.useStoreActions((state) => state.databases.setDatabases);

    useEffect(() => {
        setLoading(!databases.length);
        clearFlashes('databases');

        getServerDatabases(uuid)
            .then((databases) => setDatabases(databases))
            .catch((error) => {
                console.error(error);
                addError({ key: 'databases', message: httpErrorToHuman(error) });
            })
            .then(() => setLoading(false));
    }, []);

    return (
        <ServerContentBlock title={'Databases'}>
            <PageHeader
                icon={faDatabase}
                title={'Databases'}
                description={'Manage MySQL databases allocated to this server.'}
                badge={databaseLimit > 0 ? `${databases.length} / ${databaseLimit} Used` : undefined}
                actions={
                    databaseLimit > 0 && databaseLimit !== databases.length ? (
                        <Can action={'database.create'}>
                            <CreateDatabaseButton />
                        </Can>
                    ) : undefined
                }
            />
            <FlashMessageRender byKey={'databases'} css={tw`mb-4`} />
            {!databases.length && loading ? (
                <Spinner size={'large'} centered />
            ) : (
                <Fade timeout={150}>
                    <>
                        {databases.length > 0 ? (
                            <div css={tw`flex flex-col gap-2`}>
                                {databases.map((database) => (
                                    <DatabaseRow key={database.id} database={database} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={faDatabase}
                                title={databaseLimit > 0 ? 'No Databases Created' : 'Databases Disabled'}
                                description={
                                    databaseLimit > 0
                                        ? 'You have not created any MySQL databases for this server yet.'
                                        : 'Databases cannot be created because the database limit for this server is set to 0.'
                                }
                            />
                        )}
                    </>
                </Fade>
            )}
        </ServerContentBlock>
    );
};
