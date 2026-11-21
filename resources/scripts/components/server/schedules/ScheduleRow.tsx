import React from 'react';
import { Schedule } from '@/api/server/schedules/getServerSchedules';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import tw from 'twin.macro';
import ScheduleCronRow from '@/components/server/schedules/ScheduleCronRow';

const StatusPill = ({ isActive, isProcessing }: { isActive: boolean; isProcessing: boolean }) => {
    if (isProcessing) {
        return (
            <span className={'px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/30'}>
                Processing
            </span>
        );
    }

    if (isActive) {
        return (
            <span className={'px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'}>
                Active
            </span>
        );
    }

    return (
        <span
            className={'px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border'}
            style={{
                background: 'hsl(var(--bg-surface))',
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--text-muted))',
            }}
        >
            Inactive
        </span>
    );
};

export default ({ schedule }: { schedule: Schedule }) => (
    <>
        <div
            css={tw`hidden md:flex w-9 h-9 rounded-xl items-center justify-center flex-shrink-0`}
            style={{
                background: 'rgba(14, 165, 233, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                color: '#38bdf8',
            }}
        >
            <FontAwesomeIcon icon={faCalendarAlt} />
        </div>
        <div css={tw`flex-1 md:ml-4 min-w-0`}>
            <p css={tw`font-bold text-sm m-0 truncate`} style={{ color: 'hsl(var(--text-primary))' }}>
                {schedule.name}
            </p>
            <p css={tw`text-xs mt-0.5 m-0`} style={{ color: 'hsl(var(--text-muted))' }}>
                Last run at: {schedule.lastRunAt ? format(schedule.lastRunAt, "MMM do 'at' h:mma") : 'never'}
            </p>
        </div>
        <div css={tw`sm:hidden`}>
            <StatusPill isActive={schedule.isActive} isProcessing={schedule.isProcessing} />
        </div>
        <ScheduleCronRow cron={schedule.cron} css={tw`mx-auto sm:mx-8 w-full sm:w-auto mt-4 sm:mt-0`} />
        <div css={tw`hidden sm:block`}>
            <StatusPill isActive={schedule.isActive} isProcessing={schedule.isProcessing} />
        </div>
    </>
);
