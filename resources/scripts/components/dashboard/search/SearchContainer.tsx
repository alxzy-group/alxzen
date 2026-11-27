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
            if (!visible && (e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === '/' || e.key.toLowerCase() === 'k')) {
                e.preventDefault();
                setVisible(true);
            }
        }
    });

    return (
        <>
            {visible && <SearchModal appear visible={visible} onDismissed={() => setVisible(false)} />}
            <Tooltip placement={'bottom'} content={'Quick Search (Ctrl+K)'}>
                <button
                    type={'button'}
                    aria-label={'Quick Server Search'}
                    onClick={() => setVisible(true)}
                    css={`
                        ${tw`h-9 w-9 flex items-center justify-center transition-all duration-150 cursor-pointer rounded-xl outline-none text-xs font-medium flex-shrink-0`}
                        color: hsl(var(--text-secondary));
                        background: hsl(var(--bg-elevated));
                        border: 1px solid hsl(var(--border));
                        &:hover {
                            color: #38bdf8;
                            background: hsl(var(--bg-surface));
                            border-color: rgba(56, 189, 248, 0.45);
                            transform: translateY(-1px);
                        }
                    `}
                >
                    <FontAwesomeIcon icon={faSearch} style={{ fontSize: 13 }} />
                </button>
            </Tooltip>
        </>
    );
};
