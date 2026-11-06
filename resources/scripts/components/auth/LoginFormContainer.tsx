import React, { forwardRef, useState } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import { motion } from 'framer-motion';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import pterodactylLogo from '@/assets/images/pterodactyl.svg';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const Wrapper = styled.div`
    ${tw`min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden`}
    background: transparent;

    /* Ambient center glow matching dashboard cyan theme */
    &::before {
        content: '';
        position: absolute;
        pointer-events: none;
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, rgba(56, 189, 248, 0.04) 45%, transparent 70%);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 0;
        filter: blur(40px);
    }
`;

const GlassCard = styled(motion.div)`
    ${tw`relative z-10 w-full max-w-[440px] p-7 sm:p-9 rounded-3xl flex flex-col`}
    background: hsl(var(--bg-surface) / 0.78);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 
        0 0 0 1px rgba(255, 255, 255, 0.05),
        0 24px 60px -12px rgba(0, 0, 0, 0.65),
        0 0 45px -10px rgba(14, 165, 233, 0.18);
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
`;

const HeaderSection = styled.div`
    ${tw`flex flex-col items-center mb-6 text-center`}
`;

const Badge = styled.div`
    ${tw`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3`}
    background: rgba(14, 165, 233, 0.1);
    border: 1px solid rgba(14, 165, 233, 0.25);
    color: #38bdf8;
`;

const WelcomeHeading = styled.h1`
    ${tw`text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 leading-tight`}
    color: hsl(var(--text-primary));
    font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
`;

const BrandGradient = styled.span`
    background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 55%, #60a5fa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
`;

const Subtitle = styled.p`
    color: hsl(var(--text-secondary));
    ${tw`text-xs sm:text-sm font-normal max-w-sm`}
    font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
`;

const DefaultLogoBadge = styled.div`
    ${tw`w-14 h-14 rounded-2xl flex items-center justify-center mb-4`}
    background: linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(6, 182, 212, 0.15) 50%, rgba(59, 130, 246, 0.25) 100%);
    border: 1px solid rgba(14, 165, 233, 0.35);
    box-shadow: 0 0 25px rgba(14, 165, 233, 0.25);
    backdrop-filter: blur(8px);
`;

const CustomLogoBox = styled.div`
    ${tw`mb-4 p-2.5 rounded-2xl flex items-center justify-center max-w-[220px]`}
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 20px rgba(14, 165, 233, 0.15);
`;

const LoginFormContainer = forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data?.name ?? 'alxzen');
    const logo = useStoreState((state: ApplicationStore) => state.settings.data?.logo ?? '');
    const [logoError, setLogoError] = useState(false);

    const hasCustomLogo = Boolean(logo && !logoError);

    return (
        <Wrapper>
            <GlassCard
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
                <HeaderSection>
                    <Badge>
                        <span css={tw`w-2 h-2 rounded-full bg-green-400 animate-pulse`} />
                        <span>Portal Autentikasi</span>
                    </Badge>

                    {hasCustomLogo ? (
                        <CustomLogoBox>
                            <img
                                src={logo}
                                css={tw`h-12 w-auto max-w-full object-contain`}
                                alt={`${name} Logo`}
                                onError={() => setLogoError(true)}
                            />
                        </CustomLogoBox>
                    ) : (
                        <DefaultLogoBadge>
                            <img
                                src={pterodactylLogo}
                                css={tw`w-8 h-8`}
                                style={{ filter: 'drop-shadow(0 2px 8px rgba(14,165,233,0.5))' }}
                                alt={'Logo'}
                            />
                        </DefaultLogoBadge>
                    )}

                    <WelcomeHeading>
                        Selamat Datang di <BrandGradient>{name}</BrandGradient>
                    </WelcomeHeading>

                    <Subtitle>
                        {title && title !== 'Sign in to your account'
                            ? title
                            : 'Masukkan username atau email dan kata sandi untuk masuk ke panel.'}
                    </Subtitle>
                </HeaderSection>

                <FlashMessageRender css={tw`mb-5`} />

                <Form {...props} ref={ref}>
                    {props.children}
                </Form>

                <div css={tw`mt-7 pt-4 border-t border-white/[0.06] text-center`}>
                    <p css={tw`text-xs text-gray-400 font-medium`}>
                        &copy; 2015 - {new Date().getFullYear()}{' '}
                        <span css={tw`text-gray-300 font-semibold`}>{name}</span>
                    </p>
                </div>
            </GlassCard>
        </Wrapper>
    );
});

LoginFormContainer.displayName = 'LoginFormContainer';

export default LoginFormContainer;
