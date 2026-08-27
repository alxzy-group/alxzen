import React, { useEffect, useState } from 'react';
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
import style from './style.module.css';

const sortFiles = (files: FileObject[]): FileObject[] => {
    const sortedFiles: FileObject[] = files
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => (a.isFile === b.isFile ? 0 : a.isFile ? 1 : -1));
    return sortedFiles.filter((file, index) => index === 0 || file.name !== sortedFiles[index - 1].name);
};

export default () => {
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const { hash } = useLocation();
    const { data: files, error, mutate } = useFileManagerSwr();
    const [viewMode, setViewMode] = usePersistedState<'grid' | 'list'>('file_manager_view', 'grid');
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const clearFlashes = useStoreActions((actions) => actions.flashes.clearFlashes);
    const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);

    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);
    const selectedFilesLength = ServerContext.useStoreState((state) => state.files.selectedFiles.length);

    useEffect(() => {
        clearFlashes('files');
        setSelectedFiles([]);
        setDirectory(hashToPath(hash));
    }, [hash]);

    useEffect(() => {
        mutate();
    }, [directory]);

    const onSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(e.currentTarget.checked ? files?.map((file) => file.name) || [] : []);
    };

    if (error) {
        return <ServerError message={httpErrorToHuman(error)} onRetry={() => mutate()} />;
    }

    return (
        <ServerContentBlock title={'File Manager'} showFlashKey={'files'}>
            <ErrorBoundary>
                {/* Floating Action Bar (Sticky Top) */}
                <div className={'sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md pb-4 mb-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 pt-2'}>
                    <FileManagerBreadcrumbs
                        renderLeft={
                            <FileActionCheckbox
                                type={'checkbox'}
                                css={tw`mx-4`}
                                checked={selectedFilesLength === (files?.length === 0 ? -1 : files?.length)}
                                onChange={onSelectAllClick}
                            />
                        }
                    />
                    <Can action={'file.create'}>
                        <div className={'flex flex-wrap items-center gap-2 mt-2 md:mt-0 w-full md:w-auto'}>
                            {/* View Mode Toggle */}
                            <div className={'flex items-center space-x-1 bg-[#111] p-1 rounded-lg border border-white/5 md:mr-2 flex-shrink-0'}>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#38bdf8] text-black' : 'text-gray-400 hover:text-white'}`}
                                    title={'Grid View'}
                                >
                                    <svg className={'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#38bdf8] text-black' : 'text-gray-400 hover:text-white'}`}
                                    title={'List View'}
                                >
                                    <svg className={'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                </button>
                            </div>
                            <FileManagerStatus />
                            <div className={'flex flex-1 sm:flex-none items-center gap-2'}>
                                <div className={'flex-1 sm:flex-none'}><NewDirectoryButton /></div>
                                <div className={'flex-1 sm:flex-none'}><UploadButton /></div>
                                <NavLink to={`/server/${id}/files/new${window.location.hash}`} className={'flex-1 sm:flex-none'}>
                                    <Button className={'w-full'}>New File</Button>
                                </NavLink>
                            </div>
                        </div>
                    </Can>
                </div>
            </ErrorBoundary>
            
            {/* Main Content: Files List/Grid */}
            <div className={'w-full'}>
                {!files ? (
                    <Spinner size={'large'} centered />
                ) : (
                    <>
                        {!files.length ? (
                            <p css={tw`text-sm text-neutral-400 text-center`}>This directory seems to be empty.</p>
                        ) : (
                            <CSSTransition classNames={'fade'} timeout={150} appear in>
                                <div>
                                    {files.length > 250 && (
                                        <div css={tw`rounded-2xl bg-yellow-500/20 border border-yellow-500/50 mb-4 p-3`}>
                                            <p css={tw`text-yellow-400 text-sm text-center font-semibold`}>
                                                This directory is too large to display in the browser, limiting the output
                                                to the first 250 files.
                                            </p>
                                        </div>
                                    )}
                                    <div className={viewMode === 'grid' ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3' : 'flex flex-col'}>
                                        {sortFiles(files.slice(0, 250)).map((file) => (
                                            <FileObjectRow key={file.key} file={file} isListView={viewMode === 'list'} />
                                        ))}
                                    </div>
                                    <div className={'mt-6'}>
                                        <MassActionsBar />
                                    </div>
                                </div>
                            </CSSTransition>
                        )}
                    </>
                )}
            </div>
        </ServerContentBlock>
    );
};
