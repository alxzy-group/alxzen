import TransferListener from '@/components/server/TransferListener';
import React, { useEffect, useState } from 'react';
import { NavLink, Route, Switch, useRouteMatch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import TransitionRouter from '@/TransitionRouter';
import WebsocketHandler from '@/components/server/WebsocketHandler';
import { ServerContext } from '@/state/server';
import { CSSTransition } from 'react-transition-group';
import Can from '@/components/elements/Can';
import Spinner from '@/components/elements/Spinner';
import { NotFound, ServerError } from '@/components/elements/ScreenBlock';
import { httpErrorToHuman } from '@/api/http';
import { useStoreState } from 'easy-peasy';
import InstallListener from '@/components/server/InstallListener';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTerminal,
    faFolderOpen,
    faDatabase,
    faCalendarAlt,
    faUsers,
    faBoxOpen,
    faNetworkWired,
    faGlobe,
    faPlayCircle,
    faCogs,
    faHistory,
    faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router';
import ConflictStateRenderer from '@/components/server/ConflictStateRenderer';
import PermissionRoute from '@/components/elements/PermissionRoute';
import routes from '@/routers/routes';
import tw, { styled } from 'twin.macro';

const ServerDockBar = styled.div`
    ${tw`w-full sticky top-20 z-30`}
    background: hsl(var(--bg-surface) / 0.92);
    border-bottom: 1px solid hsl(var(--border) / 0.75);
    transform: translateZ(0);
`;

const ServerDockInner = styled.div`
    ${tw`max-w-[1400px] mx-auto px-4 md:px-8 py-2 flex items-center gap-1.5 overflow-x-auto`}
    scrollbar-width: none;
    &::-webkit-scrollbar {
        display: none;
    }

    & > a {
        ${tw`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap no-underline transition-all duration-150 select-none`}
        color: hsl(var(--text-secondary));
        border: 1px solid transparent;

        svg {
            font-size: 12px;
            color: hsl(var(--text-muted));
            transition: color 0.15s ease;
        }

        &:hover {
            color: hsl(var(--text-primary));
            background: hsl(var(--bg-elevated));
            border-color: hsl(var(--border));
            svg {
                color: #38bdf8;
            }
        }

        &.active {
            color: #ffffff;
            background: linear-gradient(180deg, rgba(14, 165, 233, 0.2) 0%, rgba(2, 132, 199, 0.3) 100%);
            border-color: rgba(56, 189, 248, 0.45);
            box-shadow: 0 2px 10px rgba(14, 165, 233, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.12);
            svg {
                color: #38bdf8;
            }
        }
    }
`;

const getRouteIcon = (path: string) => {
    switch (path) {
        case '/': return faTerminal;
        case '/files': return faFolderOpen;
        case '/databases': return faDatabase;
        case '/schedules': return faCalendarAlt;
        case '/users': return faUsers;
        case '/backups': return faBoxOpen;
        case '/network': return faNetworkWired;
        case '/domains': return faGlobe;
        case '/startup': return faPlayCircle;
        case '/settings': return faCogs;
        case '/activity': return faHistory;
        default: return faTerminal;
    }
};

export default () => {
    const match = useRouteMatch<{ id: string }>();
    const location = useLocation();

    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [error, setError] = useState('');

    const id = ServerContext.useStoreState((state) => state.server.data?.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
    const inConflictState = ServerContext.useStoreState((state) => state.server.inConflictState);
    const serverId = ServerContext.useStoreState((state) => state.server.data?.internalId);
    const getServer = ServerContext.useStoreActions((actions) => actions.server.getServer);
    const clearServerState = ServerContext.useStoreActions((actions) => actions.clearServerState);

    const to = (value: string, url = false) => {
        if (value === '/') {
            return url ? match.url : match.path;
        }
        return `${(url ? match.url : match.path).replace(/\/*$/, '')}/${value.replace(/^\/+/, '')}`;
    };

    useEffect(
        () => () => {
            clearServerState();
        },
        []
    );

    useEffect(() => {
        setError('');

        getServer(match.params.id).catch((error) => {
            console.error(error);
            setError(httpErrorToHuman(error));
        });

        return () => {
            clearServerState();
        };
    }, [match.params.id]);

    return (
        <React.Fragment key={'server-router'}>
            <NavigationBar />
            {!uuid || !id ? (
                error ? (
                    <ServerError message={error} />
                ) : (
                    <Spinner size={'large'} centered />
                )
            ) : (
                <>
                    {/* Next-Gen Horizontal Pill Command Dock for 1-Click Server Navigation */}
                    <ServerDockBar>
                        <ServerDockInner>
                            {routes.server
                                .filter((route) => !!route.name)
                                .map((route) =>
                                    route.permission ? (
                                        <Can key={route.path} action={route.permission} matchAny>
                                            <NavLink to={to(route.path, true)} exact={route.exact}>
                                                <FontAwesomeIcon icon={getRouteIcon(route.path)} />
                                                <span>{route.name}</span>
                                            </NavLink>
                                        </Can>
                                    ) : (
                                        <NavLink key={route.path} to={to(route.path, true)} exact={route.exact}>
                                            <FontAwesomeIcon icon={getRouteIcon(route.path)} />
                                            <span>{route.name}</span>
                                        </NavLink>
                                    )
                                )}
                            {rootAdmin && (
                                <a
                                    href={`/admin/servers/view/${serverId}`}
                                    target={'_blank'}
                                    rel={'noreferrer'}
                                    style={{ marginLeft: 'auto' }}
                                    title="Open in Admin Control Plane"
                                >
                                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                                    <span>Admin</span>
                                </a>
                            )}
                        </ServerDockInner>
                    </ServerDockBar>

                    <CSSTransition timeout={150} classNames={'fade'} appear in>
                        <div />
                    </CSSTransition>
                    <InstallListener />
                    <TransferListener />
                    <WebsocketHandler />
                    {inConflictState && (!rootAdmin || (rootAdmin && !location.pathname.endsWith(`/server/${id}`))) ? (
                        <ConflictStateRenderer />
                    ) : (
                        <ErrorBoundary>
                            <TransitionRouter>
                                <Switch location={location}>
                                    {routes.server.map(({ path, permission, component: Component }) => (
                                        <PermissionRoute key={path} permission={permission} path={to(path)} exact>
                                            <Spinner.Suspense>
                                                <Component />
                                            </Spinner.Suspense>
                                        </PermissionRoute>
                                    ))}
                                    <Route path={'*'} component={NotFound} />
                                </Switch>
                            </TransitionRouter>
                        </ErrorBoundary>
                    )}
                </>
            )}
        </React.Fragment>
    );
};
