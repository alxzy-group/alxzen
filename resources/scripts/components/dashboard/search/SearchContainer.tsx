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
                        ${tw`w-10 h-10 flex items-center justify-center transition-all duration-200 cursor-pointer`}
                        color: hsl(var(--text-primary));
                        background: hsl(var(--bg-elevated));
                        border: 3px solid hsl(var(--text-primary));
                        border-radius: 50%;
                        box-shadow: 4px 4px 0px hsl(var(--text-primary));
                        &:hover {
                            transform: translate(2px, 2px);
                            box-shadow: 2px 2px 0px hsl(var(--text-primary));
                            background: hsl(var(--bg-surface));
                        }
                    `}
                >
                    <FontAwesomeIcon icon={faSearch} />
                </button>
            </Tooltip>
        </>
    );
};
