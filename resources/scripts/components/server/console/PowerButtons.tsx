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
    ${tw`flex-1 font-black transition-all duration-200 rounded-xl`}
    border: 3px solid hsl(var(--text-primary)) !important;
    box-shadow: 4px 4px 0px hsl(var(--text-primary)) !important;
    color: hsl(var(--text-primary)) !important;

    &:hover:not(:disabled) {
        transform: translate(2px, 2px);
        box-shadow: 2px 2px 0px hsl(var(--text-primary)) !important;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const StartBtn = styled(BaseButton)`
    background: #4ade80 !important; // Green
`;

const RestartBtn = styled(BaseButton)`
    background: #facc15 !important; // Yellow
`;

const StopBtn = styled(BaseButton)`
    background: #f87171 !important; // Red
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
