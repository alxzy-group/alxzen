import React, { memo, useCallback, useState } from 'react';
import isEqual from 'react-fast-compare';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNetworkWired, faStar } from '@fortawesome/free-solid-svg-icons';
import InputSpinner from '@/components/elements/InputSpinner';
import { Textarea } from '@/components/elements/Input';
import Can from '@/components/elements/Can';
import { Button } from '@/components/elements/button/index';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { Allocation } from '@/api/server/getServer';
import styled from 'styled-components/macro';
import { debounce } from 'debounce';
import setServerAllocationNotes from '@/api/server/network/setServerAllocationNotes';
import { useFlashKey } from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import CopyOnClick from '@/components/elements/CopyOnClick';
import DeleteAllocationButton from '@/components/server/network/DeleteAllocationButton';
import setPrimaryServerAllocation from '@/api/server/network/setPrimaryServerAllocation';
import getServerAllocations from '@/api/swr/getServerAllocations';
import { ip } from '@/lib/formatters';
import Code from '@/components/elements/Code';

const Label = styled.label`
    ${tw`uppercase text-[10px] tracking-wider mt-1.5 block px-1 select-none transition-colors duration-150`}
    color: hsl(var(--text-muted));
`;

interface Props {
    allocation: Allocation;
}

const AllocationRow = ({ allocation }: Props) => {
    const [loading, setLoading] = useState(false);
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('server:network');
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { mutate } = getServerAllocations();

    const onNotesChanged = useCallback((id: number, notes: string) => {
        mutate((data) => data?.map((a) => (a.id === id ? { ...a, notes } : a)), false);
    }, []);

    const setAllocationNotes = debounce((notes: string) => {
        setLoading(true);
        clearFlashes();

        setServerAllocationNotes(uuid, allocation.id, notes)
            .then(() => onNotesChanged(allocation.id, notes))
            .catch((error) => clearAndAddHttpError(error))
            .then(() => setLoading(false));
    }, 750);

    const setPrimaryAllocation = () => {
        clearFlashes();
        mutate((data) => data?.map((a) => ({ ...a, isDefault: a.id === allocation.id })), false);

        setPrimaryServerAllocation(uuid, allocation.id).catch((error) => {
            clearAndAddHttpError(error);
            mutate();
        });
    };

    return (
        <GreyRowBox $hoverable={false} className={'flex-wrap md:flex-nowrap gap-4'}>
            <div className={'flex items-center w-full md:w-auto'}>
                <div
                    css={tw`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mr-4`}
                    style={{
                        background: allocation.isDefault ? 'rgba(16, 185, 129, 0.12)' : 'rgba(14, 165, 233, 0.1)',
                        border: allocation.isDefault
                            ? '1px solid rgba(52, 211, 153, 0.3)'
                            : '1px solid rgba(56, 189, 248, 0.25)',
                        color: allocation.isDefault ? '#34d399' : '#38bdf8',
                    }}
                >
                    <FontAwesomeIcon icon={faNetworkWired} />
                </div>
                <div className={'mr-4 flex-1 md:w-44'}>
                    {allocation.alias ? (
                        <CopyOnClick text={allocation.alias}>
                            <Code dark className={'w-44 truncate'}>
                                {allocation.alias}
                            </Code>
                        </CopyOnClick>
                    ) : (
                        <CopyOnClick text={ip(allocation.ip)}>
                            <Code dark>{ip(allocation.ip)}</Code>
                        </CopyOnClick>
                    )}
                    <Label>{allocation.alias ? 'Hostname' : 'IP Address'}</Label>
                </div>
                <div className={'w-20 md:w-24 overflow-hidden'}>
                    <Code dark>{allocation.port}</Code>
                    <Label>Port</Label>
                </div>
            </div>
            <div className={'w-full md:flex-1 md:w-auto'}>
                <InputSpinner visible={loading}>
                    <Textarea
                        rows={1}
                        placeholder={'Notes (optional)...'}
                        defaultValue={allocation.notes || undefined}
                        onChange={(e) => setAllocationNotes(e.currentTarget.value)}
                    />
                </InputSpinner>
            </div>
            <div className={'flex justify-end items-center space-x-3 w-full md:w-44 shrink-0'}>
                {allocation.isDefault ? (
                    <span className={'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'}>
                        <FontAwesomeIcon icon={faStar} style={{ fontSize: 10 }} />
                        Primary
                    </span>
                ) : (
                    <>
                        <Can action={'allocation.delete'}>
                            <DeleteAllocationButton allocation={allocation.id} />
                        </Can>
                        <Can action={'allocation.update'}>
                            <Button.Text size={Button.Sizes.Small} onClick={setPrimaryAllocation}>
                                Make Primary
                            </Button.Text>
                        </Can>
                    </>
                )}
            </div>
        </GreyRowBox>
    );
};

export default memo(AllocationRow, isEqual);
