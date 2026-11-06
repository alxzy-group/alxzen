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
    ${tw`relative flex items-center rounded-xl px-3 sm:px-3.5 py-2.5 overflow-hidden transition-all duration-200 gap-2.5 sm:gap-3 min-w-0 w-full`}
    background: hsl(var(--bg-surface) / 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid hsl(var(--border) / 0.8);
    box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.3);

    &:hover {
        background: hsl(var(--bg-elevated));
        border-color: rgba(14, 165, 233, 0.4);
        transform: translateY(-1px);
        box-shadow: 0 4px 14px -2px rgba(14, 165, 233, 0.2);
    }
`;

const IconWrapper = styled.div<{ $color?: string }>`
    ${tw`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex-shrink-0 text-base`}
    background: rgba(14, 165, 233, 0.12);
    border: 1px solid rgba(14, 165, 233, 0.25);
    color: #38bdf8;
    filter: drop-shadow(0 0 8px rgba(14, 165, 233, 0.3));
`;

const ContentWrapper = styled.div`
    ${tw`flex flex-col min-w-0 flex-1 overflow-hidden`}
`;

export default ({ title, copyOnClick, children, icon, color, className }: StatBlockProps) => {
    return (
        <StatContainer className={className} $statusColor={color}>
            <IconWrapper>
                <FontAwesomeIcon icon={icon} />
            </IconWrapper>
            <ContentWrapper>
                <p css={tw`text-[10px] font-bold uppercase tracking-wider leading-none mb-1 truncate`} style={{ color: 'hsl(var(--text-muted))' }}>
                    {title}
                </p>
                <div css={tw`text-xs sm:text-sm font-bold leading-tight truncate`} style={{ color: 'hsl(var(--text-primary))' }}>
                    {copyOnClick ? (
                        <CopyOnClick text={copyOnClick}>
                            <p css={tw`truncate hover:text-sky-400 transition-colors`}>{children}</p>
                        </CopyOnClick>
                    ) : (
                        <div css={tw`truncate`}>{children}</div>
                    )}
                </div>
            </ContentWrapper>
        </StatContainer>
    );
};
