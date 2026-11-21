import React from 'react';
import classNames from 'classnames';

interface CodeProps {
    dark?: boolean | undefined;
    className?: string;
    children: React.ReactChild | React.ReactFragment | React.ReactPortal;
}

export default ({ dark, className, children }: CodeProps) => (
    <code
        className={classNames('font-mono text-xs px-2.5 py-1 inline-block rounded-lg border', className)}
        style={{
            background: dark ? 'hsl(var(--bg-page))' : 'hsl(var(--bg-surface))',
            borderColor: 'hsl(var(--border))',
            color: 'hsl(var(--text-primary))',
            fontVariantNumeric: 'tabular-nums',
        }}
    >
        {children}
    </code>
);
