import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import isEqual from 'react-fast-compare';
import styled from 'styled-components/macro';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const Wrapper = styled.div`
    border-radius: var(--radius-xl, 18px);
    background: hsl(var(--bg-elevated));
    border: 1px solid hsl(var(--border));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03), 0 8px 24px rgba(0, 0, 0, 0.18);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    overflow: hidden;
    position: relative;

    &:hover {
        border-color: rgba(56, 189, 248, 0.28);
    }

    & > .box-title {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 14px 20px;
        background: hsl(var(--bg-surface) / 0.55);
        border-bottom: 1px solid hsl(var(--border));
        font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: hsl(var(--text-secondary));
    }

    & > .box-content {
        padding: 20px;
    }
`;

const TitledGreyBox = ({ icon, title, children, className }: Props) => (
    <Wrapper className={className}>
        <div className='box-title'>
            {icon && <FontAwesomeIcon icon={icon} style={{ color: '#38bdf8', fontSize: '0.85rem' }} />}
            {title}
        </div>
        <div className='box-content'>{children}</div>
    </Wrapper>
);

export default memo(TitledGreyBox, isEqual);
