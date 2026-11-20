import styled from 'styled-components/macro';
import tw from 'twin.macro';

export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex rounded-2xl mb-2 items-center p-4 transition-all duration-200 relative overflow-hidden`}
    background-color: hsl(var(--bg-elevated));
    border: 1px solid hsl(var(--border));
    transform: translateZ(0);

    ${(props) =>
        props.$hoverable !== false &&
        `
        &:hover {
            background-color: hsl(var(--bg-surface));
            border: 1px solid rgba(56, 189, 248, 0.4);
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(14, 165, 233, 0.12);
            z-index: 20;
        }
    `}

    & .icon {
        ${tw`rounded-full w-16 flex items-center justify-center p-3 text-[#38bdf8]`};
        background: hsl(var(--bg-surface));
        border: 1px solid hsl(var(--border));
    }
`;
