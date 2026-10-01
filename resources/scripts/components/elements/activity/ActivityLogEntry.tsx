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
        <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16,
            padding: '14px 20px',
            borderBottom: '1px solid hsl(var(--border))',
            transition: 'background 0.15s ease',
        }}
        className={'last:border-0 group'}
        onMouseEnter={e => (e.currentTarget.style.background = 'hsl(var(--bg-overlay))')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
            {/* Avatar */}
            <div style={{ flexShrink: 0, marginTop: 2 }} className={'hidden sm:flex'}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid hsl(var(--border))' }}>
                    <Avatar name={actor?.uuid || 'system'} />
                </div>
            </div>
            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Tooltip placement={'top'} content={actor?.email || 'System User'}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>
                            {actor?.username || 'System'}
                        </span>
                    </Tooltip>
                    <span style={{ color: 'hsl(var(--border))' }}>&mdash;</span>
                    <Link
                        to={`#${pathTo({ event: activity.event })}`}
                        style={{ fontSize: '0.8125rem', color: 'hsl(var(--accent))', fontFamily: 'monospace', textDecoration: 'none' }}
                        className={'hover:opacity-80 transition-opacity'}
                    >
                        {activity.event}
                    </Link>
                    <div className={classNames(style.icons)} style={{ color: 'hsl(var(--text-muted))' }}>
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
                <p className={style.description} style={{ color: 'hsl(var(--text-secondary))' }} />
                <p className={style.description}>
                    <Translate ns={'activity'} values={properties} i18nKey={activity.event.replace(':', '.')} />
                </p>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                    {activity.ip && (
                        <span style={{ fontFamily: 'monospace', background: 'hsl(var(--bg-overlay))', padding: '2px 8px', borderRadius: 6, fontSize: '0.6875rem', border: '1px solid hsl(var(--border))' }}>
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
                <div style={{ flexShrink: 0, alignSelf: 'center' }}>
                    <ActivityLogMetaButton meta={activity.properties} />
                </div>
            )}
        </div>
    );
};
