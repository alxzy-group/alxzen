import styled from 'styled-components/macro';

const Label = styled.label<{ isLight?: boolean }>`
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: hsl(var(--text-muted));
    margin-bottom: 6px;
    font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;

    ${(props) => props.isLight && `color: hsl(var(--text-secondary));`};
`;

export default Label;
