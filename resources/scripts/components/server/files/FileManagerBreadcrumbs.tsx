import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { NavLink, useLocation } from 'react-router-dom';
import { encodePathSegments, hashToPath } from '@/helpers';

interface Props {
    renderLeft?: JSX.Element;
    withinFileEditor?: boolean;
    isNewFile?: boolean;
}

export default ({ renderLeft, withinFileEditor, isNewFile }: Props) => {
    const [file, setFile] = useState<string | null>(null);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const { hash } = useLocation();

    useEffect(() => {
        const path = hashToPath(hash);

        if (withinFileEditor && !isNewFile) {
            const name = path.split('/').pop() || null;
            setFile(name);
        }
    }, [withinFileEditor, isNewFile, hash]);

    const breadcrumbs = (): { name: string; path?: string }[] =>
        directory
            .split('/')
            .filter((directory) => !!directory)
            .map((directory, index, dirs) => {
                if (!withinFileEditor && index === dirs.length - 1) {
                    return { name: directory };
                }

                return { name: directory, path: `/${dirs.slice(0, index + 1).join('/')}` };
            });

    const crumbLinkStyle: React.CSSProperties = {
        padding: '0 4px',
        color: 'hsl(var(--text-secondary))',
        textDecoration: 'none',
        fontWeight: 500,
        fontSize: '0.875rem',
        transition: 'color 0.15s ease',
    };

    const crumbTextStyle: React.CSSProperties = {
        padding: '0 4px',
        color: 'hsl(var(--text-primary))',
        fontWeight: 600,
        fontSize: '0.875rem',
    };

    const separatorStyle: React.CSSProperties = {
        color: 'hsl(var(--text-muted))',
        fontSize: '0.875rem',
    };

    return (
        <div style={{ display: 'flex', flexGrow: 0, alignItems: 'center', fontSize: '0.875rem', color: 'hsl(var(--text-muted))', overflowX: 'hidden' }}>
            {renderLeft || <div style={{ width: 48 }} />}
            <span style={separatorStyle}>/</span>
            <span style={crumbTextStyle}>home</span>
            <span style={separatorStyle}>/</span>
            <NavLink to={`/server/${id}/files`} style={crumbLinkStyle}>
                container
            </NavLink>
            <span style={separatorStyle}>/</span>
            {breadcrumbs().map((crumb, index) =>
                crumb.path ? (
                    <React.Fragment key={index}>
                        <NavLink
                            to={`/server/${id}/files#${encodePathSegments(crumb.path)}`}
                            style={crumbLinkStyle}
                        >
                            {crumb.name}
                        </NavLink>
                        <span style={separatorStyle}>/</span>
                    </React.Fragment>
                ) : (
                    <span key={index} style={crumbTextStyle}>
                        {crumb.name}
                    </span>
                )
            )}
            {file && (
                <React.Fragment>
                    <span style={separatorStyle}>/</span>
                    <span style={crumbTextStyle}>{file}</span>
                </React.Fragment>
            )}
        </div>
    );
};
