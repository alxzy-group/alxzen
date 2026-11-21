import React, { useState } from 'react';
import { Subuser } from '@/state/server/subusers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faUnlockAlt, faUserLock } from '@fortawesome/free-solid-svg-icons';
import RemoveSubuserButton from '@/components/server/users/RemoveSubuserButton';
import EditSubuserModal from '@/components/server/users/EditSubuserModal';
import Can from '@/components/elements/Can';
import { useStoreState } from 'easy-peasy';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';

interface Props {
    subuser: Subuser;
}

export default ({ subuser }: Props) => {
    const uuid = useStoreState((state) => state.user!.data!.uuid);
    const [visible, setVisible] = useState(false);

    const permissionCount = subuser.permissions.filter((permission) => permission !== 'websocket.connect').length;

    return (
        <GreyRowBox>
            <EditSubuserModal subuser={subuser} visible={visible} onModalDismissed={() => setVisible(false)} />
            <div
                css={tw`w-9 h-9 rounded-xl overflow-hidden hidden md:block flex-shrink-0`}
                style={{ border: '1.5px solid hsl(var(--border))' }}
            >
                <img css={tw`w-full h-full object-cover`} src={`${subuser.image}?s=400`} alt={subuser.email} />
            </div>
            <div css={tw`md:ml-4 flex-1 overflow-hidden min-w-0`}>
                <p css={tw`text-sm font-semibold truncate m-0`} style={{ color: 'hsl(var(--text-primary))' }}>
                    {subuser.email}
                </p>
            </div>
            <div css={tw`ml-4 flex items-center`}>
                <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        subuser.twoFactorEnabled
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                    }`}
                >
                    <FontAwesomeIcon icon={subuser.twoFactorEnabled ? faUserLock : faUnlockAlt} fixedWidth />
                    <span css={tw`hidden md:inline`}>{subuser.twoFactorEnabled ? '2FA Enabled' : 'No 2FA'}</span>
                </span>
            </div>
            <div css={tw`ml-4 hidden md:flex items-center`}>
                <span
                    className={'px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border'}
                    style={{
                        background: 'hsl(var(--bg-surface))',
                        borderColor: 'hsl(var(--border))',
                        color: 'hsl(var(--text-secondary))',
                    }}
                >
                    {permissionCount} Permissions
                </span>
            </div>
            {subuser.uuid !== uuid && (
                <>
                    <Can action={'user.update'}>
                        <button
                            type={'button'}
                            aria-label={'Edit subuser'}
                            css={tw`block text-sm p-2 transition-colors duration-150 ml-3 mr-1 cursor-pointer rounded-lg hover:text-sky-400`}
                            style={{ color: 'hsl(var(--text-muted))' }}
                            onClick={() => setVisible(true)}
                        >
                            <FontAwesomeIcon icon={faPencilAlt} />
                        </button>
                    </Can>
                    <Can action={'user.delete'}>
                        <RemoveSubuserButton subuser={subuser} />
                    </Can>
                </>
            )}
        </GreyRowBox>
    );
};
