import React from 'react';
import FlashMessageRender from '@/components/FlashMessageRender';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import tw from 'twin.macro';
import styled from 'styled-components/macro';

type Props = Readonly<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        title?: string;
        borderColor?: string;
        showFlashes?: string | boolean;
        showLoadingOverlay?: boolean;
    }
>;

const BoxWrapper = styled.div`
    border-radius: var(--radius-xl, 18px);
    background: hsl(var(--bg-elevated));
    border: 1px solid hsl(var(--border));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03), 0 8px 24px rgba(0, 0, 0, 0.18);
    padding: 24px;
    position: relative;
    transition: border-color 0.2s ease;
`;

const BoxTitle = styled.h2`
    font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: -0.015em;
    color: hsl(var(--text-primary));
    margin: 0 0 12px 0;
`;

const ContentBox = ({ title, borderColor, showFlashes, showLoadingOverlay, children, ...props }: Props) => (
    <div {...props}>
        {title && <BoxTitle>{title}</BoxTitle>}
        {showFlashes && (
            <FlashMessageRender byKey={typeof showFlashes === 'string' ? showFlashes : undefined} css={tw`mb-4`} />
        )}
        <BoxWrapper style={borderColor ? { borderColor } : undefined}>
            <SpinnerOverlay visible={showLoadingOverlay || false} />
            {children}
        </BoxWrapper>
    </div>
);

export default ContentBox;
