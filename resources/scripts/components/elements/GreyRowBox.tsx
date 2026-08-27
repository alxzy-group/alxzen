import styled from 'styled-components/macro';
import tw from 'twin.macro';

export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex rounded-2xl mb-2 items-center p-4 transition-all duration-300 relative overflow-hidden`}
    background-color: rgba(17, 17, 17, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);

    ${(props) =>
        props.$hoverable !== false &&
        `
        &:hover {
            background-color: rgba(17, 17, 17, 1);
            border: 1px solid rgba(56, 189, 248, 0.4);
            transform: scale(1.01) translateY(-1px);
            box-shadow: 0 8px 30px rgba(56, 189, 248, 0.15);
            z-index: 50;
        }
    `}

    & .icon {
        ${tw`rounded-full w-16 flex items-center justify-center bg-gray-800/50 p-3 text-[#38bdf8]`};
        border: 1px solid rgba(255,255,255,0.05);
    }
`;
