import React, { useState } from 'react';
import tw from 'twin.macro';
import { ServerDomain, deleteServerDomain, verifyServerDomain } from '@/api/server/domains';
import Button from '@/components/elements/Button';
import { ServerContext } from '@/state/server';
import { useFlashKey } from '@/plugins/useFlash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import ConfirmationModal from '@/components/elements/ConfirmationModal';

interface Props {
    domain: ServerDomain;
    onDeleted: () => void;
    onUpdated: (domain: ServerDomain) => void;
}

export default ({ domain, onDeleted, onUpdated }: Props) => {
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
        <div css={tw`bg-neutral-800 p-4 rounded mb-4 border border-neutral-600`}>
            <div css={tw`flex items-center justify-between`}>
                <div css={tw`flex flex-col`}>
                    <span css={tw`text-lg text-neutral-200 font-mono`}>{domain.domain}</span>
                    <div css={tw`mt-1 flex items-center`}>
                        <span css={tw`text-green-500 text-sm flex items-center gap-2`}>
                            <FontAwesomeIcon icon={faCheckCircle} /> Connected
                        </span>
                    </div>
                </div>
                
                <div css={tw`flex gap-4 items-center`}>
                    <Button.Danger isSpinner={isDeleting} onClick={() => setVisible(true)}>
                        <FontAwesomeIcon icon={faTrash} />
                    </Button.Danger>
                </div>
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
