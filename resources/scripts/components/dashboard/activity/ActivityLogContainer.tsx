import React, { useEffect, useState } from 'react';
import { ActivityLogFilters, useActivityLogs } from '@/api/account/activity';
import { useFlashKey } from '@/plugins/useFlash';
import PageContentBlock from '@/components/elements/PageContentBlock';
import FlashMessageRender from '@/components/FlashMessageRender';
import { Link } from 'react-router-dom';
import PaginationFooter from '@/components/elements/table/PaginationFooter';
import { DesktopComputerIcon, XCircleIcon } from '@heroicons/react/solid';
import Spinner from '@/components/elements/Spinner';
import { styles as btnStyles } from '@/components/elements/button/index';
import classNames from 'classnames';
import ActivityLogEntry from '@/components/elements/activity/ActivityLogEntry';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import useLocationHash from '@/plugins/useLocationHash';
import PageHeader from '@/components/elements/PageHeader';
import EmptyState from '@/components/elements/EmptyState';
import { faHistory } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const { hash } = useLocationHash();
    const { clearAndAddHttpError } = useFlashKey('account');
    const [filters, setFilters] = useState<ActivityLogFilters>({ page: 1, sorts: { timestamp: -1 } });
    const { data, isValidating, error } = useActivityLogs(filters, {
        revalidateOnMount: true,
        revalidateOnFocus: false,
    });

    useEffect(() => {
        setFilters((value) => ({ ...value, filters: { ip: hash.ip, event: hash.event } }));
    }, [hash]);

    useEffect(() => {
        clearAndAddHttpError(error);
    }, [error]);

    return (
        <PageContentBlock title={'Account Activity Log'}>
            <PageHeader
                icon={faHistory}
                title={'Account Activity Log'}
                description={'Review sign-in sessions, API credential updates, and security audit history.'}
                badge={data ? `${data.pagination.total} Events` : undefined}
                actions={
                    (filters.filters?.event || filters.filters?.ip) ? (
                        <Link
                            to={'#'}
                            className={classNames(btnStyles.button, btnStyles.text, 'w-full sm:w-auto')}
                            onClick={() => setFilters((value) => ({ ...value, filters: {} }))}
                        >
                            Clear Filters <XCircleIcon className={'w-4 h-4 ml-2'} />
                        </Link>
                    ) : undefined
                }
            />
            <FlashMessageRender byKey={'account'} />
            {!data && isValidating ? (
                <Spinner centered />
            ) : data?.items.length === 0 ? (
                <EmptyState
                    icon={faHistory}
                    title={'No Activity Recorded'}
                    description={'No account security events match your current filters.'}
                />
            ) : (
                <div
                    className={'rounded-2xl shadow-xl overflow-hidden'}
                    style={{
                        background: 'hsl(var(--bg-elevated))',
                        border: '1px solid hsl(var(--border))',
                    }}
                >
                    {data?.items.map((activity) => (
                        <ActivityLogEntry key={activity.id} activity={activity}>
                            {typeof activity.properties.useragent === 'string' && (
                                <Tooltip content={activity.properties.useragent} placement={'top'}>
                                    <span>
                                        <DesktopComputerIcon />
                                    </span>
                                </Tooltip>
                            )}
                        </ActivityLogEntry>
                    ))}
                </div>
            )}
            {data && (
                <div className={'mt-4'}>
                    <PaginationFooter
                        pagination={data.pagination}
                        onPageSelect={(page) => setFilters((value) => ({ ...value, page }))}
                    />
                </div>
            )}
        </PageContentBlock>
    );
};
