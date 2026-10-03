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
    ${tw`relative flex items-center justify-between rounded-xl px-4 py-2 overflow-hidden transition-all duration-200 gap-3`}
    background-color: hsl(var(--bg-elevated));
    border: 2px solid hsl(var(--text-primary));
    box-shadow: 3px 3px 0px hsl(var(--text-primary));
    z-index: 1;

    &:hover {
        background-color: hsl(var(--bg-surface));
        transform: translate(2px, 2px);
        box-shadow: 1px 1px 0px hsl(var(--text-primary));
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
