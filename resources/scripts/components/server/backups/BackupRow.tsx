import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArchive, faEllipsisH, faLock } from '@fortawesome/free-solid-svg-icons';
import { format, formatDistanceToNow } from 'date-fns';
import Spinner from '@/components/elements/Spinner';
import { bytesToString } from '@/lib/formatters';
import Can from '@/components/elements/Can';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import BackupContextMenu from '@/components/server/backups/BackupContextMenu';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import getServerBackups from '@/api/swr/getServerBackups';
import { ServerBackup } from '@/api/server/types';
import { SocketEvent } from '@/components/server/events';

interface Props {
    backup: ServerBackup;
    className?: string;
}

export default ({ backup, className }: Props) => {
    const { mutate } = getServerBackups();

    useWebsocketEvent(`${SocketEvent.BACKUP_COMPLETED}:${backup.uuid}` as SocketEvent, (data) => {
        try {
            const parsed = JSON.parse(data);

            mutate(
                (data) => ({
                    ...data,
                    items: data.items.map((b) =>
                        b.uuid !== backup.uuid
                            ? b
                            : {
                                ...b,
                                isSuccessful: parsed.is_successful || true,
                                checksum: (parsed.checksum_type || '') + ':' + (parsed.checksum || ''),
                                bytes: parsed.file_size || 0,
                                completedAt: new Date(),
                            }
                    ),
                }),
                false
            );
        } catch (e) {
            console.warn(e);
        }
    });

    return (
        <GreyRowBox css={tw`flex-wrap md:flex-nowrap items-center`} className={className}>
            <div css={tw`flex items-center truncate w-full md:flex-1`}>
                <div
                    css={tw`mr-4 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0`}
                    style={{
                        background: backup.isLocked ? 'rgba(245, 158, 11, 0.12)' : 'rgba(14, 165, 233, 0.1)',
                        border: backup.isLocked ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(56, 189, 248, 0.25)',
                        color: backup.isLocked ? '#fbbf24' : '#38bdf8',
                    }}
                >
                    {backup.completedAt !== null ? (
                        backup.isLocked ? (
                            <FontAwesomeIcon icon={faLock} />
                        ) : (
                            <FontAwesomeIcon icon={faArchive} />
                        )
                    ) : (
                        <Spinner size={'small'} />
                    )}
                </div>
                <div css={tw`flex flex-col truncate min-w-0`}>
                    <div css={tw`flex items-center text-sm mb-0.5 gap-2`}>
                        {backup.completedAt !== null && !backup.isSuccessful && (
                            <span className={'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30'}>
                                Failed
                            </span>
                        )}
                        <p css={tw`font-bold break-words truncate m-0`} style={{ color: 'hsl(var(--text-primary))' }}>
                            {backup.name}
                        </p>
                        {backup.completedAt !== null && backup.isSuccessful && (
                            <span
                                className={'hidden sm:inline px-2 py-0.5 rounded-md text-[11px] font-mono border'}
                                style={{
                                    background: 'hsl(var(--bg-surface))',
                                    borderColor: 'hsl(var(--border))',
                                    color: 'hsl(var(--text-secondary))',
                                    fontVariantNumeric: 'tabular-nums',
                                }}
                            >
                                {bytesToString(backup.bytes)}
                            </span>
                        )}
                    </div>
                    <p css={tw`text-xs font-mono truncate m-0`} style={{ color: 'hsl(var(--text-muted))' }}>
                        {backup.checksum || 'Generating checksum...'}
                    </p>
                </div>
            </div>
            <div css={tw`flex-1 md:flex-none md:w-48 mt-4 md:mt-0 md:ml-8 md:text-center`}>
                <p
                    title={format(backup.createdAt, 'ddd, MMMM do, yyyy HH:mm:ss')}
                    css={tw`text-xs font-medium m-0`}
                    style={{ color: 'hsl(var(--text-primary))' }}
                >
                    {formatDistanceToNow(backup.createdAt, { includeSeconds: true, addSuffix: true })}
                </p>
                <p css={tw`text-[10px] uppercase tracking-wider mt-0.5 m-0`} style={{ color: 'hsl(var(--text-muted))' }}>
                    Created
                </p>
            </div>
            <Can action={['backup.download', 'backup.restore', 'backup.delete']} matchAny>
                <div css={tw`mt-4 md:mt-0 ml-6`} style={{ marginRight: '-0.5rem' }}>
                    {!backup.completedAt ? (
                        <div css={tw`p-2 invisible`}>
                            <FontAwesomeIcon icon={faEllipsisH} />
                        </div>
                    ) : (
                        <BackupContextMenu backup={backup} />
                    )}
                </div>
            </Can>
        </GreyRowBox>
    );
};
