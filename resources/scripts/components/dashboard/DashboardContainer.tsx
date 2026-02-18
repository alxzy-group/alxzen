import React, { useEffect, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
// FIX: Hapus 'keyframes' dari sini
import tw, { styled, css } from 'twin.macro'; 
// FIX: Import 'keyframes' dari styled-components
import { keyframes } from 'styled-components'; 
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';

// --- STYLING & ANIMATION SECTION ---

const fadeInUp = keyframes`
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
`;

// Wrapper utama dengan background gradient gelap & clean
const DashboardWrapper = styled.div`
    ${tw`relative w-full min-h-screen rounded-xl overflow-hidden p-4 md:p-8`}
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
`;

// Container transparan (Glass)
const GlassContainer = styled.div`
    ${tw`relative z-10 w-full mx-auto max-w-7xl`}
`;

// Header Section
const HeaderTitle = styled.h1`
    ${tw`text-3xl font-bold text-white tracking-tight mb-2`}
    text-shadow: 0 2px 10px rgba(0,0,0,0.3);
`;

const HeaderDescription = styled.p`
    ${tw`text-gray-400 text-sm mb-8 max-w-2xl`}
`;

// Wrapper untuk setiap kartu server (Safe wrapper)
const CardWrapper = styled.div`
    ${tw`relative mb-4 rounded-xl overflow-hidden border border-white/5 bg-gray-900/40 backdrop-filter backdrop-blur-sm transition-all duration-300`}
    
    &:hover {
        ${tw`transform -translate-y-1 shadow-xl border-cyan-500/30 bg-gray-800/60`}
        box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);
    }
`;

// Animasi wrapper
const AnimatedItem = styled.div<{ delay: number }>`
    ${tw`opacity-0`}
    animation: ${fadeInUp} 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: ${props => props.delay}s;
`;

// Background Elements (Blobs yang lebih smooth)
const AmbientLight = styled.div<{ color: string; top?: string; left?: string; right?: string; bottom?: string }>`
    ${tw`absolute rounded-full opacity-20 filter blur-3xl pointer-events-none`}
    background-color: ${props => props.color};
    width: 400px;
    height: 400px;
    top: ${props => props.top || 'auto'};
    left: ${props => props.left || 'auto'};
    right: ${props => props.right || 'auto'};
    bottom: ${props => props.bottom || 'auto'};
    z-index: 0;
`;

// Custom Toggle Container
const ToggleContainer = styled.div`
    ${tw`flex items-center space-x-3 bg-gray-900/50 px-4 py-2 rounded-lg border border-white/5`}
`;

// --- END STYLING ---

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');
    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined })
    );

    useEffect(() => { setPage(1); }, [showOnlyAdmin]);
    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) {
            setPage(1);
        }
    }, [servers?.pagination.currentPage]);

    useEffect(() => {
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'}>
            <DashboardWrapper>
                {/* Background Decor (Static & Safe) */}
                <AmbientLight color="#3b82f6" top="-10%" left="-10%" />
                <AmbientLight color="#8b5cf6" bottom="-10%" right="-10%" />
                
                <GlassContainer>
                    {/* Header Layout */}
                    <div css={tw`flex flex-col md:flex-row justify-between items-start md:items-center mb-6`}>
                        <div>
                            <HeaderTitle>Your Servers</HeaderTitle>
                            <HeaderDescription>
                                Manage and monitor your game instances from a single control panel.
                            </HeaderDescription>
                        </div>

                        {rootAdmin && (
                            <ToggleContainer>
                                <span css={tw`text-xs text-gray-400 font-semibold tracking-wide uppercase`}>
                                    {showOnlyAdmin ? "Admin View" : "My Servers"}
                                </span>
                                <Switch
                                    name={'show_all_servers'}
                                    defaultChecked={showOnlyAdmin}
                                    onChange={() => setShowOnlyAdmin((s) => !s)}
                                />
                            </ToggleContainer>
                        )}
                    </div>

                    {!servers ? (
                        <div css={tw`flex flex-col items-center justify-center py-20 space-y-4`}>
                            <Spinner centered size={'large'} />
                            <p css={tw`text-gray-500 text-sm animate-pulse`}>Loading resources...</p>
                        </div>
                    ) : (
                        <Pagination data={servers} onPageSelect={setPage}>
                            {({ items }) =>
                                items.length > 0 ? (
                                    <div css={tw`grid grid-cols-1 gap-2`}>
                                        {items.map((server, index) => (
                                            <AnimatedItem key={server.uuid} delay={index * 0.05}>
                                                <CardWrapper>
                                                    <div css={tw`p-1`}>
                                                        <ServerRow server={server} />
                                                    </div>
                                                </CardWrapper>
                                            </AnimatedItem>
                                        ))}
                                    </div>
                                ) : (
                                    <div css={tw`flex flex-col items-center justify-center py-16 px-4 rounded-xl bg-gray-800/30 border border-dashed border-gray-700`}>
                                        <p css={tw`text-lg text-gray-400 font-semibold mb-2`}>No Servers Found</p>
                                        <p css={tw`text-sm text-gray-500 max-w-md text-center`}>
                                            {showOnlyAdmin
                                                ? 'There are no other servers available to display in admin view.'
                                                : 'You do not have any servers assigned to your account yet.'}
                                        </p>
                                    </div>
                                )
                            }
                        </Pagination>
                    )}
                </GlassContainer>
            </DashboardWrapper>
        </PageContentBlock>
    );
};