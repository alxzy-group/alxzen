import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileAlt,
    faFileArchive,
    faFileImport,
    faFolder,
    faFileCode,
    faDatabase,
    faCogs,
    faCode,
    faImage,
    faFilePdf,
    faFileWord,
    faFileExcel,
    faFilePowerpoint,
    faFileVideo,
    faFileAudio,
    faTerminal,
} from '@fortawesome/free-solid-svg-icons';
import { encodePathSegments } from '@/helpers';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import { FileObject } from '@/api/server/files/loadDirectory';
import FileDropdownMenu from '@/components/server/files/FileDropdownMenu';
import { ServerContext } from '@/state/server';
import { useLocation, useHistory } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import SelectFileCheckbox from '@/components/server/files/SelectFileCheckbox';
import { usePermissions } from '@/plugins/usePermissions';
import { join } from 'pathe';
import { bytesToString } from '@/lib/formatters';
import styles from './style.module.css';

const getFileIcon = (name: string, isSymlink: boolean, isArchive: boolean) => {
    if (isSymlink) return { icon: faFileImport, color: 'text-gray-400', bg: 'rgba(148, 163, 184, 0.1)' };
    if (isArchive) return { icon: faFileArchive, color: 'text-yellow-400', bg: 'rgba(245, 158, 11, 0.12)' };

    const ext = name.split('.').pop()?.toLowerCase();

    switch (ext) {
        case 'html':
        case 'htm':
            return { icon: faCode, color: 'text-orange-400', bg: 'rgba(249, 115, 22, 0.12)' };
        case 'css':
        case 'scss':
        case 'sass':
        case 'less':
            return { icon: faCode, color: 'text-sky-400', bg: 'rgba(14, 165, 233, 0.12)' };
        case 'js':
        case 'jsx':
        case 'mjs':
            return { icon: faFileCode, color: 'text-yellow-400', bg: 'rgba(234, 179, 8, 0.12)' };
        case 'ts':
        case 'tsx':
            return { icon: faFileCode, color: 'text-blue-400', bg: 'rgba(59, 130, 246, 0.12)' };
        case 'vue':
        case 'svelte':
            return { icon: faCode, color: 'text-green-400', bg: 'rgba(16, 185, 129, 0.12)' };
        case 'java':
        case 'jar':
        case 'class':
            return { icon: faFileCode, color: 'text-orange-400', bg: 'rgba(249, 115, 22, 0.12)' };
        case 'py':
        case 'pyc':
        case 'pyw':
            return { icon: faFileCode, color: 'text-yellow-400', bg: 'rgba(234, 179, 8, 0.12)' };
        case 'php':
        case 'cs':
        case 'lua':
            return { icon: faFileCode, color: 'text-indigo-400', bg: 'rgba(99, 102, 241, 0.12)' };
        case 'rb':
        case 'go':
        case 'rs':
        case 'c':
        case 'cpp':
        case 'h':
            return { icon: faFileCode, color: 'text-cyan-400', bg: 'rgba(6, 182, 212, 0.12)' };
        case 'json':
        case 'yml':
        case 'yaml':
        case 'toml':
        case 'xml':
        case 'ini':
        case 'conf':
        case 'cfg':
        case 'properties':
        case 'env':
            return { icon: faCogs, color: 'text-yellow-300', bg: 'rgba(245, 158, 11, 0.1)' };
        case 'sh':
        case 'bash':
        case 'bat':
        case 'cmd':
        case 'ps1':
            return { icon: faTerminal, color: 'text-green-400', bg: 'rgba(16, 185, 129, 0.12)' };
        case 'sql':
        case 'sqlite':
        case 'db':
            return { icon: faDatabase, color: 'text-sky-400', bg: 'rgba(14, 165, 233, 0.12)' };
        case 'md':
        case 'txt':
        case 'log':
        case 'csv':
            return { icon: faFileAlt, color: 'text-gray-300', bg: 'rgba(148, 163, 184, 0.1)' };
        case 'pdf':
            return { icon: faFilePdf, color: 'text-red-400', bg: 'rgba(239, 68, 68, 0.12)' };
        case 'doc':
        case 'docx':
            return { icon: faFileWord, color: 'text-blue-400', bg: 'rgba(59, 130, 246, 0.12)' };
        case 'xls':
        case 'xlsx':
            return { icon: faFileExcel, color: 'text-green-400', bg: 'rgba(16, 185, 129, 0.12)' };
        case 'ppt':
        case 'pptx':
            return { icon: faFilePowerpoint, color: 'text-orange-400', bg: 'rgba(249, 115, 22, 0.12)' };
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
        case 'webp':
        case 'ico':
        case 'bmp':
            return { icon: faImage, color: 'text-pink-400', bg: 'rgba(236, 72, 153, 0.12)' };
        case 'mp4':
        case 'avi':
        case 'mkv':
        case 'webm':
        case 'mov':
            return { icon: faFileVideo, color: 'text-purple-400', bg: 'rgba(168, 85, 247, 0.12)' };
        case 'mp3':
        case 'wav':
        case 'ogg':
        case 'flac':
        case 'aac':
            return { icon: faFileAudio, color: 'text-indigo-400', bg: 'rgba(99, 102, 241, 0.12)' };
        default:
            return { icon: faFileAlt, color: 'text-gray-400', bg: 'rgba(148, 163, 184, 0.08)' };
    }
};

const Clickable: React.FC<{ file: FileObject; children: React.ReactNode }> = ({ file, children }) => {
    const [canReadContents] = usePermissions(['file.read-content']);
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const location = useLocation();
    const history = useHistory();

    const routingUrl = `/server/${id}/files${file.isFile ? '/edit' : ''}#${encodePathSegments(
        join(directory, file.name)
    )}`;

    const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (!canReadContents && file.isFile) {
            e.preventDefault();
            return;
        }

        if (e.button === 0) {
            e.preventDefault();
            history.push({
                pathname: `/server/${id}/files${file.isFile ? '/edit' : ''}`,
                hash: encodePathSegments(join(directory, file.name)),
                state: file.isFile ? { ...location.state, backLink: location } : location.state,
            });
        }
    };

    return (
        <a
            href={routingUrl}
            onClick={handleNavigate}
            className={`${styles.details} ${canReadContents || !file.isFile ? '' : 'unclickable'}`}
        >
            {children}
        </a>
    );
};

const FileObjectRow = ({ file, isListView }: { file: FileObject; isListView?: boolean }) => {
    const fileIcon = file.isFile
        ? getFileIcon(file.name, file.isSymlink, file.isArchiveType())
        : { icon: faFolder, color: 'text-sky-400', bg: 'rgba(14, 165, 233, 0.12)' };
    const isChecked = ServerContext.useStoreState((state) => state.files.selectedFiles.indexOf(file.name) >= 0);

    return (
        <div
            className={`${styles.file_row} ${isListView ? styles.list_view : styles.grid_view} group ${isChecked ? styles.is_selected : ''
                }`}
            key={file.name}
            onContextMenu={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent(`pterodactyl:files:ctx:${file.key}`, { detail: e.clientX }));
            }}
        >
            {!isListView && (
                <div
                    className={`absolute top-1.5 left-1.5 z-20 transition-opacity duration-150 ${isChecked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <SelectFileCheckbox name={file.name} />
                </div>
            )}

            {isListView && (
                <div className={'pl-3 pr-2 flex items-center h-full'}>
                    <SelectFileCheckbox name={file.name} />
                </div>
            )}

            <Clickable file={file}>
                <div
                    className={`flex items-center justify-center rounded-xl flex-shrink-0 ${fileIcon.color} ${isListView ? 'w-9 h-9 text-base mr-3' : 'w-11 h-11 text-xl'
                        }`}
                    style={{
                        background: fileIcon.bg,
                        border: '1px solid hsl(var(--border) / 0.6)',
                    }}
                >
                    <FontAwesomeIcon icon={fileIcon.icon} fixedWidth />
                </div>

                <div className={isListView ? 'flex-1 min-w-0' : 'min-w-0 w-full text-center'}>
                    <p className={'text-sm font-semibold truncate text-[hsl(var(--text-primary))] m-0'} title={file.name}>
                        {file.name}
                    </p>
                    {!isListView && file.isFile && (
                        <p className={'text-[10px] font-mono text-gray-500 mt-0.5 truncate m-0'}>
                            {bytesToString(file.size)}
                        </p>
                    )}
                </div>

                {isListView && file.isFile && (
                    <span
                        className={'hidden sm:inline-block px-2 py-0.5 rounded-md text-[11px] font-mono ml-3 border'}
                        style={{
                            background: 'hsl(var(--bg-elevated))',
                            borderColor: 'hsl(var(--border))',
                            color: 'hsl(var(--text-secondary))',
                            fontVariantNumeric: 'tabular-nums',
                        }}
                    >
                        {bytesToString(file.size)}
                    </span>
                )}

                {isListView && (
                    <div className={'text-xs text-gray-500 ml-4 pl-2 hidden md:block whitespace-nowrap'}>
                        {Math.abs(differenceInHours(file.modifiedAt, new Date())) > 48
                            ? format(file.modifiedAt, 'MMM do, yyyy h:mma')
                            : formatDistanceToNow(file.modifiedAt, { addSuffix: true })}
                    </div>
                )}
            </Clickable>

            <div
                className={`${isListView
                        ? 'flex items-center pr-2'
                        : 'absolute top-1.5 right-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity'
                    }`}
            >
                <FileDropdownMenu file={file} />
            </div>
        </div>
    );
};

export default memo(FileObjectRow, (prevProps, nextProps) => {
    return isEqual(prevProps.file, nextProps.file) && prevProps.isListView === nextProps.isListView;
});
