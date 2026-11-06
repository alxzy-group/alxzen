import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import useEventListener from '@/plugins/useEventListener';
import SearchModal from '@/components/dashboard/search/SearchModal';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import tw from 'twin.macro';

export default () => {
    const [visible, setVisible] = useState(false);

    useEventListener('keydown', (e: KeyboardEvent) => {
        if (['input', 'textarea'].indexOf(((e.target as HTMLElement).tagName || 'input').toLowerCase()) < 0) {
            if (!visible && e.metaKey && e.key.toLowerCase() === '/') {
                setVisible(true);
            }
        }
    });

    return (
        <>
            {visible && <SearchModal appear visible={visible} onDismissed={() => setVisible(false)} />}
            <Tooltip placement={'bottom'} content={'Search'}>
                <button
                    onClick={() => setVisible(true)}
                    css={`
                        ${tw`w-10 h-10 flex items-center justify-center transition-all duration-200 cursor-pointer rounded-full outline-none`}
                        color: hsl(var(--text-primary));
                        background: hsl(var(--bg-elevated) / 0.6);
                        border: 1px solid hsl(var(--border) / 0.8);
                        backdrop-filter: blur(8px);
                        -webkit-backdrop-filter: blur(8px);
                        &:hover {
                            color: #38bdf8;
                            background: hsl(var(--bg-elevated));
                            border-color: rgba(14, 165, 233, 0.4);
                            transform: translateY(-1px);
                            box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
                        }
                    `}
                >
                    <FontAwesomeIcon icon={faSearch} />
                </button>
            </Tooltip>
        </>
    );
};
