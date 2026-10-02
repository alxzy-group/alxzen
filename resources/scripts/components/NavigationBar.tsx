import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useRouteMatch } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBars, faTimes, faServer, faCogs, faUserCircle, faSignOutAlt, 
    faTerminal, faFolderOpen, faDatabase, faCalendarAlt, faUsers, 
    faNetworkWired, faBoxOpen, faCloudDownloadAlt,
    faKey, faHistory, faUnlockAlt, faGlobe, faSun, faMoon
} from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw, { styled } from 'twin.macro';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Avatar from '@/components/Avatar';

const NavContainer = styled.div`
    ${tw`fixed top-0 left-0 right-0 z-50 h-20`}
    background-color: hsl(var(--bg-surface)) !important;
    border-bottom: 1px solid hsl(var(--border));
    transition: background-color 0.3s ease, border-color 0.3s ease;
`;

const NavInner = styled.div`
    ${tw`max-w-[1400px] mx-auto h-full flex items-center justify-between px-6`}
`;

const LeftSection = styled.div`
    ${tw`flex items-center gap-4 md:gap-6`}
`;

const RightSection = styled.div`
    ${tw`flex items-center gap-4`}
`;

const Logo = styled(Link)`
    ${tw`text-xl md:text-2xl font-black tracking-tighter no-underline block`}
    color: hsl(var(--text-primary));
    span {
        background: linear-gradient(90deg, #38bdf8, #0ea5e9);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
`;

const SidebarOverlay = styled.div<{ $open: boolean }>`
    ${tw`fixed inset-0 z-[60] transition-opacity duration-300`}
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    opacity: ${props => props.$open ? 1 : 0};
    pointer-events: ${props => props.$open ? 'auto' : 'none'};
`;

const Sidebar = styled.div<{ $open: boolean }>`
    ${tw`fixed top-0 left-0 bottom-0 w-[300px] z-[70] flex flex-col`}
    background-color: hsl(var(--sidebar-bg));
    border-right: 1px solid hsl(var(--border));
    box-shadow: ${props => props.$open ? '10px 0 40px rgba(14, 165, 233, 0.12)' : 'none'};
    transform: translateX(${props => props.$open ? '0%' : '-100%'});
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, background-color 0.3s ease;
`;

const SidebarHeader = styled.div`
    ${tw`flex items-center justify-between p-6`}
    border-bottom: 1px solid hsl(var(--border));
`;

const SidebarContent = styled.div`
    ${tw`flex-1 overflow-y-auto p-4 flex flex-col gap-0.5`}
`;

const NavItem = styled(NavLink)`
    ${tw`flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all duration-200`}
    color: hsl(var(--text-primary));
    background: hsl(var(--bg-elevated));
    border: 2px solid hsl(var(--border));
    border-radius: 8px;
    margin-bottom: 8px;
    text-decoration: none;
    box-shadow: 3px 3px 0px hsl(var(--border));

    &:hover {
        transform: translate(2px, 2px);
        box-shadow: 1px 1px 0px hsl(var(--border));
        background: hsl(var(--bg-surface));
    }

    &.active {
        background: #0ea5e9;
        color: #ffffff;
        border-color: #0284c7;
        box-shadow: 3px 3px 0px #0284c7;
    }
`;

const SectionTitle = styled.div`
    ${tw`text-[10px] font-black uppercase tracking-widest mt-5 mb-2 px-4`}
    color: rgba(14, 165, 233, 0.5);
`;

const ServerSectionButton = styled.button<{ $open: boolean }>`
    ${tw`flex items-center justify-between w-full mt-4 mb-2 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 outline-none`}
    color: ${props => props.$open ? '#ffffff' : 'hsl(var(--text-primary))'};
    background: ${props => props.$open ? '#0ea5e9' : 'hsl(var(--bg-elevated))'};
    border: 2px solid ${props => props.$open ? '#0284c7' : 'hsl(var(--border))'};
    border-radius: 8px;
    box-shadow: 3px 3px 0px ${props => props.$open ? '#0284c7' : 'hsl(var(--border))'};

    &:hover {
        transform: translate(2px, 2px);
        box-shadow: 1px 1px 0px ${props => props.$open ? '#0284c7' : 'hsl(var(--border))'};
        background: ${props => props.$open ? '#0ea5e9' : 'hsl(var(--bg-surface))'};
    }

    .chevron {
        transition: transform 0.3s ease;
        transform: ${props => props.$open ? 'rotate(180deg)' : 'rotate(0deg)'};
    }
`;

const SubMenu = styled.div<{ $open: boolean }>`
    display: grid;
    grid-template-rows: ${props => props.$open ? '1fr' : '0fr'};
    transition: grid-template-rows 0.35s ease, opacity 0.35s ease;
    opacity: ${props => props.$open ? 1 : 0};

    > div {
        overflow: hidden;
        padding-left: 0.75rem;
        border-left: 1px solid hsl(var(--border));
        margin-left: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1px;
    }
`;

const UserFooter = styled.div`
    ${tw`p-5`}
    border-top: 1px solid hsl(var(--border));
    background: hsl(var(--bg-elevated) / 0.5);
`;

const MenuButton = styled.button`
    ${tw`w-10 h-10 flex items-center justify-center transition-all duration-200`}
    color: hsl(var(--text-secondary));
    background: hsl(var(--bg-elevated));
    border: 1px solid hsl(var(--border));
    border-radius: 12px;

    &:hover {
        color: #38bdf8;
        background: rgba(14, 165, 233, 0.12);
        border-color: rgba(14, 165, 233, 0.4);
        box-shadow: 0 0 16px rgba(14, 165, 233, 0.2);
    }
`;



const SidebarCloseBtn = styled.button`
    transition: color 0.2s;
    color: hsl(var(--text-muted));
    background: none;
    border: none;
    cursor: pointer;
    &:hover { color: #38bdf8; }
`;

const UserName = styled.div`
    font-size: 13px;
    font-weight: 700;
    color: hsl(var(--text-primary));
`;

const UserRole = styled.div`
    font-size: 10px;
    color: #0ea5e9;
    text-transform: uppercase;
    letter-spacing: 0.08em;
`;

const LogoutBtn = styled.button`
    transition: color 0.2s;
    color: hsl(var(--text-muted));
    background: none;
    border: none;
    cursor: pointer;
    &:hover { color: #38bdf8; }
`;

const AdminLink = styled.a`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    color: #38bdf8;
    font-weight: 700;
    font-size: 13px;
    text-decoration: none;
    border-left: 2px solid rgba(14,165,233,0.4);
    background: rgba(14,165,233,0.06);
    transition: all 0.2s;
    border-radius: 12px;
    &:hover {
        background: rgba(14,165,233,0.12);
        color: #7dd3fc;
    }
`;

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const user = useStoreState((state: ApplicationStore) => state.user.data!);
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

    useEffect(() => { setIsOpen(false); }, [location.pathname]);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => { window.location.href = '/'; });
    };

    return (
        <>
            <SpinnerOverlay visible={isLoggingOut} />

            <NavContainer>
                <NavInner>
                    <LeftSection>
                        <MenuButton onClick={() => setIsOpen(true)}>
                            <FontAwesomeIcon icon={faBars} />
                        </MenuButton>
                        <Logo to={'/'}>
                            {name.substring(0, 3)}<span>{name.substring(3)}</span>
                        </Logo>
                    </LeftSection>

                    <RightSection>
                        <SearchContainer />
                        <MenuButton
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            style={{ borderRadius: '50%', width: 40 }}
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
                        </MenuButton>
                    </RightSection>
                </NavInner>
            </NavContainer>

            <div css={tw`h-24 w-full`} />

            <SidebarOverlay $open={isOpen} onClick={() => setIsOpen(false)} />
            <Sidebar $open={isOpen}>
                <SidebarHeader>
                    <Logo to={'/'}>
                        {name.substring(0, 3)}<span>{name.substring(3)}</span>
                    </Logo>
                    <SidebarCloseBtn onClick={() => setIsOpen(false)}>
                        <FontAwesomeIcon icon={faTimes} />
                    </SidebarCloseBtn>
                </SidebarHeader>

                <SidebarContent>
                    <NavItem to={'/'} exact>
                        <FontAwesomeIcon icon={faServer} style={{ width: 16 }} /> Dashboard
                    </NavItem>

                    <SectionTitle>Account</SectionTitle>
                    <NavItem to={'/account'} exact>
                        <FontAwesomeIcon icon={faUserCircle} style={{ width: 16 }} /> My Account
                    </NavItem>
                    <NavItem to={'/account/api'}>
                        <FontAwesomeIcon icon={faKey} style={{ width: 16 }} /> API Keys
                    </NavItem>
                    <NavItem to={'/account/ssh'}>
                        <FontAwesomeIcon icon={faUnlockAlt} style={{ width: 16 }} /> SSH Keys
                    </NavItem>
                    <NavItem to={'/account/activity'}>
                        <FontAwesomeIcon icon={faHistory} style={{ width: 16 }} /> Activity Log
                    </NavItem>

                    {serverId && (
                        <>
                            <ServerSectionButton $open={isServerMenuOpen} onClick={() => setIsServerMenuOpen(!isServerMenuOpen)}>
                                <span>Server Console</span>
                                <FontAwesomeIcon icon={faChevronDown} className="chevron" style={{ fontSize: 10 }} />
                            </ServerSectionButton>

                            <SubMenu $open={isServerMenuOpen}>
                                <div>
                                    <NavItem to={`/server/${serverId}`} exact><FontAwesomeIcon icon={faTerminal} style={{ width: 15 }} /> Terminal</NavItem>
                                    <NavItem to={`/server/${serverId}/files`}><FontAwesomeIcon icon={faFolderOpen} style={{ width: 15 }} /> Files</NavItem>
                                    <NavItem to={`/server/${serverId}/databases`}><FontAwesomeIcon icon={faDatabase} style={{ width: 15 }} /> Databases</NavItem>
                                    <NavItem to={`/server/${serverId}/schedules`}><FontAwesomeIcon icon={faCalendarAlt} style={{ width: 15 }} /> Schedules</NavItem>
                                    <NavItem to={`/server/${serverId}/users`}><FontAwesomeIcon icon={faUsers} style={{ width: 15 }} /> Users</NavItem>
                                    <NavItem to={`/server/${serverId}/backups`}><FontAwesomeIcon icon={faCloudDownloadAlt} style={{ width: 15 }} /> Backups</NavItem>
                                    <NavItem to={`/server/${serverId}/network`}><FontAwesomeIcon icon={faNetworkWired} style={{ width: 15 }} /> Network</NavItem>
                                    <NavItem to={`/server/${serverId}/startup`}><FontAwesomeIcon icon={faBoxOpen} style={{ width: 15 }} /> Startup</NavItem>
                                    <NavItem to={`/server/${serverId}/activity`}><FontAwesomeIcon icon={faHistory} style={{ width: 15 }} /> Activity</NavItem>
                                    {(window as any).SiteConfiguration?.subdomain_manager && (
                                        <NavItem to={`/server/${serverId}/domains`}><FontAwesomeIcon icon={faGlobe} style={{ width: 15 }} /> Domains</NavItem>
                                    )}
                                    <NavItem to={`/server/${serverId}/settings`}><FontAwesomeIcon icon={faCogs} style={{ width: 15 }} /> Settings</NavItem>
                                </div>
                            </SubMenu>
                        </>
                    )}

                    {rootAdmin && (
                        <>
                            <div style={{ margin: '8px 0', borderTop: '1px solid hsl(var(--border))' }} />
                            <AdminLink href={'/admin'}>
                                <FontAwesomeIcon icon={faCogs} style={{ width: 15 }} /> Admin Panel
                            </AdminLink>
                        </>
                    )}
                </SidebarContent>

                <UserFooter>
                    <div css={tw`flex items-center gap-3`}>
                        <div style={{
                            width: 36, height: 36, overflow: 'hidden',
                            border: '1px solid rgba(14,165,233,0.3)',
                            borderRadius: '50%',
                            flexShrink: 0
                        }}>
                            <Avatar.User />
                        </div>
                        <div css={tw`flex-1 min-w-0`}>
                            <UserName>{user.username}</UserName>
                            <UserRole>{user.rootAdmin ? 'Administrator' : 'User'}</UserRole>
                        </div>
                        <LogoutBtn onClick={onTriggerLogout}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </LogoutBtn>
                    </div>
                </UserFooter>
            </Sidebar>
        </>
    );
};
