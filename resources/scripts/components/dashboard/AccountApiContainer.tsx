import React, { useEffect, useState } from 'react';
import ContentBox from '@/components/elements/ContentBox';
import CreateApiKeyForm from '@/components/dashboard/forms/CreateApiKeyForm';
import getApiKeys, { ApiKey } from '@/api/account/getApiKeys';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import deleteApiKey from '@/api/account/deleteApiKey';
import FlashMessageRender from '@/components/FlashMessageRender';
import { format } from 'date-fns';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { Dialog } from '@/components/elements/dialog';
import { useFlashKey } from '@/plugins/useFlash';
import Code from '@/components/elements/Code';
import PageHeader from '@/components/elements/PageHeader';
import EmptyState from '@/components/elements/EmptyState';

export default () => {
    const [deleteIdentifier, setDeleteIdentifier] = useState('');
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const { clearAndAddHttpError } = useFlashKey('account');

    useEffect(() => {
        getApiKeys()
            .then((keys) => setKeys(keys))
            .then(() => setLoading(false))
            .catch((error) => clearAndAddHttpError(error));
    }, []);

    const doDeletion = (identifier: string) => {
        setLoading(true);

        clearAndAddHttpError();
        deleteApiKey(identifier)
            .then(() => setKeys((s) => [...(s || []).filter((key) => key.identifier !== identifier)]))
            .catch((error) => clearAndAddHttpError(error))
            .then(() => {
                setLoading(false);
                setDeleteIdentifier('');
            });
    };

    return (
        <PageContentBlock title={'Account API'}>
            <PageHeader
                icon={faKey}
                title={'API Credentials'}
                description={'Generate and revoke personal Client API keys for external integrations.'}
                badge={`${keys.length} Keys`}
            />
            <FlashMessageRender byKey={'account'} css={tw`mb-4`} />
            <div css={tw`grid grid-cols-1 md:grid-cols-12 gap-6 items-start`}>
                <ContentBox title={'Create API Key'} css={tw`md:col-span-5`}>
                    <CreateApiKeyForm onKeyCreated={(key) => setKeys((s) => [...s!, key])} />
                </ContentBox>
                <ContentBox title={'API Keys'} css={tw`md:col-span-7 overflow-hidden`}>
                    <SpinnerOverlay visible={loading} />
                    <Dialog.Confirm
                        title={'Delete API Key'}
                        confirm={'Delete Key'}
                        open={!!deleteIdentifier}
                        onClose={() => setDeleteIdentifier('')}
                        onConfirmed={() => doDeletion(deleteIdentifier)}
                    >
                        All requests using the <Code>{deleteIdentifier}</Code> key will be invalidated.
                    </Dialog.Confirm>
                    {keys.length === 0 ? (
                        <EmptyState
                            icon={faKey}
                            title={loading ? 'Loading Credentials...' : 'No API Keys Created'}
                            description={
                                loading
                                    ? 'Fetching your active personal API credentials.'
                                    : 'No client API keys exist for this account yet.'
                            }
                        />
                    ) : (
                        <div css={tw`flex flex-col gap-2`}>
                            {keys.map((key) => (
                                <GreyRowBox key={key.identifier} css={tw`flex items-center mb-0`}>
                                    <div
                                        css={tw`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}
                                        style={{
                                            background: 'rgba(14, 165, 233, 0.1)',
                                            border: '1px solid rgba(56, 189, 248, 0.25)',
                                            color: '#38bdf8',
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faKey} style={{ fontSize: 12 }} />
                                    </div>
                                    <div css={tw`ml-3.5 flex-1 overflow-hidden`}>
                                        <p css={tw`text-sm break-words font-semibold m-0`} style={{ color: 'hsl(var(--text-primary))' }}>
                                            {key.description}
                                        </p>
                                        <p css={tw`text-[11px] uppercase tracking-wide mt-0.5 m-0`} style={{ color: 'hsl(var(--text-muted))' }}>
                                            Last used:&nbsp;
                                            {key.lastUsedAt ? format(key.lastUsedAt, 'MMM do, yyyy HH:mm') : 'Never'}
                                        </p>
                                    </div>
                                    <div css={tw`ml-3 hidden sm:block`}>
                                        <Code dark>{key.identifier}</Code>
                                    </div>
                                    <button
                                        css={tw`ml-3 p-2 text-sm cursor-pointer rounded-lg transition-colors hover:text-red-400`}
                                        style={{ color: 'hsl(var(--text-muted))' }}
                                        onClick={() => setDeleteIdentifier(key.identifier)}
                                        title={'Revoke API Key'}
                                    >
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                </GreyRowBox>
                            ))}
                        </div>
                    )}
                </ContentBox>
            </div>
        </PageContentBlock>
    );
};
