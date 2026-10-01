import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import useFitText from 'use-fit-text';
import CopyOnClick from '@/components/elements/CopyOnClick';
import tw, { styled, css } from 'twin.macro';

interface StatBlockProps {
    title: string;
    copyOnClick?: string;
    color?: string | undefined;
    icon: IconDefinition;
    children: React.ReactNode;
    className?: string;
}

const StatContainer = styled.div`
    ${tw`relative flex items-center justify-between rounded-full px-4 py-2 overflow-hidden transition-all duration-300 gap-3`}
    background-color: hsl(var(--bg-elevated));
    border: 1px solid hsl(var(--border));
    backdrop-filter: blur(12px);
    z-index: 1;

    &:hover {
        background-color: hsl(var(--bg-surface));
        border: 1px solid rgba(56, 189, 248, 0.4);
        box-shadow: 0 4px 15px rgba(56, 189, 248, 0.15);
    }
`;

const IconWrapper = styled.div`
    ${tw`flex items-center justify-center text-[#38bdf8] text-lg`}
    filter: drop-shadow(0 0 5px rgba(56, 189, 248, 0.5));
`;

const ContentWrapper = styled.div`
    ${tw`flex flex-col`}
`;

export default ({ title, copyOnClick, children, icon, className }: StatBlockProps) => {
    return (
        <StatContainer className={className}>
            <IconWrapper>
                <FontAwesomeIcon icon={icon} />
            </IconWrapper>
            <ContentWrapper>
                <p css={tw`text-[9px] font-bold uppercase tracking-widest leading-tight`} style={{ color: 'hsl(var(--text-muted))' }}>{title}</p>
                <div css={tw`text-sm font-semibold leading-tight`} style={{ color: 'hsl(var(--text-primary))' }}>
                    {copyOnClick ? (
                        <CopyOnClick text={copyOnClick}>
                            <p>{children}</p>
                        </CopyOnClick>
                    ) : (
                        <>{children}</>
                    )}
                </div>
            </ContentWrapper>
        </StatContainer>
    );
};
