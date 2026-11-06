import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import performPasswordReset from '@/api/auth/performPasswordReset';
import { httpErrorToHuman } from '@/api/http';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { Formik, FormikHelpers } from 'formik';
import { object, ref, string } from 'yup';
import Field from '@/components/elements/Field';
import Input from '@/components/elements/Input';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import styled from 'styled-components/macro';

const SubmitButton = styled(Button)`
    ${tw`w-full border-none rounded-xl text-white font-bold py-3.5 transition-all duration-200 tracking-wide text-sm`}
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 60%, #2563eb 100%) !important;
    box-shadow: 0 4px 16px rgba(14, 165, 233, 0.35) !important;
    &:hover:not(:disabled) {
        background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 60%, #1d4ed8 100%) !important;
        box-shadow: 0 6px 24px rgba(14, 165, 233, 0.5) !important;
        transform: translateY(-2px);
    }
    &:active:not(:disabled) {
        transform: translateY(0) scale(0.99);
    }
`;

interface Values {
    password: string;
    passwordConfirmation: string;
}

export default ({ match, location }: RouteComponentProps<{ token: string }>) => {
    const [email, setEmail] = useState('');

    const { clearFlashes, addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const parsed = new URLSearchParams(location.search);
    if (email.length === 0 && parsed.get('email')) {
        setEmail(parsed.get('email') || '');
    }

    const submit = ({ password, passwordConfirmation }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();
        performPasswordReset(email, { token: match.params.token, password, passwordConfirmation })
            .then(() => {
                // @ts-expect-error this is valid
                window.location = '/';
            })
            .catch((error) => {
                console.error(error);

                setSubmitting(false);
                addFlash({ type: 'error', title: 'Error', message: httpErrorToHuman(error) });
            });
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                password: '',
                passwordConfirmation: '',
            }}
            validationSchema={object().shape({
                password: string()
                    .required('A new password is required.')
                    .min(8, 'Your new password should be at least 8 characters in length.'),
                passwordConfirmation: string()
                    .required('Your new password does not match.')
                    // @ts-expect-error this is valid
                    .oneOf([ref('password'), null], 'Your new password does not match.'),
            })}
        >
            {({ isSubmitting }) => (
                <LoginFormContainer title={'Reset Password'} css={tw`w-full flex`}>
                    <div>
                        <label css={tw`text-neutral-300 text-sm`}>Email</label>
                        <Input value={email} disabled />
                    </div>
                    <div css={tw`mt-6`}>
                        <Field
                            label={'New Password'}
                            name={'password'}
                            type={'password'}
                            description={'Passwords must be at least 8 characters in length.'}
                        />
                    </div>
                    <div css={tw`mt-6`}>
                        <Field label={'Confirm New Password'} name={'passwordConfirmation'} type={'password'} />
                    </div>
                    <div css={tw`mt-7`}>
                        <SubmitButton 
                            size={'xlarge'} 
                            type={'submit'} 
                            disabled={isSubmitting} 
                            isLoading={isSubmitting}
                        >
                            Reset Password Sekarang
                        </SubmitButton>
                    </div>
                    <div css={tw`mt-5 text-center`}>
                        <Link
                            to={'/auth/login'}
                            css={tw`text-xs sm:text-sm text-gray-400 hover:text-sky-400 font-medium no-underline transition-colors duration-150 inline-block`}
                        >
                            Kembali ke Halaman Login
                        </Link>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};
