import React from 'react';
import styled from 'styled-components';

interface ChartBlockProps {
    title: string;
    legend?: React.ReactNode;
    children: React.ReactNode;
}

const Container = styled.div`
    background: rgba(17, 17, 17, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

    &:hover {
        border-color: rgba(56, 189, 248, 0.4);
        box-shadow: 0 8px 30px rgba(56, 189, 248, 0.15);
        transform: translateY(-2px);
    }
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    background: transparent;
`;

const Title = styled.h3`
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #e2e8f0;
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
