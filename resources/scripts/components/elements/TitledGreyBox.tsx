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
    border: 1.5px solid hsl(var(--border));
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    overflow: hidden;
    position: relative;

    &:hover {
        border-color: hsl(var(--border-focus) / 0.3);
    }

    & > .box-title {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 14px 20px;
        border-bottom: 1px solid hsl(var(--border));
        font-family: 'Inter', sans-serif;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: hsl(var(--text-muted));
    }

    & > .box-content {
        padding: 20px;
    }
`;

const TitledGreyBox = ({ icon, title, children, className }: Props) => (
    <Wrapper className={className}>
        <div className='box-title'>
            {icon && <FontAwesomeIcon icon={icon} style={{ color: 'hsl(var(--accent))', fontSize: '0.8rem' }} />}
            {typeof title === 'string' ? title : title}
        </div>
        <div className='box-content'>{children}</div>
    </Wrapper>
);

export default memo(TitledGreyBox, isEqual);
