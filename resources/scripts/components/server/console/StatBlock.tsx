import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import CopyOnClick from '@/components/elements/CopyOnClick';
import tw, { styled } from 'twin.macro';

interface StatBlockProps {
    title: string;
    copyOnClick?: string;
    color?: string | undefined;
    icon: IconDefinition;
    children: React.ReactNode;
    className?: string;
}

const StatContainer = styled.div<{ $statusColor?: string }>`
    ${tw`relative flex items-center rounded-xl px-3.5 py-3 overflow-hidden transition-all duration-200 gap-3 min-w-0 w-full`}
    background: hsl(var(--bg-card));
    border: 1px solid hsl(var(--border) / 0.85);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03);
    transform: translateZ(0);

    &:hover {
        background: hsl(var(--bg-elevated));
        border-color: rgba(14, 165, 233, 0.45);
        transform: translateY(-1px);
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25), 0 0 12px rgba(14, 165, 233, 0.1);
    }
`;

const IconWrapper = styled.div<{ $color?: string }>`
    ${tw`flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 text-sm`}
    background: ${({ $color }) =>
        $color === 'bg-red-500' ? 'rgba(239, 68, 68, 0.14)' :
            $color === 'bg-yellow-500' ? 'rgba(245, 158, 11, 0.14)' :
                'rgba(14, 165, 233, 0.12)'};
    border: 1px solid ${({ $color }) =>
        $color === 'bg-red-500' ? 'rgba(239, 68, 68, 0.32)' :
            $color === 'bg-yellow-500' ? 'rgba(245, 158, 11, 0.32)' :
                'rgba(14, 165, 233, 0.28)'};
    color: ${({ $color }) =>
        $color === 'bg-red-500' ? '#f87171' :
            $color === 'bg-yellow-500' ? '#fbbf24' :
                '#38bdf8'};
`;

const ContentWrapper = styled.div`
    ${tw`flex flex-col min-w-0 flex-1 overflow-hidden`}
    font-variant-numeric: tabular-nums;
`;

export default ({ title, copyOnClick, children, icon, color, className }: StatBlockProps) => {
    return (
        <StatContainer className={className} $statusColor={color}>
            <IconWrapper $color={color}>
                <FontAwesomeIcon icon={icon} />
            </IconWrapper>
            <ContentWrapper>
                <p css={tw`text-[10px] font-bold uppercase tracking-wider leading-none mb-1 truncate`} style={{ color: 'hsl(var(--text-muted))' }}>
                    {title}
                </p>
                <div css={tw`text-xs sm:text-[13px] font-extrabold leading-tight truncate`} style={{ color: 'hsl(var(--text-primary))' }}>
                    {copyOnClick ? (
                        <CopyOnClick text={copyOnClick}>
                            <p css={tw`truncate hover:text-sky-400 transition-colors m-0 cursor-pointer`}>{children}</p>
                        </CopyOnClick>
                    ) : (
                        <div css={tw`truncate`}>{children}</div>
                    )}
                </div>
            </ContentWrapper>
        </StatContainer>
    );
};
