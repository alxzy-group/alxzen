import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useRouteMatch } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBars,
    faTimes,
    faServer,
    faCogs,
    faUserCircle,
    faSignOutAlt,
    faTerminal,
    faFolderOpen,
    faDatabase,
    faCalendarAlt,
    faUsers,
    faNetworkWired,
    faBoxOpen,
    faCloudDownloadAlt,
    faKey,
    faHistory,
    faUnlockAlt,
    faGlobe,
    faSun,
    faMoon,
    faChevronDown,
    faShieldAlt,
    faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw, { styled } from 'twin.macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Avatar from '@/components/Avatar';

interface NavigationBarProps {
    serverName?: string;
    adminServerId?: number;
}

const NavContainer = styled.div`
    ${tw`fixed top-0 left-0 right-0 z-50 h-16`}
    background-color: hsl(var(--bg-surface) / 0.96) !important;
    border-bottom: 1px solid hsl(var(--border) / 0.85);
    transition: background-color 0.2s ease, border-color 0.2s ease;
    transform: translateZ(0);
`;

const NavInner = styled.div`
    ${tw`max-w-[1400px] mx-auto h-full flex items-center justify-between px-4 sm:px-6`}
`;

const LeftSection = styled.div`
    ${tw`flex items-center gap-3 md:gap-4 min-w-0`}
`;

const RightSection = styled.div`
    ${tw`flex items-center gap-2.5`}
`;

const Logo = styled(Link)`
    ${tw`text-xl font-black tracking-tighter no-underline block whitespace-nowrap`}
    color: hsl(var(--text-primary));
    span {
        background: linear-gradient(90deg, #38bdf8, #0ea5e9);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
`;

const ServerContextPill = styled.div`
    ${tw`hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-lg min-w-0`}
    background: hsl(var(--bg-elevated));
    border: 1px solid hsl(var(--border));
`;

const AdminTopLink = styled.a`
    ${tw`h-9 px-3 rounded-xl inline-flex items-center gap-2 text-xs font-semibold no-underline transition-all duration-150 whitespace-nowrap`}
    color: #fbbf24;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.25);

    &:hover {
        color: #fde68a;
        background: rgba(245, 158, 11, 0.18);
        border-color: rgba(245, 158, 11, 0.45);
        transform: translateY(-1px);
    }
`;

const SidebarOverlay = styled.div<{ $open: boolean }>`
    ${tw`fixed inset-0 z-[60] transition-opacity duration-200`}
    background: rgba(0, 0, 0, 0.72);
    opacity: ${(props) => (props.$open ? 1 : 0)};
    pointer-events: ${(props) => (props.$open ? 'auto' : 'none')};
`;

const Sidebar = styled.div<{ $open: boolean }>`
    ${tw`fixed top-0 left-0 bottom-0 w-[288px] z-[70] flex flex-col`}
    background-color: hsl(var(--sidebar-bg));
    border-right: 1px solid hsl(var(--border));
    box-shadow: ${(props) =>
        props.$open ? '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 28px rgba(14, 165, 233, 0.08)' : 'none'};
    transform: translateX(${(props) => (props.$open ? '0%' : '-100%')});
    transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease;
    will-change: transform;
`;

const SidebarHeader = styled.div`
    ${tw`flex items-center justify-between px-5 h-16 flex-shrink-0`}
    border-bottom: 1px solid hsl(var(--border) / 0.8);
`;

const SidebarContent = styled.div`
    ${tw`flex-1 overflow-y-auto px-3.5 py-4 flex flex-col gap-0.5`}
`;

const NavItem = styled(NavLink)`
    ${tw`flex items-center gap-3 transition-all duration-150 no-underline`}
    padding: 9px 12px;
    font-size: 13px;
    font-weight: 500;
    color: hsl(var(--text-secondary));
    background: transparent;
    border: 1px solid transparent;
    border-radius: 10px;
    margin-bottom: 2px;

    svg {
        transition: color 0.15s ease, transform 0.15s ease;
        color: hsl(var(--text-muted));
        flex-shrink: 0;
    }

    &:hover {
        color: hsl(var(--text-primary));
        background: hsl(var(--bg-elevated));
        border-color: hsl(var(--border) / 0.7);
        transform: translateX(2px);

        svg {
            color: #38bdf8;
        }
    }

    &.active {
        color: #ffffff;
        background: rgba(14, 165, 233, 0.14);
        border-color: rgba(56, 189, 248, 0.32);
        box-shadow: inset 3px 0 0 #38bdf8;
        font-weight: 600;

        svg {
            color: #38bdf8;
        }
    }
`;

const SectionTitle = styled.div`
    ${tw`text-[10.5px] font-bold uppercase tracking-widest mt-4 mb-1.5 px-3 flex items-center gap-2`}
    color: #38bdf8;
    opacity: 0.9;
`;

const ServerSectionButton = styled.button<{ $open: boolean }>`
    ${tw`flex items-center justify-between w-full mt-3 mb-1.5 px-3 py-2 text-[10.5px] font-bold uppercase tracking-widest transition-all duration-150 outline-none cursor-pointer`}
    color: ${(props) => (props.$open ? '#38bdf8' : 'hsl(var(--text-muted))')};
    background: ${(props) => (props.$open ? 'hsl(var(--bg-elevated) / 0.7)' : 'transparent')};
    border: 1px solid ${(props) => (props.$open ? 'rgba(56, 189, 248, 0.25)' : 'hsl(var(--border) / 0.6)')};
    border-radius: 10px;

    &:hover {
        color: hsl(var(--text-primary));
        background: hsl(var(--bg-elevated));
        border-color: rgba(56, 189, 248, 0.35);
    }

    .chevron {
        transition: transform 0.25s ease, color 0.15s ease;
        transform: ${(props) => (props.$open ? 'rotate(180deg)' : 'rotate(0deg)')};
        color: ${(props) => (props.$open ? '#38bdf8' : 'hsl(var(--text-muted))')};
    }
`;

const SubMenu = styled.div<{ $open: boolean }>`
    display: grid;
    grid-template-rows: ${(props) => (props.$open ? '1fr' : '0fr')};
    transition: grid-template-rows 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
    opacity: ${(props) => (props.$open ? 1 : 0)};

    > div {
        overflow: hidden;
        padding-left: 0.625rem;
        border-left: 1.5px solid rgba(56, 189, 248, 0.25);
        margin-left: 0.75rem;
        margin-bottom: 0.25rem;
        display: flex;
        flex-direction: column;
        gap: 1px;
    }
`;

const UserFooter = styled.div`
    ${tw`p-3.5 flex-shrink-0`}
    border-top: 1px solid hsl(var(--border) / 0.8);
    background: hsl(var(--bg-elevated));
`;

const MenuButton = styled.button`
    ${tw`w-9 h-9 flex items-center justify-center transition-all duration-150 cursor-pointer outline-none rounded-xl flex-shrink-0`}
    color: hsl(var(--text-primary));
    background: hsl(var(--bg-elevated));
    border: 1px solid hsl(var(--border));

    &:hover {
        color: #38bdf8;
        background: hsl(var(--bg-surface));
        border-color: rgba(56, 189, 248, 0.45);
        transform: translateY(-1px);
    }
`;

const SidebarCloseBtn = styled.button`
    ${tw`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer outline-none`}
    color: hsl(var(--text-muted));
    background: transparent;
    border: 1px solid transparent;
    &:hover {
        color: #38bdf8;
        background: hsl(var(--bg-elevated));
        border-color: hsl(var(--border));
    }
`;

const UserName = styled.div`
    font-size: 13px;
    font-weight: 700;
    color: hsl(var(--text-primary));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const UserRole = styled.div`
    font-size: 10px;
    font-weight: 700;
    color: #38bdf8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
`;

const LogoutBtn = styled.button`
    ${tw`w-8 h-8 flex items-center justify-center transition-all duration-150 cursor-pointer outline-none rounded-lg flex-shrink-0`}
    color: hsl(var(--text-muted));
    background: hsl(var(--bg-surface));
    border: 1px solid hsl(var(--border));

    &:hover {
        color: #fb7185;
        background: rgba(239, 68, 68, 0.14);
        border-color: rgba(239, 68, 68, 0.35);
    }
`;

const AdminLink = styled.a`
    ${tw`flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold transition-all duration-150 rounded-xl no-underline mb-1`}
    color: #fbbf24;
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.22);

    svg {
        color: #f59e0b;
        transition: transform 0.2s ease;
    }

    &:hover {
        background: rgba(245, 158, 11, 0.16);
        border-color: rgba(245, 158, 11, 0.45);
        color: #fde68a;
        transform: translateX(2px);
    }
`;

export default ({ serverName, adminServerId }: NavigationBarProps) => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const user = useStoreState((state: ApplicationStore) => state.user.data!);
    const isOwner = useStoreState((state) =>
        Boolean(
            (state.user.data as any)?.isOwner ||
            (state.user.data as any)?.is_owner ||
            (window as any).PterodactylUser?.is_owner ||
            (window as any).PterodactylUser?.isOwner
        )
    );

    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isServerMenuOpen, setIsServerMenuOpen] = useState(true);

    const match = useRouteMatch<{ id: string }>('/server/:id');
    const serverId = match?.params.id;
    const location = useLocation();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.add('theme-light');
        } else {
            document.documentElement.classList.remove('theme-light');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            window.location.href = '/';
        });
    };

    return (
        <>
            <SpinnerOverlay visible={isLoggingOut} />

            <NavContainer>
                <NavInner>
                    <LeftSection>
                        <MenuButton onClick={() => setIsOpen(true)} title={'Open Navigation Menu'}>
                            <FontAwesomeIcon icon={faBars} />
                        </MenuButton>
                        <Logo to={'/'}>
                            {name.substring(0, 3)}
                            <span>{name.substring(3)}</span>
                        </Logo>
                        {serverName && (
                            <ServerContextPill>
                                <span style={{ color: 'hsl(var(--text-muted))', fontSize: 11 }}>/</span>
                                <span
                                    css={tw`text-xs font-semibold truncate max-w-[160px] md:max-w-[240px]`}
                                    style={{ color: 'hsl(var(--text-primary))' }}
                                >
                                    {serverName}
                                </span>
                            </ServerContextPill>
                        )}
                    </LeftSection>

                    <RightSection>
                        <SearchContainer />
                        {rootAdmin && (
                            <AdminTopLink
                                href={adminServerId ? `/admin/servers/view/${adminServerId}` : '/admin'}
                                title={adminServerId ? 'Manage Server in Admin Panel' : 'Open Admin Panel'}
                            >
                                <FontAwesomeIcon icon={faShieldAlt} />
                                <span css={tw`hidden sm:inline`}>{adminServerId ? 'Manage' : 'Admin'}</span>
                            </AdminTopLink>
                        )}
                        <MenuButton
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
                        </MenuButton>
                    </RightSection>
                </NavInner>
            </NavContainer>

            <div css={tw`h-20 w-full`} />

            <SidebarOverlay $open={isOpen} onClick={() => setIsOpen(false)} />
            <Sidebar $open={isOpen}>
                <SidebarHeader>
                    <Logo to={'/'} style={{ fontSize: '1.35rem' }}>
                        {name.substring(0, 3)}
                        <span>{name.substring(3)}</span>
                    </Logo>
                    <SidebarCloseBtn onClick={() => setIsOpen(false)} title={'Close Sidebar'}>
                        <FontAwesomeIcon icon={faTimes} />
                    </SidebarCloseBtn>
                </SidebarHeader>

                <SidebarContent>
                    <SectionTitle style={{ marginTop: 4 }}>Workspace</SectionTitle>
                    <NavItem to={'/'} exact>
                        <FontAwesomeIcon icon={faServer} style={{ width: 15 }} /> Dashboard
                    </NavItem>

                    {serverId && (
                        <>
                            <ServerSectionButton
                                $open={isServerMenuOpen}
                                onClick={() => setIsServerMenuOpen(!isServerMenuOpen)}
                            >
                                <span className={'truncate pr-2'}>{serverName || 'Server Operations'}</span>
                                <FontAwesomeIcon icon={faChevronDown} className="chevron" style={{ fontSize: 10 }} />
                            </ServerSectionButton>

                            <SubMenu $open={isServerMenuOpen}>
                                <div>
                                    <NavItem to={`/server/${serverId}`} exact>
                                        <FontAwesomeIcon icon={faTerminal} style={{ width: 14 }} /> Console
                                    </NavItem>
                                    {(window as any).SiteConfiguration?.subdomain_manager && (
                                        <NavItem to={`/server/${serverId}/domains`}>
                                            <FontAwesomeIcon icon={faGlobe} style={{ width: 14 }} /> Domains
                                        </NavItem>
                                    )}
                                    <NavItem to={`/server/${serverId}/files`}>
                                        <FontAwesomeIcon icon={faFolderOpen} style={{ width: 14 }} /> Files
                                    </NavItem>
                                    <NavItem to={`/server/${serverId}/databases`}>
                                        <FontAwesomeIcon icon={faDatabase} style={{ width: 14 }} /> Databases
                                    </NavItem>
                                    <NavItem to={`/server/${serverId}/schedules`}>
                                        <FontAwesomeIcon icon={faCalendarAlt} style={{ width: 14 }} /> Schedules
                                    </NavItem>
                                    <NavItem to={`/server/${serverId}/users`}>
                                        <FontAwesomeIcon icon={faUsers} style={{ width: 14 }} /> Users
                                    </NavItem>
                                    <NavItem to={`/server/${serverId}/backups`}>
                                        <FontAwesomeIcon icon={faCloudDownloadAlt} style={{ width: 14 }} /> Backups
                                    </NavItem>
                                    <NavItem to={`/server/${serverId}/network`}>
                                        <FontAwesomeIcon icon={faNetworkWired} style={{ width: 14 }} /> Network
                                    </NavItem>
                                    <NavItem to={`/server/${serverId}/startup`}>
                                        <FontAwesomeIcon icon={faBoxOpen} style={{ width: 14 }} /> Startup
                                    </NavItem>
                                    <NavItem to={`/server/${serverId}/settings`}>
                                        <FontAwesomeIcon icon={faCogs} style={{ width: 14 }} /> Settings
                                    </NavItem>
                                    <NavItem to={`/server/${serverId}/activity`}>
                                        <FontAwesomeIcon icon={faHistory} style={{ width: 14 }} /> Activity
                                    </NavItem>
                                </div>
                            </SubMenu>
                        </>
                    )}

                    <SectionTitle>Account</SectionTitle>
                    <NavItem to={'/account'} exact>
                        <FontAwesomeIcon icon={faUserCircle} style={{ width: 15 }} /> My Account
                    </NavItem>
                    <NavItem to={'/account/api'}>
                        <FontAwesomeIcon icon={faKey} style={{ width: 15 }} /> API Keys
                    </NavItem>
                    <NavItem to={'/account/ssh'}>
                        <FontAwesomeIcon icon={faUnlockAlt} style={{ width: 15 }} /> SSH Keys
                    </NavItem>
                    <NavItem to={'/account/activity'}>
                        <FontAwesomeIcon icon={faHistory} style={{ width: 15 }} /> Activity Log
                    </NavItem>

                    {rootAdmin && (
                        <>
                            <div style={{ margin: '10px 4px 2px', borderTop: '1px solid hsl(var(--border))' }} />
                            <SectionTitle style={{ color: '#fbbf24' }}>Administration</SectionTitle>
                            <AdminLink href={'/admin'}>
                                <FontAwesomeIcon icon={faShieldAlt} style={{ width: 14 }} /> Admin Panel
                            </AdminLink>
                            {adminServerId && (
                                <AdminLink href={`/admin/servers/view/${adminServerId}`}>
                                    <FontAwesomeIcon icon={faExternalLinkAlt} style={{ width: 14 }} /> Manage Server in Admin
                                </AdminLink>
                            )}
                        </>
                    )}
                </SidebarContent>

                <UserFooter>
                    <div
                        css={tw`flex items-center gap-3 p-2.5 rounded-xl`}
                        style={{
                            background: 'hsl(var(--bg-surface))',
                            border: '1px solid hsl(var(--border))',
                        }}
                    >
                        <div
                            style={{
                                width: 34,
                                height: 34,
                                overflow: 'hidden',
                                border: '1.5px solid rgba(56, 189, 248, 0.45)',
                                borderRadius: '50%',
                                flexShrink: 0,
                            }}
                        >
                            <Avatar.User />
                        </div>
                        <div css={tw`flex-1 min-w-0`}>
                            <UserName>{user.username}</UserName>
                            <UserRole>{isOwner ? 'Super Owner' : user.rootAdmin ? 'Administrator' : 'Client'}</UserRole>
                        </div>
                        <LogoutBtn onClick={onTriggerLogout} title="Logout">
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </LogoutBtn>
                    </div>
                </UserFooter>
            </Sidebar>
        </>
    );
};
