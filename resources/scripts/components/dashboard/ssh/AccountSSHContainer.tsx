import React, { useEffect } from 'react';
import ContentBox from '@/components/elements/ContentBox';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import FlashMessageRender from '@/components/FlashMessageRender';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { useSSHKeys } from '@/api/account/ssh-keys';
import { useFlashKey } from '@/plugins/useFlash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faTerminal } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import CreateSSHKeyForm from '@/components/dashboard/ssh/CreateSSHKeyForm';
import DeleteSSHKeyButton from '@/components/dashboard/ssh/DeleteSSHKeyButton';
import PageHeader from '@/components/elements/PageHeader';
import EmptyState from '@/components/elements/EmptyState';

export default () => {
    const { clearAndAddHttpError } = useFlashKey('account');
    const { data, isValidating, error } = useSSHKeys({
        revalidateOnMount: true,
        revalidateOnFocus: false,
    });

    useEffect(() => {
        clearAndAddHttpError(error);
    }, [error]);

    return (
        <PageContentBlock title={'SSH Keys'}>
            <PageHeader
                icon={faTerminal}
                title={'SSH Public Keys'}
                description={'Manage authorized SSH public keys for passwordless SFTP authentication.'}
                badge={data ? `${data.length} Keys` : undefined}
            />
            <FlashMessageRender byKey={'account'} css={tw`mb-4`} />
            <div css={tw`grid grid-cols-1 md:grid-cols-12 gap-6 items-start`}>
                <ContentBox title={'Add SSH Key'} css={tw`md:col-span-5`}>
                    <CreateSSHKeyForm />
                </ContentBox>
                <ContentBox title={'SSH Keys'} css={tw`md:col-span-7 overflow-hidden`}>
                    <SpinnerOverlay visible={!data && isValidating} />
                    {!data || !data.length ? (
                        <EmptyState
                            icon={faTerminal}
                            title={!data ? 'Loading SSH Keys...' : 'No SSH Keys Registered'}
                            description={
                                !data
                                    ? 'Fetching registered public keys for this account.'
                                    : 'Add an SSH public key to connect to your servers via SFTP without passwords.'
                            }
                        />
                    ) : (
                        <div css={tw`flex flex-col gap-2`}>
                            {data.map((key) => (
                                <GreyRowBox key={key.fingerprint} css={tw`flex space-x-3.5 items-center mb-0`}>
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
                                    <div css={tw`flex-1 min-w-0`}>
                                        <p css={tw`text-sm break-words font-semibold m-0`} style={{ color: 'hsl(var(--text-primary))' }}>
                                            {key.name}
                                        </p>
                                        <p css={tw`text-xs mt-1 font-mono truncate m-0`} style={{ color: '#38bdf8' }}>
                                            SHA256:{key.fingerprint}
                                        </p>
                                        <p css={tw`text-[11px] mt-1 uppercase tracking-wide m-0`} style={{ color: 'hsl(var(--text-muted))' }}>
                                            Added on:&nbsp;
                                            {format(key.createdAt, 'MMM do, yyyy HH:mm')}
                                        </p>
                                    </div>
                                    <DeleteSSHKeyButton name={key.name} fingerprint={key.fingerprint} />
                                </GreyRowBox>
                            ))}
                        </div>
                    )}
                </ContentBox>
            </div>
        </PageContentBlock>
    );
};
