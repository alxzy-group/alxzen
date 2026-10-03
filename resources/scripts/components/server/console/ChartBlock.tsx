import React from 'react';
import styled from 'styled-components';

interface ChartBlockProps {
    title: string;
    legend?: React.ReactNode;
    children: React.ReactNode;
}

const Container = styled.div`
    background: hsl(var(--bg-elevated));
    border: 3px solid hsl(var(--text-primary));
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 6px 6px 0px hsl(var(--text-primary));

    &:hover {
        transform: translate(3px, 3px);
        box-shadow: 3px 3px 0px hsl(var(--text-primary));
    }
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-bottom: 1px solid hsl(var(--border));
    background: transparent;
`;

const Title = styled.h3`
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: hsl(var(--text-primary));
    margin: 0;
`;

const ChartArea = styled.div`
    padding: 8px 4px 4px;
`;

export default ({ title, legend, children }: ChartBlockProps) => (
    <Container>
        <Header>
            <Title>{title}</Title>
            {legend && <div style={{ display: 'flex', alignItems: 'center' }}>{legend}</div>}
        </Header>
        <ChartArea>{children}</ChartArea>
    </Container>
);
