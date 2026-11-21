import React from 'react';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { ServerContext } from '@/state/server';
import { useStoreState } from 'easy-peasy';
import RenameServerBox from '@/components/server/settings/RenameServerBox';
import FlashMessageRender from '@/components/FlashMessageRender';
import Can from '@/components/elements/Can';
import ReinstallServerBox from '@/components/server/settings/ReinstallServerBox';
import tw from 'twin.macro';
import Input from '@/components/elements/Input';
import Label from '@/components/elements/Label';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import isEqual from 'react-fast-compare';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { ip } from '@/lib/formatters';
import { Button } from '@/components/elements/button/index';
import Code from '@/components/elements/Code';
import PageHeader from '@/components/elements/PageHeader';
import { faCogs, faInfoCircle, faNetworkWired } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const username = useStoreState((state) => state.user.data!.username);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const node = ServerContext.useStoreState((state) => state.server.data!.node);
    const sftp = ServerContext.useStoreState((state) => state.server.data!.sftpDetails, isEqual);

    return (
        <ServerContentBlock title={'Settings'}>
            <PageHeader
                icon={faCogs}
                title={'Server Settings'}
                description={'Access SFTP connection details, inspect instance identifiers, rename, or reinstall.'}
            />
            <FlashMessageRender byKey={'settings'} css={tw`mb-4`} />
            <div css={tw`grid grid-cols-1 lg:grid-cols-2 gap-6 items-start`}>
                <div css={tw`flex flex-col gap-6`}>
                    <Can action={'file.sftp'}>
                        <TitledGreyBox icon={faNetworkWired} title={'SFTP Details'}>
                            <div>
                                <Label>Server Address</Label>
                                <CopyOnClick text={`sftp://${ip(sftp.ip)}:${sftp.port}`}>
                                    <Input type={'text'} value={`sftp://${ip(sftp.ip)}:${sftp.port}`} readOnly />
                                </CopyOnClick>
                            </div>
                            <div css={tw`mt-5`}>
                                <Label>Username</Label>
                                <CopyOnClick text={`${username}.${id}`}>
                                    <Input type={'text'} value={`${username}.${id}`} readOnly />
                                </CopyOnClick>
                            </div>
                            <div css={tw`mt-5 flex items-center justify-between gap-4`}>
                                <div css={tw`flex-1`}>
                                    <div css={tw`border-l-2 border-sky-400 pl-3 py-1`}>
                                        <p css={tw`text-xs m-0`} style={{ color: 'hsl(var(--text-muted))' }}>
                                            Your SFTP password is the same as the password you use to access this panel.
                                        </p>
                                    </div>
                                </div>
                                <a href={`sftp://${username}.${id}@${ip(sftp.ip)}:${sftp.port}`}>
                                    <Button.Text variant={Button.Variants.Secondary}>Launch SFTP</Button.Text>
                                </a>
                            </div>
                        </TitledGreyBox>
                    </Can>
                    <TitledGreyBox icon={faInfoCircle} title={'Debug Information'}>
                        <div css={tw`flex items-center justify-between text-sm`}>
                            <p css={tw`m-0`} style={{ color: 'hsl(var(--text-secondary))' }}>Node</p>
                            <Code dark>{node}</Code>
                        </div>
                        <CopyOnClick text={uuid}>
                            <div css={tw`flex items-center justify-between mt-3 text-sm cursor-pointer`}>
                                <p css={tw`m-0`} style={{ color: 'hsl(var(--text-secondary))' }}>Server ID</p>
                                <Code dark>{uuid}</Code>
                            </div>
                        </CopyOnClick>
                    </TitledGreyBox>
                </div>
                <div css={tw`flex flex-col gap-6`}>
                    <Can action={'settings.rename'}>
                        <RenameServerBox />
                    </Can>
                    <Can action={'settings.reinstall'}>
                        <ReinstallServerBox />
                    </Can>
                </div>
            </div>
        </ServerContentBlock>
    );
};
