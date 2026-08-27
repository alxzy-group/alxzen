import React from 'react';
import { Link } from 'react-router-dom';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Translate from '@/components/elements/Translate';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { ActivityLog } from '@definitions/user';
import ActivityLogMetaButton from '@/components/elements/activity/ActivityLogMetaButton';
import { FolderOpenIcon, TerminalIcon } from '@heroicons/react/solid';
import classNames from 'classnames';
import style from './style.module.css';
import Avatar from '@/components/Avatar';
import useLocationHash from '@/plugins/useLocationHash';
import { getObjectKeys, isObject } from '@/lib/objects';

interface Props {
    activity: ActivityLog;
    children?: React.ReactNode;
}

function wrapProperties(value: unknown): any {
    if (value === null || typeof value === 'string' || typeof value === 'number') {
        return `<strong>${String(value)}</strong>`;
    }

    if (isObject(value)) {
        return getObjectKeys(value).reduce((obj, key) => {
            if (key === 'count' || (typeof key === 'string' && key.endsWith('_count'))) {
                return { ...obj, [key]: value[key] };
            }
            return { ...obj, [key]: wrapProperties(value[key]) };
        }, {} as Record<string, unknown>);
    }

    if (Array.isArray(value)) {
        return value.map(wrapProperties);
    }

    return value;
}

export default ({ activity, children }: Props) => {
    const { pathTo } = useLocationHash();
    const actor = activity.relationships.actor;
    const properties = wrapProperties(activity.properties);

    return (
        <div className={'flex items-start gap-4 px-5 py-4 border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.02] group'}>
            {/* Avatar */}
            <div className={'hidden sm:flex items-center justify-center flex-shrink-0 mt-0.5'}>
                <div className={'w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/10'}>
                    <Avatar name={actor?.uuid || 'system'} />
                </div>
            </div>
            {/* Content */}
            <div className={'flex-1 min-w-0'}>
                <div className={'flex items-center gap-2 flex-wrap'}>
                    <Tooltip placement={'top'} content={actor?.email || 'System User'}>
                        <span className={'text-sm font-semibold text-gray-100'}>{actor?.username || 'System'}</span>
                    </Tooltip>
                    <span className={'text-gray-600'}>&mdash;</span>
                    <Link
                        to={`#${pathTo({ event: activity.event })}`}
                        className={'text-sm text-[#38bdf8] hover:text-[#7dd3fc] transition-colors font-mono'}
                    >
                        {activity.event}
                    </Link>
                    <div className={classNames(style.icons, 'group-hover:text-gray-300')}>
                        {activity.isApi && (
                            <Tooltip placement={'top'} content={'Using API Key'}>
                                <TerminalIcon />
                            </Tooltip>
                        )}
                        {activity.event.startsWith('server:sftp.') && (
                            <Tooltip placement={'top'} content={'Using SFTP'}>
                                <FolderOpenIcon />
                            </Tooltip>
                        )}
                        {children}
                    </div>
                </div>
                <p className={style.description}>
                    <Translate ns={'activity'} values={properties} i18nKey={activity.event.replace(':', '.')} />
                </p>
                <div className={'mt-1.5 flex items-center gap-2 text-xs text-gray-500'}>
                    {activity.ip && (
                        <span className={'font-mono bg-white/5 px-1.5 py-0.5 rounded text-[11px]'}>
                            {activity.ip}
                        </span>
                    )}
                    <Tooltip placement={'right'} content={format(activity.timestamp, 'MMM do, yyyy H:mm:ss')}>
                        <span>{formatDistanceToNowStrict(activity.timestamp, { addSuffix: true })}</span>
                    </Tooltip>
                </div>
            </div>
            {/* Meta button */}
            {activity.hasAdditionalMetadata && (
                <div className={'flex-shrink-0 self-center'}>
                    <ActivityLogMetaButton meta={activity.properties} />
                </div>
            )}
        </div>
    );
};
