import React, { useEffect, useMemo, useState } from 'react';
import { httpErrorToHuman } from '@/api/http';
import { CSSTransition } from 'react-transition-group';
import Spinner from '@/components/elements/Spinner';
import FileObjectRow from '@/components/server/files/FileObjectRow';
import FileManagerBreadcrumbs from '@/components/server/files/FileManagerBreadcrumbs';
import { FileObject } from '@/api/server/files/loadDirectory';
import NewDirectoryButton from '@/components/server/files/NewDirectoryButton';
import { NavLink, useLocation } from 'react-router-dom';
import Can from '@/components/elements/Can';
import { ServerError } from '@/components/elements/ScreenBlock';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { ServerContext } from '@/state/server';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import FileManagerStatus from '@/components/server/files/FileManagerStatus';
import MassActionsBar from '@/components/server/files/MassActionsBar';
import UploadButton from '@/components/server/files/UploadButton';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { useStoreActions } from '@/state/hooks';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { FileActionCheckbox } from '@/components/server/files/SelectFileCheckbox';
import { hashToPath } from '@/helpers';
import { usePersistedState } from '@/plugins/usePersistedState';
import PageHeader from '@/components/elements/PageHeader';
import EmptyState from '@/components/elements/EmptyState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

type SortField = 'name' | 'size' | 'modified';

const sortFiles = (files: FileObject[], sortBy: SortField): FileObject[] => {
    const sorted = [...files].sort((a, b) => {
        if (a.isFile !== b.isFile) {
            return a.isFile ? 1 : -1;
        }
        if (sortBy === 'size') {
            return b.size - a.size || a.name.localeCompare(b.name);
        }
        if (sortBy === 'modified') {
            return b.modifiedAt.getTime() - a.modifiedAt.getTime() || a.name.localeCompare(b.name);
        }
        return a.name.localeCompare(b.name);
    });

    return sorted.filter((file, index) => index === 0 || file.name !== sorted[index - 1].name);
};

export default () => {
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const { hash } = useLocation();
    const { data: files, error, mutate } = useFileManagerSwr();
    const [viewMode, setViewMode] = usePersistedState<'grid' | 'list'>('file_manager_view', 'grid');
    const [sortBy, setSortBy] = usePersistedState<SortField>('file_manager_sort', 'name');
    const [searchQuery, setSearchQuery] = useState('');

    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const clearFlashes = useStoreActions((actions) => actions.flashes.clearFlashes);
    const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);

    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);
    const selectedFilesLength = ServerContext.useStoreState((state) => state.files.selectedFiles.length);

    useEffect(() => {
        clearFlashes('files');
        setSelectedFiles([]);
        setSearchQuery('');
        setDirectory(hashToPath(hash));
    }, [hash]);

    useEffect(() => {
        mutate();
    }, [directory]);

    const filteredFiles = useMemo(() => {
        if (!files) return [];
        const q = searchQuery.trim().toLowerCase();
        const base = q ? files.filter((f) => f.name.toLowerCase().includes(q)) : files;
        return sortFiles(base, sortBy);
    }, [files, searchQuery, sortBy]);

    const onSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(e.currentTarget.checked ? filteredFiles.map((file) => file.name) : []);
    };

    if (error) {
        return <ServerError message={httpErrorToHuman(error)} onRetry={() => mutate()} />;
    }

    const headerBadge = files
        ? searchQuery.trim()
            ? `${filteredFiles.length} / ${files.length} Shown`
            : `${files.length} Items`
        : undefined;

    return (
        <ServerContentBlock title={'File Manager'} showFlashKey={'files'}>
            <PageHeader
                icon={faFolderOpen}
                title={'File Manager'}
                description={'Browse, filter, edit, upload, and archive container files.'}
                badge={headerBadge}
            />
            <ErrorBoundary>
                <div
                    style={{
                        position: 'sticky',
                        top: '72px',
                        zIndex: 30,
                        background: 'hsl(var(--bg-elevated))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '16px',
                        padding: '10px 14px',
                        marginBottom: '16px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                    }}
                >
                    <FileManagerBreadcrumbs
                        renderLeft={
                            <FileActionCheckbox
                                type={'checkbox'}
                                css={tw`mx-3`}
                                checked={
                                    filteredFiles.length > 0 && selectedFilesLength === filteredFiles.length
                                }
                                onChange={onSelectAllClick}
                            />
                        }
                    />
                    <div className={'flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end'}>
                        {/* In-Directory Filter Input */}
                        <div className={'relative flex items-center flex-1 sm:flex-none sm:w-44'}>
                            <FontAwesomeIcon
                                icon={faSearch}
                                style={{
                                    position: 'absolute',
                                    left: 10,
                                    fontSize: 11,
                                    color: 'hsl(var(--text-muted))',
                                    pointerEvents: 'none',
                                }}
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Filter files..."
                                className={'w-full pl-7 pr-7 py-1.5 rounded-lg text-xs outline-none transition-colors'}
                                style={{
                                    background: 'hsl(var(--bg-surface))',
                                    border: '1px solid hsl(var(--border))',
                                    color: 'hsl(var(--text-primary))',
                                }}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        position: 'absolute',
                                        right: 8,
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'hsl(var(--text-muted))',
                                        cursor: 'pointer',
                                        fontSize: 11,
                                    }}
                                    title="Clear filter"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            )}
                        </div>

                        {/* Sort Selector */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortField)}
                            className={'py-1.5 px-2.5 rounded-lg text-xs font-medium outline-none cursor-pointer'}
                            style={{
                                background: 'hsl(var(--bg-surface))',
                                border: '1px solid hsl(var(--border))',
                                color: 'hsl(var(--text-secondary))',
                            }}
                            title="Sort files by"
                        >
                            <option value="name">Sort: Name</option>
                            <option value="size">Sort: Size</option>
                            <option value="modified">Sort: Modified</option>
                        </select>

                        {/* Grid / List View Switcher */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                background: 'hsl(var(--bg-surface))',
                                padding: 3,
                                borderRadius: 10,
                                border: '1px solid hsl(var(--border))',
                                flexShrink: 0,
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                style={{
                                    padding: '5px 8px',
                                    borderRadius: 7,
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: viewMode === 'grid' ? 'hsl(var(--accent))' : 'transparent',
                                    color: viewMode === 'grid' ? '#fff' : 'hsl(var(--text-muted))',
                                    transition: 'all 0.15s ease',
                                }}
                                title={'Grid View'}
                            >
                                <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                    />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                style={{
                                    padding: '5px 8px',
                                    borderRadius: 7,
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: viewMode === 'list' ? 'hsl(var(--accent))' : 'transparent',
                                    color: viewMode === 'list' ? '#fff' : 'hsl(var(--text-muted))',
                                    transition: 'all 0.15s ease',
                                }}
                                title={'List View'}
                            >
                                <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>

                        <Can action={'file.create'}>
                            <FileManagerStatus />
                            <div className={'flex flex-1 sm:flex-none items-center gap-2'}>
                                <div className={'flex-1 sm:flex-none'}>
                                    <NewDirectoryButton />
                                </div>
                                <div className={'flex-1 sm:flex-none'}>
                                    <UploadButton />
                                </div>
                                <NavLink to={`/server/${id}/files/new${window.location.hash}`} className={'flex-1 sm:flex-none'}>
                                    <Button className={'w-full'}>New File</Button>
                                </NavLink>
                            </div>
                        </Can>
                    </div>
                </div>
            </ErrorBoundary>

            <div className={'w-full'}>
                {!files ? (
                    <Spinner size={'large'} centered />
                ) : !files.length ? (
                    <EmptyState
                        icon={faFolderOpen}
                        title={'Empty Directory'}
                        description={'No files or folders exist in this directory yet.'}
                    />
                ) : !filteredFiles.length ? (
                    <EmptyState
                        icon={faSearch}
                        title={`No matches for "${searchQuery}"`}
                        description={'Try another search term or clear the filter to view all files in this folder.'}
                    >
                        <Button type={'button'} onClick={() => setSearchQuery('')}>
                            Clear Filter
                        </Button>
                    </EmptyState>
                ) : (
                    <CSSTransition classNames={'fade'} timeout={150} appear in>
                        <div>
                            {filteredFiles.length > 250 && (
                                <div css={tw`rounded-2xl bg-yellow-500/20 border border-yellow-500/50 mb-4 p-3`}>
                                    <p css={tw`text-yellow-400 text-sm text-center font-semibold`}>
                                        This directory is too large to display in the browser, limiting the output to
                                        the first 250 files.
                                    </p>
                                </div>
                            )}
                            <div
                                className={
                                    viewMode === 'grid'
                                        ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3'
                                        : 'flex flex-col'
                                }
                            >
                                {filteredFiles.slice(0, 250).map((file) => (
                                    <FileObjectRow key={file.key} file={file} isListView={viewMode === 'list'} />
                                ))}
                            </div>
                            <div className={'mt-6'}>
                                <MassActionsBar />
                            </div>
                        </div>
                    </CSSTransition>
                )}
            </div>
        </ServerContentBlock>
    );
};
