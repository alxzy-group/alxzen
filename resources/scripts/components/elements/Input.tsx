import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';

export interface Props {
    isLight?: boolean;
    hasError?: boolean;
}

const inputStyle = css<Props>`
    resize: none;
    width: 100%;
    min-width: 0;
    appearance: none;
    outline: none;
    padding: 10px 14px;
    font-size: 0.875rem;
    font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: -0.01em;
    border-radius: var(--radius, 10px);
    border: 1.5px solid hsl(var(--input-border));
    background: hsl(var(--input-bg));
    color: hsl(var(--input-text));
    transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0px 1000px hsl(var(--input-bg)) inset !important;
        -webkit-text-fill-color: hsl(var(--input-text)) !important;
        caret-color: hsl(var(--input-text));
        transition: background-color 5000s ease-in-out 0s;
    }

    &::placeholder {
        color: hsl(var(--input-placeholder));
    }

    & + .input-help {
        margin-top: 5px;
        font-size: 0.75rem;
        color: ${(props: Props) => props.hasError ? 'hsl(var(--danger))' : 'hsl(var(--text-muted))'};
    }

    &:required,
    &:invalid {
        box-shadow: none;
    }

    &:not(:disabled):not(:read-only):focus {
        outline: none;
        border-color: hsl(var(--border-focus));
        box-shadow: 0 0 0 3px hsl(var(--accent-border)), 0 0 0 1px hsl(var(--border-focus));
        background: hsl(var(--input-bg));
        ${(props: Props) => props.hasError && `border-color: hsl(var(--danger)); box-shadow: 0 0 0 3px hsl(var(--danger-muted));`};
    }

    &:read-only:not(:disabled) {
        cursor: default;
        opacity: 0.7;
    }

    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }

    ${(props: Props) => props.hasError && `
        border-color: hsl(var(--danger));
        color: hsl(var(--input-text));
    `};
`;

const checkboxStyle = css<Props>`
    ${tw`bg-neutral-500 cursor-pointer appearance-none inline-block align-middle select-none flex-shrink-0 w-4 h-4 text-primary-400 border border-neutral-300 rounded-sm`};
    color-adjust: exact;
    background-origin: border-box;
    transition: all 75ms linear, box-shadow 25ms linear;

    &:checked {
        ${tw`border-transparent bg-no-repeat bg-center`};
        background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M5.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L7 8.586 5.707 7.293z'/%3e%3c/svg%3e");
        background-color: currentColor;
        background-size: 100% 100%;
    }

    &:focus {
        ${tw`outline-none border-primary-300`};
        box-shadow: 0 0 0 1px rgba(9, 103, 210, 0.25);
    }
`;

const Input = styled.input<Props>`
    &:not([type='checkbox']):not([type='radio']) {
        ${inputStyle};
    }

    &[type='checkbox'],
    &[type='radio'] {
        ${checkboxStyle};

        &[type='radio'] {
            ${tw`rounded-full`};
        }
    }
`;

const Textarea = styled.textarea<Props>`
    ${inputStyle}
`;

export { Textarea };
export default Input;
