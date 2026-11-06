import React from 'react';
import styled from 'styled-components';

interface ChartBlockProps {
    title: string;
    legend?: React.ReactNode;
    children: React.ReactNode;
}

const Container = styled.div`
    background: hsl(var(--bg-surface) / 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid hsl(var(--border) / 0.8);
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    transition: all 0.2s ease;
    box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.3);

    &:hover {
        border-color: rgba(14, 165, 233, 0.4);
        transform: translateY(-1px);
        box-shadow: 0 6px 20px -2px rgba(14, 165, 233, 0.15);
    }
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    border-bottom: 1px solid hsl(var(--border) / 0.7);
    background: hsl(var(--bg-elevated) / 0.5);
`;

const Title = styled.h3`
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: hsl(var(--text-primary));
    margin: 0;
`;

const ChartArea = styled.div`
    padding: 10px 8px 6px;
`;

export default ({ title, legend, children }: ChartBlockProps) => (
    <Container>
        <Header>
            <Title>{title}</Title>
            {legend}
        </Header>
        <ChartArea>{children}</ChartArea>
    </Container>
);
