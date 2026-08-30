import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import { motion } from 'framer-motion';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const Wrapper = styled.div`
    ${tw`min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden`}
    background: transparent;

    /* Grid background pattern */
    &::before {
        content: '';
        ${tw`absolute inset-0 pointer-events-none opacity-[0.03]`}
        background-image: linear-gradient(#ffffff 1px, transparent 1px),
                          linear-gradient(90deg, #ffffff 1px, transparent 1px);
        background-size: 40px 40px;
        mask-image: radial-gradient(circle at center, black, transparent 80%);
    }

    /* Ambient glowing orbs */
    &::after {
        content: '';
        ${tw`absolute inset-0 pointer-events-none`}
        background: radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.15), transparent 40%),
                    radial-gradient(circle at 85% 85%, rgba(168, 85, 247, 0.1), transparent 40%);
        z-index: 0;
    }
`;

const GlassCard = styled(motion.div)`
    ${tw`relative z-10 w-full max-w-md p-8 sm:p-10 rounded-2xl flex flex-col`}
    background: rgba(20, 20, 22, 0.7);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
`;

const HeaderSection = styled.div`
    ${tw`flex flex-col items-center mb-8 text-center`}
`;

const BrandTitle = styled.h1`
    ${tw`text-3xl font-bold tracking-tight text-white mb-2`}
    span {
        ${tw`text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500`}
    }
`;

const Subtitle = styled.p`
    ${tw`text-sm text-gray-400 font-medium`}
`;

const LoginFormContainer = forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data?.name ?? 'AlxZen Panel');
    const logo = useStoreState((state: ApplicationStore) => state.settings.data?.logo ?? '');

    const nameParts = name.trim().split(' ');
    const highlight = nameParts.length > 1 ? nameParts.pop() : undefined;
    const mainText = nameParts.join(' ');

    return (
        <Wrapper>
            <GlassCard
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                <HeaderSection>
                    {logo ? (
                        <img
                            src={logo}
                            css={tw`h-14 w-auto object-contain mb-5`}
                            alt={`${name} Logo`}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <div css={tw`w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-5 border border-indigo-500/30`}>
                            <img src={'/assets/svgs/pterodactyl.svg'} css={tw`w-8 h-8`} alt={'Logo'} />
                        </div>
                    )}
                    
                    <BrandTitle>
                        {highlight ? (
                            <>{mainText} <span>{highlight}</span></>
                        ) : (
                            <span>{mainText}</span>
                        )}
                    </BrandTitle>
                    
                    <Subtitle>{title || 'Sign in to continue'}</Subtitle>
                </HeaderSection>

                <FlashMessageRender css={tw`mb-6`} />

                <Form {...props} ref={ref}>
                    {props.children}
                </Form>

                <div css={tw`mt-8 pt-6 border-t border-white/5 text-center`}>
                    <p css={tw`text-xs text-gray-500`}>
                        &copy; 2015 - {new Date().getFullYear()}{' '}
                        <a
                            rel={'noopener nofollow noreferrer'}
                            href={'https://github.com/alxzy-group/alxzen'}
                            target={'_blank'}
                            css={tw`no-underline text-gray-400 hover:text-white transition-colors`}
                        >
                            alxzen Software
                        </a>
                    </p>
                </div>
            </GlassCard>
        </Wrapper>
    );
});

LoginFormContainer.displayName = 'LoginFormContainer';

export default LoginFormContainer;
