import React, { useEffect, useState } from 'react';
import { Button } from '@/components/elements/button/index';
import Can from '@/components/elements/Can';
import { ServerContext } from '@/state/server';
import { PowerAction } from '@/components/server/console/ServerConsoleContainer';
import { Dialog } from '@/components/elements/dialog';

interface PowerButtonProps {
    className?: string;
}

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
                <Button
                    className={'flex-1 !bg-sky-500/20 !border !border-sky-500/50 !text-sky-500 hover:!bg-sky-500/30'}
                    disabled={status !== 'offline'}
                    onClick={onButtonClick.bind(this, 'start')}
                >
                    Start
                </Button>
            </Can>
            <Can action={'control.restart'}>
                <Button
                    className={'flex-1 !bg-zinc-500/20 !border !border-zinc-500/50 !text-zinc-400 hover:!bg-zinc-500/30'}
                    disabled={!status} onClick={onButtonClick.bind(this, 'restart')}
                >
                    Restart
                </Button>
            </Can>
            <Can action={'control.stop'}>
                <Button
                    className={'flex-1 !bg-red-500/20 !border !border-red-500/50 !text-red-500 hover:!bg-red-500/30'}
                    disabled={status === 'offline'}
                    onClick={onButtonClick.bind(this, killable ? 'kill' : 'stop')}
                >
                    {killable ? 'Kill' : 'Stop'}
                </Button>
            </Can>
        </div>
    );
};
