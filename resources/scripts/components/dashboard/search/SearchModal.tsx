import React, { useEffect, useRef, useState } from 'react';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import { ApplicationStore } from '@/state';
import { useStoreState } from 'easy-peasy';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import InputSpinner from '@/components/elements/InputSpinner';
import FlashMessageRender from '@/components/FlashMessageRender';
import { useStoreActions } from 'easy-peasy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faServer, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const ServerResult = styled(Link)`
    ${tw`flex items-center justify-between bg-neutral-900/90 hover:bg-neutral-800 p-3.5 rounded-xl border border-neutral-800 hover:border-cyan-500/50 transition-all duration-150`};

    &:not(:last-of-type) {
        ${tw`mb-2.5`};
    }

    &:hover .server-arrow {
        color: #38bdf8;
        transform: translateX(2px);
    }
`;

export default ({ visible, onDismissed, ...props }: RequiredModalProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [term, setTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [servers, setServers] = useState<Server[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data?.rootAdmin);
    const isOwner = useStoreState((state: ApplicationStore) => state.user.data?.id === 1);
    const clearAndAddError = useStoreActions((actions: any) => actions.flashes.clearAndAddHttpError);
    const clearFlashes = useStoreActions((actions: any) => actions.flashes.clearFlashes);

    useEffect(() => {
        if (!visible) {
            return;
        }

        const focusTimer = setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        }, 40);

        return () => clearTimeout(focusTimer);
    }, [visible]);

    useEffect(() => {
        if (!visible) {
            return;
        }

        let cancelled = false;
        const trimmed = term.trim();
        const delay = trimmed.length === 0 ? 0 : 220;

        const timer = setTimeout(() => {
            setLoading(true);
            clearFlashes('search');

            getServers({
                query: trimmed.length > 0 ? trimmed : undefined,
                type: rootAdmin && isOwner ? 'admin-all' : undefined,
            })
                .then((results) => {
                    if (!cancelled) {
                        setServers((results.items || []).slice(0, 12));
                        setHasSearched(true);
                    }
                })
                .catch((error) => {
                    if (!cancelled) {
                        console.error(error);
                        clearAndAddError({ key: 'search', error });
                    }
                })
                .finally(() => {
                    if (!cancelled) {
                        setLoading(false);
                    }
                });
        }, delay);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [visible, term, rootAdmin, isOwner]);

    const handleDismissed = () => {
        setTerm('');
        onDismissed();
    };

    return (
        <Modal
            visible={visible}
            onDismissed={handleDismissed}
            closeOnBackground
            showSpinnerOverlay={false}
            {...props}
        >
            <div css={tw`flex items-center justify-between mb-3`}>
                <div>
                    <h3 css={tw`text-base font-bold text-neutral-100 m-0`}>Quick Server Search</h3>
                    <p css={tw`text-xs text-neutral-400 mt-0.5 mb-0`}>
                        Search by server name, UUID, external ID, or IP allocation.
                    </p>
                </div>
            </div>

            <FlashMessageRender byKey={'search'} css={tw`mb-3`} />

            <InputSpinner visible={loading}>
                <div css={tw`relative flex items-center`}>
                    <FontAwesomeIcon
                        icon={faSearch}
                        css={tw`absolute left-3.5 text-neutral-400 text-sm pointer-events-none`}
                    />
                    <input
                        ref={inputRef}
                        type={'text'}
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        placeholder={'Type server name, UUID, or IP:port...'}
                        css={tw`w-full bg-neutral-900 border border-neutral-700 focus:border-cyan-500 rounded-xl pl-10 pr-10 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 outline-none transition-colors`}
                    />
                    {term.length > 0 && (
                        <button
                            type={'button'}
                            onClick={() => {
                                setTerm('');
                                inputRef.current?.focus();
                            }}
                            title={'Clear search'}
                            css={tw`absolute right-3 text-neutral-400 hover:text-neutral-200 transition-colors p-1`}
                        >
                            <FontAwesomeIcon icon={faTimes} css={tw`text-xs`} />
                        </button>
                    )}
                </div>
            </InputSpinner>

            <div css={tw`mt-4 max-h-80 overflow-y-auto pr-0.5`}>
                {servers.length > 0 ? (
                    servers.map((server) => (
                        <ServerResult
                            key={server.uuid}
                            to={`/server/${server.id}`}
                            onClick={handleDismissed}
                        >
                            <div css={tw`flex items-center min-w-0 flex-1 mr-3`}>
                                <div
                                    css={tw`w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center flex-shrink-0 mr-3 text-cyan-400`}
                                >
                                    <FontAwesomeIcon icon={faServer} css={tw`text-xs`} />
                                </div>
                                <div css={tw`min-w-0 flex-1`}>
                                    <p css={tw`text-sm font-semibold text-neutral-100 truncate m-0`}>
                                        {server.name}
                                    </p>
                                    <p css={tw`text-xs text-neutral-400 font-mono truncate mt-0.5 mb-0`}>
                                        {server.allocations
                                            .filter((alloc) => alloc.isDefault)
                                            .map((allocation) => (
                                                <span key={allocation.ip + allocation.port.toString()}>
                                                    {allocation.alias || allocation.ip}:{allocation.port}
                                                </span>
                                            ))}
                                        <span css={tw`mx-1.5 text-neutral-600`}>•</span>
                                        <span>{server.id}</span>
                                    </p>
                                </div>
                            </div>
                            <div css={tw`flex items-center flex-shrink-0 gap-2.5`}>
                                <span
                                    css={tw`hidden sm:inline-block bg-cyan-500/10 border border-cyan-500/20 py-1 px-2 rounded-md text-xs text-cyan-300 font-medium`}
                                >
                                    {server.node}
                                </span>
                                <FontAwesomeIcon
                                    icon={faArrowRight}
                                    className={'server-arrow'}
                                    css={tw`text-xs text-neutral-500 transition-all duration-150`}
                                />
                            </div>
                        </ServerResult>
                    ))
                ) : hasSearched && !loading ? (
                    <div css={tw`py-8 text-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40`}>
                        <p css={tw`text-sm font-medium text-neutral-300 m-0`}>
                            {term.trim().length > 0
                                ? `No servers matching "${term.trim()}"`
                                : 'No servers available'}
                        </p>
                        <p css={tw`text-xs text-neutral-500 mt-1 mb-0`}>
                            Try searching by server name, short ID, or default allocation IP.
                        </p>
                    </div>
                ) : null}
            </div>
        </Modal>
    );
};
