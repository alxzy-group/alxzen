const colors = require('tailwindcss/colors');

const gray = {
    50: 'hsl(var(--gray-50) / <alpha-value>)',
    100: 'hsl(var(--gray-100) / <alpha-value>)',
    200: 'hsl(var(--gray-200) / <alpha-value>)',
    300: 'hsl(var(--gray-300) / <alpha-value>)',
    400: 'hsl(var(--gray-400) / <alpha-value>)',
    500: 'hsl(var(--gray-500) / <alpha-value>)',
    600: 'hsl(var(--gray-600) / <alpha-value>)',
    700: 'hsl(var(--gray-700) / <alpha-value>)',
    800: 'hsl(var(--gray-800) / <alpha-value>)',
    900: 'hsl(var(--gray-900) / <alpha-value>)',
};

module.exports = {
    content: [
        './resources/scripts/**/*.{js,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
                header: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
            },
            colors: {
                black: 'hsl(var(--black) / <alpha-value>)',
                // "primary" and "neutral" are deprecated, prefer the use of "blue" and "gray"
                // in new code.
                primary: colors.blue,
                gray: gray,
                neutral: gray,
                cyan: colors.cyan,
                sky: colors.sky,
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                250: '250ms',
            },
            borderColor: theme => ({
                default: theme('colors.neutral.400', 'currentColor'),
            }),
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ]
};
