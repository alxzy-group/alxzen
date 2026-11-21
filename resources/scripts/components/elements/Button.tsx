import React from 'react';
import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';
import Spinner from '@/components/elements/Spinner';

interface Props {
    isLoading?: boolean;
    size?: 'xsmall' | 'small' | 'large' | 'xlarge';
    color?: 'green' | 'red' | 'primary' | 'grey';
    isSecondary?: boolean;
}

const ButtonStyle = styled.button<Omit<Props, 'isLoading'>>`
    ${tw`relative inline-flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm transition-all duration-150 border cursor-pointer select-none whitespace-nowrap outline-none`};
    font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    border-radius: 11px;
    letter-spacing: -0.01em;
    transform: translateZ(0);

    ${(props) =>
        ((!props.isSecondary && !props.color) || props.color === 'primary') &&
        css<Props>`
            background: linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%);
            border-color: rgba(56, 189, 248, 0.35);
            color: #ffffff;
            box-shadow: 0 2px 10px rgba(14, 165, 233, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);

            &:hover:not(:disabled) {
                background: linear-gradient(180deg, #38bdf8 0%, #0ea5e9 100%);
                border-color: rgba(125, 211, 252, 0.5);
                box-shadow: 0 6px 18px rgba(14, 165, 233, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.28);
                transform: translateY(-1px);
            }
        `};

    ${(props) =>
        props.color === 'grey' &&
        css`
            background: hsl(var(--bg-elevated));
            border-color: hsl(var(--border));
            color: hsl(var(--text-primary));
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);

            &:hover:not(:disabled) {
                background: hsl(var(--bg-overlay));
                border-color: rgba(56, 189, 248, 0.4);
                transform: translateY(-1px);
            }
        `};

    ${(props) =>
        props.color === 'green' &&
        css<Props>`
            background: linear-gradient(180deg, #10b981 0%, #059669 100%);
            border-color: rgba(52, 211, 153, 0.35);
            color: #ffffff;
            box-shadow: 0 2px 10px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);

            &:hover:not(:disabled) {
                background: linear-gradient(180deg, #34d399 0%, #10b981 100%);
                border-color: rgba(110, 231, 183, 0.5);
                box-shadow: 0 6px 18px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.28);
                transform: translateY(-1px);
            }
        `};

    ${(props) =>
        props.color === 'red' &&
        css<Props>`
            background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
            border-color: rgba(248, 113, 113, 0.35);
            color: #ffffff;
            box-shadow: 0 2px 10px rgba(239, 68, 68, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);

            &:hover:not(:disabled) {
                background: linear-gradient(180deg, #f87171 0%, #ef4444 100%);
                border-color: rgba(252, 165, 165, 0.5);
                box-shadow: 0 6px 18px rgba(239, 68, 68, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.28);
                transform: translateY(-1px);
            }
        `};

    &:active:not(:disabled) {
        transform: translateY(0) scale(0.98);
    }

    ${(props) => props.size === 'xsmall' && tw`px-2.5 py-1.5 text-xs rounded-lg`};
    ${(props) => (!props.size || props.size === 'small') && tw`px-4 py-2.5`};
    ${(props) => props.size === 'large' && tw`px-5 py-3 text-sm rounded-xl`};
    ${(props) => props.size === 'xlarge' && tw`px-6 py-3.5 w-full text-sm rounded-xl`};

    ${(props) =>
        props.isSecondary &&
        css<Props>`
            background: hsl(var(--bg-elevated) / 0.65);
            border-color: hsl(var(--border));
            color: hsl(var(--text-secondary));
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);

            &:hover:not(:disabled) {
                background: hsl(var(--bg-elevated));
                border-color: rgba(56, 189, 248, 0.4);
                color: hsl(var(--text-primary));
                transform: translateY(-1px);
                ${(props) =>
                    props.color === 'red' &&
                    css`
                        background: rgba(239, 68, 68, 0.15);
                        border-color: rgba(239, 68, 68, 0.45);
                        color: #f87171;
                    `};
                ${(props) =>
                    props.color === 'primary' &&
                    css`
                        background: rgba(14, 165, 233, 0.15);
                        border-color: rgba(56, 189, 248, 0.45);
                        color: #38bdf8;
                    `};
                ${(props) =>
                    props.color === 'green' &&
                    css`
                        background: rgba(16, 185, 129, 0.15);
                        border-color: rgba(52, 211, 153, 0.45);
                        color: #34d399;
                    `};
            }
        `};

    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
        pointer-events: none;
    }
`;

type ComponentProps = Omit<JSX.IntrinsicElements['button'], 'ref' | keyof Props> & Props;

const Button: React.FC<ComponentProps> = ({ children, isLoading, ...props }) => (
    <ButtonStyle {...props}>
        {isLoading && (
            <div css={tw`flex absolute justify-center items-center w-full h-full left-0 top-0`}>
                <Spinner size={'small'} />
            </div>
        )}
        <span css={isLoading ? tw`text-transparent` : undefined}>{children}</span>
    </ButtonStyle>
);

type LinkProps = Omit<JSX.IntrinsicElements['a'], 'ref' | keyof Props> & Props;

const LinkButton: React.FC<LinkProps> = (props) => <ButtonStyle as={'a'} {...props} />;

export { LinkButton, ButtonStyle };
export default Button;
