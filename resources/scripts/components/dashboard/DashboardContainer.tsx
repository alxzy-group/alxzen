import React, { useEffect, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import tw, { styled } from 'twin.macro';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import AnnounceBar from '@/components/elements/AnnounceBar';
import { motion, AnimatePresence } from 'framer-motion';
import DuniaAlxzyOverlay from '@/components/alxzy-theme/DuniaAlxzy/DuniaAlxzyOverlay';
import { GlobeIcon } from '@heroicons/react/solid';
const dashboardStyles = `
@keyframes dash-title-in {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: translateX(0); }
}
@keyframes dash-line-expand {
    from { width: 0; }
    to   { width: 60px; }
}
@keyframes dash-skeleton {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
}
`;

const RootContainer = styled.div`
    ${tw`w-full max-w-[1400px] mx-auto p-4 md:p-8`}
`;

const HeaderSection = styled.div`
    ${tw`flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6`}
`;

const TitleBox = styled.div`
    ${tw`text-left`}
    animation: dash-title-in 0.5s ease both;
`;



const Title = styled.h1`
    ${tw`text-5xl md:text-6xl font-black tracking-tighter mb-1`}
    color: hsl(var(--text-primary));
    letter-spacing: -2px;
    span {
        background: linear-gradient(90deg, #38bdf8, #0ea5e9);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
`;



const FilterBar = styled(motion.div)`
    ${tw`flex items-center gap-4 px-5 py-2.5`}
    background: hsl(var(--bg-elevated) / 0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid hsl(var(--border) / 0.7);
    border-radius: 12px;
`;

const FilterLabel = styled.span`
    ${tw`text-[11px] font-bold uppercase tracking-widest`}
    color: hsl(var(--accent));
`;

const DuniaAlxzyTopButton = styled(motion.button)`
    ${tw`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 outline-none cursor-pointer`}
    background: linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(2, 132, 199, 0.25) 100%);
    border: 1px solid rgba(56, 189, 248, 0.35);
    box-shadow: 0 4px 16px rgba(14, 165, 233, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: #ffffff;

    &:hover {
        background: linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(2, 132, 199, 0.38) 100%);
        border-color: rgba(56, 189, 248, 0.55);
        box-shadow: 0 6px 20px rgba(14, 165, 233, 0.25);
    }

    .icon-wrapper {
        ${tw`flex items-center justify-center w-6 h-6 rounded-lg text-sky-400`}
        background: rgba(14, 165, 233, 0.2);
    }

    .pulse-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #38bdf8;
        box-shadow: 0 0 8px #38bdf8;
    }
`;

const Grid = styled.div`
    ${tw`grid grid-cols-1 lg:grid-cols-2 gap-5 pb-16`}
`;

const SkeletonCard = styled.div`
    height: 170px;
    background: linear-gradient(90deg, hsl(var(--bg-surface)) 25%, hsl(var(--bg-elevated)) 50%, hsl(var(--bg-surface)) 75%);
    background-size: 400px 100%;
    animation: dash-skeleton 1.4s infinite linear;
    border: 1px solid hsl(var(--border));
    border-radius: 16px;
`;

const EmptyState = styled(motion.div)`
    ${tw`col-span-2 flex flex-col items-center justify-center py-24 text-center gap-3`}
    border: 1px dashed hsl(var(--border));
    background: hsl(var(--bg-surface));
    border-radius: 16px;
`;

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');
    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const username = useStoreState((state) => state.user.data!.username);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);
    const [isWorldOpen, setIsWorldOpen] = useState(false);

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined })
    );

    useEffect(() => { setPage(1); }, [showOnlyAdmin]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'} className="!mt-0 sm:!mt-0">
            <style dangerouslySetInnerHTML={{ __html: dashboardStyles }} />

            {/* Banner Section */}
            {(() => {
                const bannerUrl = (window as any).SiteConfiguration?.dashboard_banner;
                if (!bannerUrl) return null;

                const isVideo = bannerUrl.toLowerCase().endsWith('.mp4') || bannerUrl.toLowerCase().endsWith('.webm');

                return (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                        className="relative shadow-2xl mb-12 -mt-4"
                        style={{
                            width: '100vw',
                            position: 'relative',
                            left: '50%',
                            right: '50%',
                            marginLeft: '-50vw',
                            marginRight: '-50vw',
                            aspectRatio: '16/9',
                            backgroundColor: 'hsl(var(--bg-elevated))',
                            borderBottom: '1px solid hsl(var(--border))',
                            maxHeight: '400px'
                        }}
                    >
                        {isVideo ? (
                            <video
                                src={bannerUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={bannerUrl}
                                alt="Dashboard Banner"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </motion.div>
                );
            })()}

            <RootContainer>


                <HeaderSection>
                    <TitleBox>
                        <Title>Hello, <span>{username}</span></Title>
                    </TitleBox>

                    <div css={tw`flex flex-wrap items-center gap-3`}>
                        <DuniaAlxzyTopButton
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.03, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setIsWorldOpen(true)}
                        >
                            <div className="icon-wrapper">
                                <GlobeIcon className="w-4 h-4 text-sky-400" />
                            </div>
                            <span>Masuk Dunia Alxzy</span>
                            <span className="pulse-dot" />
                        </DuniaAlxzyTopButton>

                        {rootAdmin && (
                            <FilterBar
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                            >
                                <FilterLabel>Admin View</FilterLabel>
                                <Switch
                                    name={'show_all_servers'}
                                    defaultChecked={showOnlyAdmin}
                                    onChange={() => setShowOnlyAdmin((s) => !s)}
                                />
                            </FilterBar>
                        )}
                    </div>
                </HeaderSection>

                <AnnounceBar displayLocation="dashboard" />

                <AnimatePresence mode="wait">
                    {!servers ? (
                        <Grid key="skeleton">
                            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                        </Grid>
                    ) : (
                        <Pagination data={servers} onPageSelect={setPage}>
                            {({ items }) =>
                                items.length > 0 ? (
                                    <Grid>
                                        {items.map((server, index) => (
                                            <motion.div
                                                key={server.uuid}
                                                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                                transition={{
                                                    duration: 0.6,
                                                    delay: index * 0.05,
                                                    ease: [0.16, 1, 0.3, 1]
                                                }}
                                            >
                                                <ServerRow server={server} />
                                            </motion.div>
                                        ))}
                                    </Grid>
                                ) : (
                                    <EmptyState
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <span style={{ fontSize: 36, opacity: 0.15, color: 'hsl(var(--text-primary))' }}>◻</span>
                                        <p style={{ color: 'hsl(var(--text-secondary))', fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', margin: 0 }}>
                                            No Servers
                                        </p>
                                        <p style={{ color: 'hsl(var(--text-muted))', fontSize: 12, margin: 0 }}>
                                            Create or assign a server to get started.
                                        </p>
                                    </EmptyState>
                                )
                            }
                        </Pagination>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isWorldOpen && (
                        <DuniaAlxzyOverlay onClose={() => setIsWorldOpen(false)} />
                    )}
                </AnimatePresence>
            </RootContainer>
        </PageContentBlock>
    );
};