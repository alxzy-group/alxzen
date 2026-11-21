import React, { useContext } from 'react';
import { DialogContext } from './';
import { useDeepCompareEffect } from '@/plugins/useDeepCompareEffect';

export default ({ children }: { children: React.ReactNode }) => {
    const { setFooter } = useContext(DialogContext);

    useDeepCompareEffect(() => {
        setFooter(
            <div
                className={'px-6 py-3.5 flex items-center justify-end space-x-3'}
                style={{
                    background: 'hsl(var(--bg-surface))',
                    borderTop: '1px solid hsl(var(--border))',
                }}
            >
                {children}
            </div>
        );
    }, [children]);

    return null;
};
