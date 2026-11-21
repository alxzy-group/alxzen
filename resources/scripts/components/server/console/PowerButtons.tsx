import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faRedoAlt, faStop, faSkull } from '@fortawesome/free-solid-svg-icons';
import Can from '@/components/elements/Can';
import { ServerContext } from '@/state/server';
import { PowerAction } from '@/components/server/console/ServerConsoleContainer';
import { Dialog } from '@/components/elements/dialog';
import tw, { styled } from 'twin.macro';

interface PowerButtonProps {
    className?: string;
}

const BaseButton = styled.button`
    ${tw`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 font-bold py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-[13px] text-white cursor-pointer select-none outline-none whitespace-nowrap`}
    font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    letter-spacing: -0.01em;
    transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s ease, background 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
    transform: translateZ(0);

    &:hover:not(:disabled) {
        transform: translateY(-1px);
    }

    &:active:not(:disabled) {
        transform: translateY(0) scale(0.98);
    }

    &:disabled {
        opacity: 0.35;
        cursor: not-allowed;
        pointer-events: none;
    }
`;

const StartBtn = styled(BaseButton)`
    background: linear-gradient(180deg, #10b981 0%, #059669 100%);
    border: 1px solid rgba(52, 211, 153, 0.4);
    box-shadow: 0 2px 12px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.22);

    &:hover:not(:disabled) {
        background: linear-gradient(180deg, #34d399 0%, #10b981 100%);
        border-color: rgba(110, 231, 183, 0.55);
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }
`;

const RestartBtn = styled(BaseButton)`
    background: linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%);
    border: 1px solid rgba(56, 189, 248, 0.4);
    box-shadow: 0 2px 12px rgba(14, 165, 233, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.22);

    &:hover:not(:disabled) {
        background: linear-gradient(180deg, #38bdf8 0%, #0ea5e9 100%);
        border-color: rgba(125, 211, 252, 0.55);
        box-shadow: 0 6px 20px rgba(14, 165, 233, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }
`;

const StopBtn = styled(BaseButton)<{ $kill?: boolean }>`
    background: ${({ $kill }) =>
        $kill
            ? 'linear-gradient(180deg, #dc2626 0%, #991b1b 100%)'
            : 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)'};
    border: 1px solid rgba(248, 113, 113, 0.4);
    box-shadow: 0 2px 12px rgba(239, 68, 68, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.22);

    &:hover:not(:disabled) {
        background: linear-gradient(180deg, #f87171 0%, #ef4444 100%);
        border-color: rgba(252, 165, 165, 0.55);
        box-shadow: 0 6px 20px rgba(239, 68, 68, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.3);
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
                    type="button"
                    disabled={status !== 'offline'}
                    onClick={onButtonClick.bind(this, 'start')}
                >
                    <FontAwesomeIcon icon={faPlay} className="text-[11px]" />
                    <span>Start</span>
                </StartBtn>
            </Can>
            <Can action={'control.restart'}>
                <RestartBtn
                    type="button"
                    disabled={!status}
                    onClick={onButtonClick.bind(this, 'restart')}
                >
                    <FontAwesomeIcon icon={faRedoAlt} className="text-[11px]" />
                    <span>Restart</span>
                </RestartBtn>
            </Can>
            <Can action={'control.stop'}>
                <StopBtn
                    type="button"
                    $kill={killable}
                    disabled={status === 'offline'}
                    onClick={onButtonClick.bind(this, killable ? 'kill' : 'stop')}
                >
                    <FontAwesomeIcon icon={killable ? faSkull : faStop} className="text-[11px]" />
                    <span>{killable ? 'Kill' : 'Stop'}</span>
                </StopBtn>
            </Can>
        </div>
    );
};
