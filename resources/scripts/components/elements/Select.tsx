import styled, { css } from 'styled-components/macro';

interface Props {
    hideDropdownArrow?: boolean;
}

const Select = styled.select<Props>`
    display: block;
    width: 100%;
    padding: 10px 36px 10px 14px;
    font-size: 0.875rem;
    font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
    font-weight: 500;
    line-height: 1.5;
    border-radius: var(--radius, 10px);
    box-shadow: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;

    &,
    &:hover:not(:disabled),
    &:focus {
        outline: none;
    }

    -webkit-appearance: none;
    -moz-appearance: none;
    background-size: 1rem;
    background-repeat: no-repeat;
    background-position-x: calc(100% - 0.75rem);
    background-position-y: center;

    &::-ms-expand {
        display: none;
    }

    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }

    ${(props) =>
        !props.hideDropdownArrow &&
        css`
            background-color: hsl(var(--input-bg));
            border: 1.5px solid hsl(var(--input-border));
            color: hsl(var(--input-text));
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='%2394a3b8' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'/%3e%3c/svg%3e");

            &:hover:not(:disabled) {
                border-color: hsl(var(--border-hover, var(--border-focus)));
            }

            &:focus {
                border-color: hsl(var(--border-focus));
                box-shadow: 0 0 0 3px hsl(var(--accent-border)), 0 0 0 1px hsl(var(--border-focus));
            }
        `};
`;

export default Select;
