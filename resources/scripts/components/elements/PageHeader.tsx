import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tw, { styled } from 'twin.macro';

interface Props {
    icon: IconProp;
    title: string;
    description?: string;
    badge?: string;
    actions?: React.ReactNode;
}

const HeaderWrapper = styled.div`
    ${tw`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5`}
    border-bottom: 1px solid hsl(var(--border) / 0.75);
`;

const IconBox = styled.div`
    ${tw`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}
    background: rgba(14, 165, 233, 0.12);
    border: 1px solid rgba(56, 189, 248, 0.25);
    color: #38bdf8;
    font-size: 0.95rem;
`;

const BadgePill = styled.span`
    ${tw`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono whitespace-nowrap`}
    background: rgba(14, 165, 233, 0.12);
    border: 1px solid rgba(56, 189, 248, 0.25);
    color: #38bdf8;
    font-variant-numeric: tabular-nums;
`;

const PageHeader = ({ icon, title, description, badge, actions }: Props) => (
    <HeaderWrapper>
        <div css={tw`flex items-center gap-3.5 min-w-0`}>
            <IconBox>
                <FontAwesomeIcon icon={icon} />
            </IconBox>
            <div css={tw`min-w-0`}>
                <div css={tw`flex items-center gap-2.5 flex-wrap`}>
                    <h1
                        css={tw`text-xl font-extrabold tracking-tight m-0`}
                        style={{ color: 'hsl(var(--text-primary))' }}
                    >
                        {title}
                    </h1>
                    {badge && <BadgePill>{badge}</BadgePill>}
                </div>
                {description && (
                    <p css={tw`text-xs mt-0.5 mb-0`} style={{ color: 'hsl(var(--text-muted))' }}>
                        {description}
                    </p>
                )}
            </div>
        </div>
        {actions && <div css={tw`flex items-center gap-2.5 flex-wrap flex-shrink-0`}>{actions}</div>}
    </HeaderWrapper>
);

export default PageHeader;
