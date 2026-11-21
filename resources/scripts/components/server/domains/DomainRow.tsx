import React, { useState } from 'react';
import { ServerDomain, deleteServerDomain } from '@/api/server/domains';
import Button from '@/components/elements/Button';
import { ServerContext } from '@/state/server';
import { useFlashKey } from '@/plugins/useFlash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faGlobe, faTrash } from '@fortawesome/free-solid-svg-icons';
import ConfirmationModal from '@/components/elements/ConfirmationModal';

interface Props {
    domain: ServerDomain;
    onDeleted: () => void;
    onUpdated: (domain: ServerDomain) => void;
}

export default ({ domain, onDeleted }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { clearAndAddHttpError } = useFlashKey('server:domains');

    const [isDeleting, setIsDeleting] = useState(false);
    const [visible, setVisible] = useState(false);

    const doDelete = () => {
        setIsDeleting(true);
        deleteServerDomain(uuid, domain.id)
            .then(() => onDeleted())
            .catch((error) => {
                clearAndAddHttpError(error);
                setIsDeleting(false);
            })
            .finally(() => setVisible(false));
    };

    return (
        <div
            className="p-4 rounded-xl transition-colors duration-150 flex items-center justify-between gap-4"
            style={{
                backgroundColor: 'hsl(var(--bg-surface))',
                border: '1px solid hsl(var(--border))',
            }}
        >
            <div className="flex items-center gap-3.5 min-w-0">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                        background: 'rgba(14, 165, 233, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        color: '#38bdf8',
                    }}
                >
                    <FontAwesomeIcon icon={faGlobe} />
                </div>
                <div className="flex flex-col min-w-0">
                    <a
                        href={`https://${domain.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-mono font-bold truncate no-underline hover:text-sky-400 transition-colors flex items-center gap-2"
                        style={{ color: 'hsl(var(--text-primary))' }}
                    >
                        <span className="truncate">{domain.domain}</span>
                        <FontAwesomeIcon icon={faExternalLinkAlt} style={{ fontSize: 10, opacity: 0.7 }} />
                    </a>
                    <div className="mt-1 flex items-center">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Connected
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 items-center shrink-0">
                <Button color="red" isSecondary isLoading={isDeleting} onClick={() => setVisible(true)}>
                    <FontAwesomeIcon icon={faTrash} />
                </Button>
            </div>

            <ConfirmationModal
                visible={visible}
                title={'Delete Subdomain?'}
                buttonText={'Yes, delete it'}
                onConfirmed={doDelete}
                onModalDismissed={() => setVisible(false)}
            >
                Are you sure you want to delete this subdomain? This will immediately disconnect the routing.
            </ConfirmationModal>
        </div>
    );
};
