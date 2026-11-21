import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tw, { styled } from 'twin.macro';

interface Props {
    icon: IconProp;
    title: string;
    description: string;
    children?: React.ReactNode;
}

const Container = styled.div`
    ${tw`rounded-2xl py-12 px-6 text-center flex flex-col items-center justify-center`}
    border: 1px dashed hsl(var(--border));
    background: hsl(var(--bg-surface) / 0.55);
`;

const IconCircle = styled.div`
    ${tw`w-12 h-12 rounded-2xl flex items-center justify-center mb-3.5`}
    background: hsl(var(--bg-elevated));
    border: 1px solid hsl(var(--border));
    color: #38bdf8;
    font-size: 1.15rem;
`;

const EmptyState = ({ icon, title, description, children }: Props) => (
    <Container>
        <IconCircle>
            <FontAwesomeIcon icon={icon} />
        </IconCircle>
        <h3
            css={tw`text-base font-bold tracking-tight mb-1`}
            style={{ color: 'hsl(var(--text-primary))' }}
        >
            {title}
        </h3>
        <p
            css={tw`text-xs max-w-md mb-0`}
            style={{ color: 'hsl(var(--text-muted))' }}
        >
            {description}
        </p>
        {children && <div css={tw`mt-4`}>{children}</div>}
    </Container>
);

export default EmptyState;
