import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tw from 'twin.macro';
import isEqual from 'react-fast-compare';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

import styled from 'styled-components/macro';

const Wrapper = styled.div`
    ${tw`rounded-2xl shadow-xl transition-all duration-300 relative overflow-hidden`}
    background-color: hsl(var(--bg-elevated));
    border: 1px solid hsl(var(--border));
    backdrop-filter: blur(12px);

    & > .title {
        ${tw`px-6 py-4 border-b text-sm font-bold tracking-widest uppercase`}
        color: hsl(var(--text-muted));
        border-color: hsl(var(--border));
    }
    
    & > .content {
        ${tw`p-6`}
    }
`;

const TitledGreyBox = ({ icon, title, children, className }: Props) => (
    <Wrapper className={className}>
        <div className="title">
            {typeof title === 'string' ? (
                <>
                    {icon && <FontAwesomeIcon icon={icon} css={tw`mr-2 text-neutral-300`} />}
                    {title}
                </>
            ) : (
                title
            )}
        </div>
        <div className="content">{children}</div>
    </Wrapper>
);

export default memo(TitledGreyBox, isEqual);
