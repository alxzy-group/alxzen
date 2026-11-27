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
import AnnounceBar from '@/components/elements/AnnounceBar';
import { AnimatePresence } from 'framer-motion';
import { GlobeIcon, EyeIcon } from '@heroicons/react/solid';

const DuniaAlxzyOverlay = React.lazy(
    () => import(/* webpackChunkName: "dunia-alxzy" */ '@/components/alxzy-theme/DuniaAlxzy/DuniaAlxzyOverlay')
);
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faList, faSearch, faThLarge, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ip } from '@/lib/formatters';

const dashboardStyles = `
@keyframes dash-title-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
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
    ${tw`flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-5`}
`;

const TitleBox = styled.div`
    ${tw`text-left`}
    animation: dash-title-in 0.35s ease both;
`;

const Title = styled.h1`
    ${tw`text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-1`}
    color: hsl(var(--text-primary));
    letter-spacing: -2px;
    span {
        background: linear-gradient(90deg, #38bdf8, #0ea5e9);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
`;

const FilterBar = styled.div`
    ${tw`flex items-center gap-3.5 px-4 py-2`}
    background: hsl(var(--bg-elevated));
    border: 1px solid hsl(var(--border));
    border-radius: 12px;
`;

const FilterLabel = styled.span`
    ${tw`text-[11px] font-bold uppercase tracking-widest`}
    color: hsl(var(--accent));
`;

const DuniaAlxzyTopButton = styled.button`
    ${tw`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 outline-none cursor-pointer`}
    background: linear-gradient(135deg, rgba(14, 165, 233, 0.18) 0%, rgba(2, 132, 199, 0.28) 100%);
    border: 1px solid rgba(56, 189, 248, 0.35);
    box-shadow: 0 4px 14px rgba(14, 165, 233, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.12);
    color: #ffffff;
    transform: translateZ(0);

    &:hover {
        background: linear-gradient(135deg, rgba(14, 165, 233, 0.28) 0%, rgba(2, 132, 199, 0.42) 100%);
        border-color: rgba(56, 189, 248, 0.55);
        transform: translateY(-1px);
    }

    &:active {
        transform: scale(0.98);
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

const CommandToolbar = styled.div`
    ${tw`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-2.5 rounded-2xl`}
    background: hsl(var(--bg-surface) / 0.85);
    border: 1px solid hsl(var(--border) / 0.85);
`;

const SearchInputBox = styled.div`
    ${tw`relative flex items-center flex-1 max-w-md`}

    input {
        ${tw`w-full pl-9 pr-8 py-2 rounded-xl text-xs font-medium transition-colors duration-150 outline-none`}
        background: hsl(var(--bg-elevated));
        border: 1px solid hsl(var(--border));
        color: hsl(var(--text-primary));

        &::placeholder {
            color: hsl(var(--text-muted));
        }

        &:focus {
            border-color: rgba(56, 189, 248, 0.6);
            box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.12);
        }
    }
`;

const SegmentedGroup = styled.div`
    ${tw`flex items-center gap-1 p-1 rounded-xl`}
    background: hsl(var(--bg-elevated));
    border: 1px solid hsl(var(--border));
`;

const ToolbarIconButton = styled.button<{ $active?: boolean }>`
    ${tw`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors duration-150 cursor-pointer outline-none border`}
    background: ${({ $active }) => ($active ? 'rgba(14, 165, 233, 0.16)' : 'transparent')};
    border-color: ${({ $active }) => ($active ? 'rgba(56, 189, 248, 0.4)' : 'transparent')};
    color: ${({ $active }) => ($active ? '#38bdf8' : 'hsl(var(--text-muted))')};

    &:hover {
        color: ${({ $active }) => ($active ? '#38bdf8' : 'hsl(var(--text-primary))')};
        background: ${({ $active }) => ($active ? 'rgba(14, 165, 233, 0.2)' : 'hsl(var(--bg-surface))')};
    }
`;

const Grid = styled.div`
    ${tw`grid grid-cols-1 lg:grid-cols-2 gap-5 pb-16`}
`;

const ListStack = styled.div`
    ${tw`flex flex-col gap-3 pb-16`}
`;

const SkeletonCard = styled.div`
    height: 176px;
    background: linear-gradient(90deg, hsl(var(--bg-surface)) 25%, hsl(var(--bg-elevated)) 50%, hsl(var(--bg-surface)) 75%);
    background-size: 400px 100%;
    animation: dash-skeleton 1.4s infinite linear;
    border: 1px solid hsl(var(--border));
    border-radius: 16px;
`;

const EmptyStateBox = styled.div`
    ${tw`col-span-2 flex flex-col items-center justify-center py-20 px-6 text-center gap-3`}
    border: 1px dashed hsl(var(--border));
    background: hsl(var(--bg-surface));
    border-radius: 16px;
`;

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');
    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const [filterQuery, setFilterQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(filterQuery.trim());
        }, 280);
        return () => clearTimeout(timer);
    }, [filterQuery]);

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const username = useStoreState((state) => state.user.data!.username);
    const isOwner = useStoreState((state) =>
        Boolean(
            (state.user.data as any)?.isOwner ||
                (state.user.data as any)?.is_owner ||
                (window as any).PterodactylUser?.is_owner ||
                (window as any).PterodactylUser?.isOwner
        )
    );
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);
    const [viewMode, setViewMode] = usePersistedState<'grid' | 'list'>(`${uuid}:dashboard_view`, 'grid');
    const [maskIp, setMaskIp] = usePersistedState<boolean>(`${uuid}:mask_ip`, false);
    const [isWorldOpen, setIsWorldOpen] = useState(false);

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && isOwner, page, debouncedQuery],
        () =>
            getServers({
                page,
                query: debouncedQuery || undefined,
                type: showOnlyAdmin && isOwner ? 'admin' : undefined,
            })
    );

    useEffect(() => {
        setPage(1);
    }, [showOnlyAdmin, debouncedQuery]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'} className="!mt-0 sm:!mt-0">
            <style dangerouslySetInnerHTML={{ __html: dashboardStyles }} />

            {(() => {
                const bannerUrl = (window as any).SiteConfiguration?.dashboard_banner;
                if (!bannerUrl) return null;

                const isVideo = bannerUrl.toLowerCase().endsWith('.mp4') || bannerUrl.toLowerCase().endsWith('.webm');

                return (
                    <div
                        className="relative shadow-2xl mb-10 -mt-4"
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
                            maxHeight: '380px',
                        }}
                    >
                        {isVideo ? (
                            <video src={bannerUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        ) : (
                            <img src={bannerUrl} alt="Dashboard Banner" className="w-full h-full object-cover" />
                        )}
                    </div>
                );
            })()}

            <RootContainer>
                <HeaderSection>
                    <TitleBox>
                        <div css={tw`flex items-center gap-2 mb-2 flex-wrap`}>
                            <span
                                css={tw`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider`}
                                style={{
                                    background: 'rgba(14, 165, 233, 0.14)',
                                    border: '1px solid rgba(56, 189, 248, 0.35)',
                                    color: '#38bdf8',
                                }}
                            >
                                <span css={tw`w-1.5 h-1.5 rounded-full bg-sky-400`} />
                                Cloud Workspace
                            </span>
                            {servers && (
                                <span
                                    css={tw`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold`}
                                    style={{
                                        background: 'hsl(var(--bg-elevated))',
                                        border: '1px solid hsl(var(--border))',
                                        color: 'hsl(var(--text-secondary))',
                                    }}
                                >
                                    {servers.pagination.total} {servers.pagination.total === 1 ? 'Instance' : 'Instances'}
                                </span>
                            )}
                        </div>
                        <Title>
                            Hello, <span>{username}</span>
                        </Title>
                    </TitleBox>

                    <div css={tw`flex flex-wrap items-center gap-3`}>
                        <DuniaAlxzyTopButton onClick={() => setIsWorldOpen(true)}>
                            <div className="icon-wrapper">
                                <GlobeIcon className="w-4 h-4 text-sky-400" />
                            </div>
                            <span>Masuk Dunia Alxzy</span>
                            <span className="pulse-dot" />
                        </DuniaAlxzyTopButton>

                        {isOwner && (
                            <FilterBar>
                                <div css={tw`flex items-center gap-1.5`}>
                                    <EyeIcon className="w-4 h-4 text-sky-400" />
                                    <FilterLabel>Lihat Server Lain</FilterLabel>
                                </div>
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

                {/* Lightweight Cloud Command Toolbar: Instant Filter + IP Privacy Mask + Grid/List Toggle */}
                {servers && (servers.items.length > 0 || filterQuery.trim().length > 0) && (
                    <CommandToolbar>
                        <SearchInputBox>
                            <FontAwesomeIcon
                                icon={faSearch}
                                style={{
                                    position: 'absolute',
                                    left: 12,
                                    fontSize: 12,
                                    color: 'hsl(var(--text-muted))',
                                    pointerEvents: 'none',
                                }}
                            />
                            <input
                                type="text"
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                                placeholder="Filter server name, ID, node, or IP..."
                            />
                            {filterQuery && (
                                <button
                                    type="button"
                                    onClick={() => setFilterQuery('')}
                                    style={{
                                        position: 'absolute',
                                        right: 10,
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'hsl(var(--text-muted))',
                                        cursor: 'pointer',
                                        fontSize: 12,
                                    }}
                                    title="Clear filter"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            )}
                        </SearchInputBox>

                        <div css={tw`flex items-center gap-2 flex-wrap`}>
                            <ToolbarIconButton
                                type="button"
                                $active={maskIp}
                                onClick={() => setMaskIp((m) => !m)}
                                title={maskIp ? 'Show IP addresses' : 'Hide IP addresses (Streamer Privacy Mode)'}
                                style={{
                                    background: maskIp ? 'rgba(14, 165, 233, 0.14)' : 'hsl(var(--bg-elevated))',
                                    borderColor: maskIp ? 'rgba(56, 189, 248, 0.4)' : 'hsl(var(--border))',
                                }}
                            >
                                <FontAwesomeIcon icon={maskIp ? faEyeSlash : faEye} />
                                <span>{maskIp ? 'IP Hidden' : 'Hide IP'}</span>
                            </ToolbarIconButton>

                            <SegmentedGroup>
                                <ToolbarIconButton
                                    type="button"
                                    $active={viewMode === 'grid'}
                                    onClick={() => setViewMode('grid')}
                                    title="Grid Card View"
                                >
                                    <FontAwesomeIcon icon={faThLarge} />
                                    <span css={tw`hidden sm:inline`}>Grid</span>
                                </ToolbarIconButton>
                                <ToolbarIconButton
                                    type="button"
                                    $active={viewMode === 'list'}
                                    onClick={() => setViewMode('list')}
                                    title="Compact List View"
                                >
                                    <FontAwesomeIcon icon={faList} />
                                    <span css={tw`hidden sm:inline`}>List</span>
                                </ToolbarIconButton>
                            </SegmentedGroup>
                        </div>
                    </CommandToolbar>
                )}

                {!servers ? (
                    <Grid key="skeleton">
                        {[1, 2, 3, 4].map((i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </Grid>
                ) : (
                    <Pagination data={servers} onPageSelect={setPage}>
                        {({ items }) => {
                            const q = filterQuery.trim().toLowerCase();
                            const visibleItems = q
                                ? items.filter((s) => {
                                      const alloc = s.allocations.find((a) => a.isDefault);
                                      const addr = `${alloc?.alias || ip(alloc?.ip || '')}:${alloc?.port || ''}`;
                                      return (
                                          s.name.toLowerCase().includes(q) ||
                                          s.id.toLowerCase().includes(q) ||
                                          (s.node && s.node.toLowerCase().includes(q)) ||
                                          addr.toLowerCase().includes(q)
                                      );
                                  })
                                : items;

                            if (visibleItems.length === 0) {
                                if (filterQuery.trim().length > 0) {
                                    return (
                                        <EmptyStateBox>
                                            <FontAwesomeIcon
                                                icon={faSearch}
                                                style={{ fontSize: 24, color: '#38bdf8', opacity: 0.7 }}
                                            />
                                            <p
                                                style={{
                                                    color: 'hsl(var(--text-primary))',
                                                    fontWeight: 700,
                                                    fontSize: 14,
                                                    margin: 0,
                                                }}
                                            >
                                                No matching instances for &ldquo;{filterQuery}&rdquo;
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setFilterQuery('')}
                                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition-colors cursor-pointer"
                                            >
                                                Reset Filter
                                            </button>
                                        </EmptyStateBox>
                                    );
                                }

                                return (
                                    <EmptyStateBox>
                                        <span style={{ fontSize: 36, opacity: 0.18, color: 'hsl(var(--text-primary))' }}>
                                            ◻
                                        </span>
                                        <p
                                            style={{
                                                color: 'hsl(var(--text-secondary))',
                                                fontWeight: 700,
                                                fontSize: 13,
                                                letterSpacing: 1,
                                                textTransform: 'uppercase',
                                                margin: 0,
                                            }}
                                        >
                                            No Servers
                                        </p>
                                        <p style={{ color: 'hsl(var(--text-muted))', fontSize: 12, margin: 0 }}>
                                            Create or assign a server to get started.
                                        </p>
                                    </EmptyStateBox>
                                );
                            }

                            const LayoutWrapper = viewMode === 'list' ? ListStack : Grid;

                            return (
                                <LayoutWrapper>
                                    {visibleItems.map((server) => (
                                        <ServerRow
                                            key={server.uuid}
                                            server={server}
                                            viewMode={viewMode}
                                            maskIp={maskIp}
                                        />
                                    ))}
                                </LayoutWrapper>
                            );
                        }}
                    </Pagination>
                )}

                <AnimatePresence>
                    {isWorldOpen && (
                        <React.Suspense fallback={null}>
                            <DuniaAlxzyOverlay onClose={() => setIsWorldOpen(false)} />
                        </React.Suspense>
                    )}
                </AnimatePresence>
            </RootContainer>
        </PageContentBlock>
    );
};
