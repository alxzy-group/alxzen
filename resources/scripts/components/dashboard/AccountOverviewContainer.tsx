import * as React from 'react';
import ContentBox from '@/components/elements/ContentBox';
import UpdatePasswordForm from '@/components/dashboard/forms/UpdatePasswordForm';
import UpdateEmailAddressForm from '@/components/dashboard/forms/UpdateEmailAddressForm';
import ConfigureTwoFactorForm from '@/components/dashboard/forms/ConfigureTwoFactorForm';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw from 'twin.macro';
import { breakpoint } from '@/theme';
import styled from 'styled-components/macro';
import MessageBox from '@/components/MessageBox';
import { useLocation } from 'react-router-dom';

const Container = styled.div`
    ${tw`flex flex-col md:grid md:grid-cols-2 gap-8`};
`;

export default () => {
    const { state } = useLocation<undefined | { twoFactorRedirect?: boolean }>();

    return (
        <PageContentBlock title={'Account Overview'}>
            {state?.twoFactorRedirect && (
                <MessageBox title={'2-Factor Required'} type={'error'}>
                    Your account must have two-factor authentication enabled in order to continue.
                </MessageBox>
            )}

            <Container css={[state?.twoFactorRedirect ? tw`mt-4` : tw`mt-10`, tw`mb-10`]}>
                <ContentBox title={'Update Password'} showFlashes={'account:password'}>
                    <UpdatePasswordForm />
                </ContentBox>
                <ContentBox title={'Update Email Address'} showFlashes={'account:email'}>
                    <UpdateEmailAddressForm />
                </ContentBox>
                <div css={tw`md:col-span-2`}>
                    <ContentBox title={'Two-Step Verification'}>
                        <ConfigureTwoFactorForm />
                    </ContentBox>
                </div>
            </Container>
        </PageContentBlock>
    );
};
