import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFileArchive, faFileImport, faFolder, faFileCode, faDatabase, faCogs, faCode, faImage, faFilePdf, faFileWord, faFileExcel, faFilePowerpoint, faFileVideo, faFileAudio, faTerminal } from '@fortawesome/free-solid-svg-icons';
import { encodePathSegments } from '@/helpers';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import { FileObject } from '@/api/server/files/loadDirectory';
import FileDropdownMenu from '@/components/server/files/FileDropdownMenu';
import { ServerContext } from '@/state/server';
import { useLocation, useHistory } from 'react-router-dom';
import tw from 'twin.macro';
import isEqual from 'react-fast-compare';
import SelectFileCheckbox from '@/components/server/files/SelectFileCheckbox';
import { usePermissions } from '@/plugins/usePermissions';
import { join } from 'pathe';
import { bytesToString } from '@/lib/formatters';
import styles from './style.module.css';

const getFileIcon = (name: string, isSymlink: boolean, isArchive: boolean) => {
    if (isSymlink) return { icon: faFileImport, color: 'text-neutral-400' };
    if (isArchive) return { icon: faFileArchive, color: 'text-yellow-500' };
    
    const ext = name.split('.').pop()?.toLowerCase();
    
    switch (ext) {
        // Web
        case 'html': case 'htm': return { icon: faCode, color: 'text-orange-500' };
        case 'css': case 'scss': case 'sass': case 'less': return { icon: faCode, color: 'text-blue-500' };
        case 'js': case 'jsx': case 'mjs': return { icon: faFileCode, color: 'text-yellow-400' };
        case 'ts': case 'tsx': return { icon: faFileCode, color: 'text-blue-400' };
        case 'vue': case 'svelte': return { icon: faCode, color: 'text-green-400' };
        // Languages
        case 'java': case 'jar': case 'class': return { icon: faFileCode, color: 'text-orange-400' };
        case 'py': case 'pyc': case 'pyw': return { icon: faFileCode, color: 'text-yellow-500' };
        case 'php': return { icon: faFileCode, color: 'text-purple-400' };
        case 'rb': case 'go': case 'rs': case 'c': case 'cpp': case 'h': return { icon: faFileCode, color: 'text-cyan-400' };
        case 'cs': return { icon: faFileCode, color: 'text-purple-500' };
        case 'lua': return { icon: faFileCode, color: 'text-indigo-400' };
        // Config / Data
        case 'json': return { icon: faCogs, color: 'text-yellow-300' };
        case 'yml': case 'yaml': return { icon: faCogs, color: 'text-red-400' };
        case 'toml': case 'xml': case 'ini': case 'conf': case 'cfg': case 'properties': case 'env': return { icon: faCogs, color: 'text-gray-400' };
        // Shell / Scripts
        case 'sh': case 'bash': case 'bat': case 'cmd': case 'ps1': return { icon: faTerminal, color: 'text-green-400' };
        // Database
        case 'sql': case 'sqlite': case 'db': return { icon: faDatabase, color: 'text-blue-300' };
        // Docs
        case 'md': case 'txt': case 'log': case 'csv': return { icon: faFileAlt, color: 'text-gray-300' };
        case 'pdf': return { icon: faFilePdf, color: 'text-red-500' };
        case 'doc': case 'docx': return { icon: faFileWord, color: 'text-blue-500' };
        case 'xls': case 'xlsx': return { icon: faFileExcel, color: 'text-green-500' };
        case 'ppt': case 'pptx': return { icon: faFilePowerpoint, color: 'text-orange-500' };
        // Media
        case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg': case 'webp': case 'ico': case 'bmp': return { icon: faImage, color: 'text-pink-400' };
        case 'mp4': case 'avi': case 'mkv': case 'webm': case 'mov': return { icon: faFileVideo, color: 'text-purple-400' };
        case 'mp3': case 'wav': case 'ogg': case 'flac': case 'aac': return { icon: faFileAudio, color: 'text-indigo-400' };
        // Default
        default: return { icon: faFileAlt, color: 'text-gray-400' };
    }
};

const Clickable: React.FC<{ file: FileObject; children: React.ReactNode }> = ({ file, children }) => {
    const [canReadContents] = usePermissions(['file.read-content']);
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const location = useLocation();
    const history = useHistory();

    const routingUrl = `/server/${id}/files${
        file.isFile ? '/edit' : ''
    }#${encodePathSegments(join(directory, file.name))}`;

    const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (!canReadContents && file.isFile) {
            e.preventDefault();
            return;
        }

        if (e.button === 0) {
            e.preventDefault();
            history.push({
                pathname: `/server/${id}/files${
                    file.isFile ? '/edit' : ''
                }`,
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
    const fileIcon = file.isFile ? getFileIcon(file.name, file.isSymlink, file.isArchiveType()) : { icon: faFolder, color: 'text-[#38bdf8]' };
    const isChecked = ServerContext.useStoreState((state) => state.files.selectedFiles.indexOf(file.name) >= 0);

    return (
        <div
            className={`${styles.file_row} ${isListView ? styles.list_view : styles.grid_view} group ${isChecked ? styles.is_selected : ''}`}
            key={file.name}
            onContextMenu={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent(`pterodactyl:files:ctx:${file.key}`, { detail: e.clientX }));
            }}
        >
            {/* Grid view checkbox - hidden by default, shown on hover/selected */}
            {!isListView && (
                <div 
                    className={`absolute top-1.5 left-1.5 z-20 transition-opacity duration-200 ${isChecked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <SelectFileCheckbox name={file.name} />
                </div>
            )}

            {/* List view checkbox */}
            {isListView && (
                <div className={'pl-4 pr-2 flex items-center h-full'}>
                    <SelectFileCheckbox name={file.name} />
                </div>
            )}

            <Clickable file={file}>
                <div className={`flex-shrink-0 ${fileIcon.color} ${isListView ? 'text-xl mr-3' : 'text-2xl'}`}>
                    <FontAwesomeIcon icon={fileIcon.icon} fixedWidth />
                </div>

                <div className={isListView ? 'flex-1 min-w-0' : 'min-w-0 w-full text-center'}>
                    <p className={'text-sm font-medium text-gray-200 truncate'} title={file.name}>
                        {file.name}
                    </p>
                    {file.isFile && (
                        <p className={'text-[10px] text-gray-500 mt-0.5 truncate'}>
                            {bytesToString(file.size)}
                        </p>
                    )}
                </div>

                {isListView && (
                    <div className={'text-xs text-gray-500 ml-auto pl-4 hidden md:block whitespace-nowrap'}>
                        {Math.abs(differenceInHours(file.modifiedAt, new Date())) > 48
                            ? format(file.modifiedAt, 'MMM do, yyyy h:mma')
                            : formatDistanceToNow(file.modifiedAt, { addSuffix: true })}
                    </div>
                )}
            </Clickable>
            
            <div className={`${isListView ? 'flex items-center pr-2' : 'absolute top-1.5 right-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                <FileDropdownMenu file={file} />
            </div>
        </div>
    );
};

export default memo(FileObjectRow, (prevProps, nextProps) => {
    return isEqual(prevProps.file, nextProps.file) && prevProps.isListView === nextProps.isListView;
});
