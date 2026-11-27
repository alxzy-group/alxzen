import React, { forwardRef, useState } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import { motion } from 'framer-motion';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { Link } from 'react-router-dom';
import Button from '@/components/elements/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBolt,
    faLayerGroup,
    faLock,
    faShieldAlt,
    faTerminal,
} from '@fortawesome/free-solid-svg-icons';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
    heading?: string;
    subtitle?: string;
};

const PageContainer = styled.div`
    width: 100%;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 16px;
    position: relative;
    overflow-x: hidden;

    @media (min-width: 640px) {
        padding: 32px 24px;
    }
`;

const AuthShell = styled(motion.div)`
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 1000px;
    display: grid;
    grid-template-columns: 1fr;
    border-radius: 22px;
    overflow: hidden;
    background: rgba(15, 16, 22, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 28px 72px -18px rgba(0, 0, 0, 0.78), 0 0 0 1px rgba(255, 255, 255, 0.03);

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(56, 189, 248, 0.45) 35%,
            rgba(14, 165, 233, 0.6) 65%,
            transparent 100%
        );
        pointer-events: none;
        z-index: 2;
    }

    @media (min-width: 1024px) {
        grid-template-columns: 1.08fr 1fr;
    }
`;

const BrandPanel = styled.aside`
    display: none;
    position: relative;
    flex-direction: column;
    justify-content: space-between;
    padding: 44px 40px;
    background-color: #0b0d13;
    background-image:
        radial-gradient(circle at 12% 10%, rgba(14, 165, 233, 0.14) 0%, transparent 52%),
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 100% 100%, 32px 32px, 32px 32px;
    border-right: 1px solid rgba(255, 255, 255, 0.06);

    @media (min-width: 1024px) {
        display: flex;
    }
`;

const BrandTopBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
`;

const BrandIdentity = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 12px;
`;

const BrandBadge = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(14, 165, 233, 0.22) 0%, rgba(2, 132, 199, 0.1) 100%);
    border: 1px solid rgba(56, 189, 248, 0.32);
    color: #38bdf8;
    font-size: 16px;
    flex-shrink: 0;
`;

const BrandWordmark = styled.span`
    font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #f8fafc;
    text-transform: lowercase;

    & > span {
        color: #38bdf8;
    }
`;

const StatusPill = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 5px 11px;
    border-radius: 9999px;
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.24);
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: #34d399;
    white-space: nowrap;
`;

const StatusDot = styled.span`
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: #34d399;
    box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.18);
`;

const EditorialSection = styled.div`
    margin: 36px 0 32px;
`;

const Eyebrow = styled.div`
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #38bdf8;
    margin-bottom: 12px;
`;

const HeroHeadline = styled.h2`
    font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
    font-size: 30px;
    font-weight: 800;
    line-height: 1.18;
    letter-spacing: -0.03em;
    color: #f8fafc;
    margin: 0 0 14px;

    & > span {
        color: #38bdf8;
    }
`;

const HeroLead = styled.p`
    font-size: 13.5px;
    line-height: 1.65;
    color: #94a3b8;
    margin: 0 0 28px;
    max-width: 390px;
`;

const SpecList = styled.div`
    display: flex;
    flex-direction: column;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

const SpecRow = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 15px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const SpecIcon = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(14, 165, 233, 0.1);
    border: 1px solid rgba(56, 189, 248, 0.2);
    color: #38bdf8;
    font-size: 13px;
    flex-shrink: 0;
    margin-top: 1px;
`;

const SpecText = styled.div`
    min-width: 0;
`;

const SpecTitle = styled.div`
    font-size: 13px;
    font-weight: 700;
    color: #e2e8f0;
    line-height: 1.35;
`;

const SpecDesc = styled.div`
    font-size: 12px;
    color: #64748b;
    line-height: 1.5;
    margin-top: 2px;
`;

const BrandFooter = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 18px;
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
    font-size: 11px;
    letter-spacing: 0.05em;
    color: #475569;
`;

const FormPanel = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 32px 24px;
    background: rgba(17, 19, 25, 0.96);

    @media (min-width: 640px) {
        padding: 44px 40px;
    }
`;

const MobileBrandHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding-bottom: 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);

    @media (min-width: 1024px) {
        display: none;
    }
`;

const FormTitle = styled.h1`
    font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.025em;
    line-height: 1.25;
    color: #f8fafc;
    margin: 0;
`;

const FormSubtitle = styled.p`
    font-size: 13.5px;
    line-height: 1.55;
    color: #94a3b8;
    margin: 6px 0 24px;
`;

const FormFooter = styled.div`
    margin-top: 28px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    font-size: 11.5px;
    color: #64748b;
`;

const SecureTag = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
    font-size: 10.5px;
    color: #64748b;

    & > svg {
        color: #38bdf8;
    }
`;

export const AuthFieldGroup = styled.div<{ hasRightAction?: boolean; monospace?: boolean }>`
    position: relative;
    width: 100%;

    & input {
        height: 44px !important;
        padding-left: 42px !important;
        padding-right: ${(props) => (props.hasRightAction ? '44px' : '14px')} !important;
        background: rgba(9, 10, 14, 0.85) !important;
        border: 1.5px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 10px !important;
        font-size: 14px !important;
        color: #f4f4f5 !important;
        ${(props) =>
            props.monospace &&
            `font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace !important; letter-spacing: 0.08em;`}
        transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease !important;
    }

    & input::placeholder {
        color: #52525b !important;
        letter-spacing: normal;
    }

    & input:hover:not(:disabled) {
        border-color: rgba(255, 255, 255, 0.18) !important;
    }

    & input:focus:not(:disabled) {
        background: rgba(9, 10, 14, 1) !important;
        border-color: #0ea5e9 !important;
        box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15) !important;
    }

    & input:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }

    & .input-help {
        font-size: 12px !important;
        line-height: 1.45 !important;
        margin-top: 6px !important;
    }
`;

export const InputLeadingIcon = styled.span`
    position: absolute;
    left: 14px;
    top: 0;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    font-size: 13.5px;
    pointer-events: none;
    z-index: 2;
`;

export const PasswordToggleButton = styled.button`
    position: absolute;
    right: 4px;
    top: 0;
    height: 44px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: #71717a;
    cursor: pointer;
    z-index: 2;
    transition: color 0.15s ease;

    &:hover {
        color: #38bdf8;
    }
`;

export const AuthSubmitButton = styled(Button)`
    width: 100%;
    height: 46px;
    border-radius: 11px !important;
    border: 1px solid rgba(56, 189, 248, 0.35) !important;
    font-weight: 700 !important;
    font-size: 14px !important;
    letter-spacing: 0.01em !important;
    color: #ffffff !important;
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 8px 22px -6px rgba(14, 165, 233, 0.48) !important;

    & > span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%) !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 10px 26px -6px rgba(14, 165, 233, 0.6) !important;
        transform: translateY(-1px);
    }

    &:active:not(:disabled) {
        transform: translateY(0) scale(0.99);
    }
`;

export const AuthSecondaryLink = styled(Link)`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    font-size: 12.5px;
    font-weight: 600;
    color: #94a3b8;
    text-decoration: none;
    transition: color 0.15s ease;

    &:hover {
        color: #38bdf8;
    }
`;

const renderBrandWordmark = (name: string) => {
    const clean = (name || 'alxzen').trim();
    if (clean.toLowerCase() === 'alxzen') {
        return (
            <BrandWordmark>
                alx<span>zen</span>
            </BrandWordmark>
        );
    }

    return <BrandWordmark>{clean}</BrandWordmark>;
};

const LoginFormContainer = forwardRef<HTMLFormElement, Props>(({ title, heading, subtitle, ...props }, ref) => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data?.name ?? 'alxzen');
    const logo = useStoreState((state: ApplicationStore) => state.settings.data?.logo ?? '');
    const [logoError, setLogoError] = useState(false);

    const hasCustomLogo = Boolean(logo && !logoError);
    const resolvedHeading = heading || 'Masuk ke Workspace';
    const resolvedSubtitle =
        subtitle ||
        (title && title !== 'Sign in to your account'
            ? title
            : 'Masukkan kredensial akun Anda untuk mengakses dashboard infrastruktur.');

    const brandLogoContent = hasCustomLogo ? (
        <img
            src={logo}
            css={tw`h-9 w-auto max-w-[170px] object-contain`}
            alt={`${name} Logo`}
            onError={() => setLogoError(true)}
        />
    ) : (
        <BrandIdentity>
            <BrandBadge>
                <FontAwesomeIcon icon={faLayerGroup} />
            </BrandBadge>
            {renderBrandWordmark(name)}
        </BrandIdentity>
    );

    return (
        <PageContainer>
            <AuthShell
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
                <BrandPanel>
                    <div>
                        <BrandTopBar>
                            {brandLogoContent}
                            <StatusPill>
                                <StatusDot />
                                <span>SYSTEM ONLINE</span>
                            </StatusPill>
                        </BrandTopBar>

                        <EditorialSection>
                            <Eyebrow>CLOUD COMPUTE WORKSPACE</Eyebrow>
                            <HeroHeadline>
                                Kendali Penuh <span>Infrastruktur Server Anda.</span>
                            </HeroHeadline>
                            <HeroLead>
                                Kelola container berlatensi rendah, konsol WebSocket real-time, dan isolasi resource
                                dalam satu workspace terpadu.
                            </HeroLead>

                            <SpecList>
                                <SpecRow>
                                    <SpecIcon>
                                        <FontAwesomeIcon icon={faTerminal} />
                                    </SpecIcon>
                                    <SpecText>
                                        <SpecTitle>Real-Time Console &amp; Telemetry</SpecTitle>
                                        <SpecDesc>Aliran terminal WebSocket dan metrik live tanpa delay.</SpecDesc>
                                    </SpecText>
                                </SpecRow>
                                <SpecRow>
                                    <SpecIcon>
                                        <FontAwesomeIcon icon={faShieldAlt} />
                                    </SpecIcon>
                                    <SpecText>
                                        <SpecTitle>Zero-Trust Isolation &amp; 2FA</SpecTitle>
                                        <SpecDesc>Proteksi sesi berlapis dengan verifikasi perangkat aktif.</SpecDesc>
                                    </SpecText>
                                </SpecRow>
                                <SpecRow>
                                    <SpecIcon>
                                        <FontAwesomeIcon icon={faBolt} />
                                    </SpecIcon>
                                    <SpecText>
                                        <SpecTitle>Instant Provisioning &amp; Domains</SpecTitle>
                                        <SpecDesc>Deploy instan, otomatisasi jadwal, dan routing subdomain.</SpecDesc>
                                    </SpecText>
                                </SpecRow>
                            </SpecList>
                        </EditorialSection>
                    </div>

                    <BrandFooter>
                        <span>TLS 1.3 ENCRYPTED</span>
                        <span>WINGS DAEMON READY</span>
                    </BrandFooter>
                </BrandPanel>

                <FormPanel>
                    <MobileBrandHeader>
                        {brandLogoContent}
                        <StatusPill>
                            <StatusDot />
                            <span>ONLINE</span>
                        </StatusPill>
                    </MobileBrandHeader>

                    <FormTitle>{resolvedHeading}</FormTitle>
                    <FormSubtitle>{resolvedSubtitle}</FormSubtitle>

                    <FlashMessageRender css={tw`mb-5`} />

                    <Form {...props} ref={ref}>
                        {props.children}
                    </Form>

                    <FormFooter>
                        <span>
                            &copy; 2015 - {new Date().getFullYear()} <strong css={tw`text-gray-300`}>{name}</strong>
                        </span>
                        <SecureTag>
                            <FontAwesomeIcon icon={faLock} />
                            <span>Secure Session</span>
                        </SecureTag>
                    </FormFooter>
                </FormPanel>
            </AuthShell>
        </PageContainer>
    );
});

LoginFormContainer.displayName = 'LoginFormContainer';

export default LoginFormContainer;
