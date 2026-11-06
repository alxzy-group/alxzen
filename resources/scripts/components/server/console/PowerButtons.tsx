import React, { useEffect, useState } from 'react';
import { Button } from '@/components/elements/button/index';
import Can from '@/components/elements/Can';
import { ServerContext } from '@/state/server';
import { PowerAction } from '@/components/server/console/ServerConsoleContainer';
import { Dialog } from '@/components/elements/dialog';
import tw, { styled } from 'twin.macro';

interface PowerButtonProps {
    className?: string;
}

const BaseButton = styled(Button)`
    ${tw`flex-1 font-bold py-2.5 px-4 transition-all duration-200 rounded-xl tracking-wide text-xs sm:text-sm text-white`}
    border: 1px solid transparent !important;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        filter: brightness(1.1);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
        filter: brightness(0.95);
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        filter: grayscale(0.5);
    }
`;

const StartBtn = styled(BaseButton)`
    background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
    border-color: rgba(16, 185, 129, 0.4) !important;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25) !important;

    &:hover:not(:disabled) {
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4) !important;
    }
`;

const RestartBtn = styled(BaseButton)`
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
    border-color: rgba(245, 158, 11, 0.4) !important;
    box-shadow: 0 4px 14px rgba(245, 158, 11, 0.25) !important;

    &:hover:not(:disabled) {
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4) !important;
    }
`;

const StopBtn = styled(BaseButton)`
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
    border-color: rgba(239, 68, 68, 0.4) !important;
    box-shadow: 0 4px 14px rgba(239, 68, 68, 0.25) !important;

    &:hover:not(:disabled) {
        box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4) !important;
    }
`;

export default ({ className }: PowerButtonProps) => {
    const [open, setOpen] = useState(false);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);

    const killable = status === 'stopping';
    const onButtonClick = (
        action: PowerAction | 'kill-confirmed',
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ): void => {
        e.preventDefault();
        if (action === 'kill') {
            return setOpen(true);
        }

        if (instance) {
            setOpen(false);
            instance.send('set state', action === 'kill-confirmed' ? 'kill' : action);
        }
    };

    useEffect(() => {
        if (status === 'offline') {
            setOpen(false);
        }
    }, [status]);

    return (
        <div className={className}>
            <Dialog.Confirm
                open={open}
                hideCloseIcon
                onClose={() => setOpen(false)}
                title={'Forcibly Stop Process'}
                confirm={'Continue'}
                onConfirmed={onButtonClick.bind(this, 'kill-confirmed')}
            >
                Forcibly stopping a server can lead to data corruption.
            </Dialog.Confirm>
            <Can action={'control.start'}>
                <StartBtn
                    disabled={status !== 'offline'}
                    onClick={onButtonClick.bind(this, 'start')}
                >
                    Start
                </StartBtn>
            </Can>
            <Can action={'control.restart'}>
                <RestartBtn
                    disabled={!status} onClick={onButtonClick.bind(this, 'restart')}
                >
                    Restart
                </RestartBtn>
            </Can>
            <Can action={'control.stop'}>
                <StopBtn
                    disabled={status === 'offline'}
                    onClick={onButtonClick.bind(this, killable ? 'kill' : 'stop')}
                >
                    {killable ? 'Kill' : 'Stop'}
                </StopBtn>
            </Can>
        </div>
    );
};
