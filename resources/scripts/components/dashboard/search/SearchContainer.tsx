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
                    onClick={() => setVisible(true)}
                    css={`
                        ${tw`h-9 w-9 sm:w-auto sm:px-3 flex items-center justify-center gap-2.5 transition-all duration-150 cursor-pointer rounded-xl outline-none text-xs font-medium`}
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
                    <FontAwesomeIcon icon={faSearch} style={{ fontSize: 12 }} />
                    <span css={tw`hidden sm:inline`}>Search servers...</span>
                    <kbd
                        css={tw`hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono`}
                        style={{
                            background: 'hsl(var(--bg-surface))',
                            border: '1px solid hsl(var(--border))',
                            color: 'hsl(var(--text-muted))',
                        }}
                    >
                        ⌘K
                    </kbd>
                </button>
            </Tooltip>
        </>
    );
};
