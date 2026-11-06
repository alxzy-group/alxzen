import React, { useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import login from '@/api/auth/login';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { useStoreState } from 'easy-peasy';
import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import Field from '@/components/elements/Field';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import Reaptcha from 'reaptcha';
import useFlash from '@/plugins/useFlash';
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
    username: string;
    password: string;
}

const LoginContainer = ({ history }: RouteComponentProps) => {
    const ref = useRef<Reaptcha>(null);
    const [token, setToken] = useState('');

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState((state) => state.settings.data!.recaptcha);

    useEffect(() => {
        clearFlashes();
    }, []);

    const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        // If there is no token in the state yet, request the token and then abort this submit request
        // since it will be re-submitted when the recaptcha data is returned by the component.
        if (recaptchaEnabled && !token) {
            ref.current!.execute().catch((error) => {
                console.error(error);

                setSubmitting(false);
                clearAndAddHttpError({ error });
            });

            return;
        }

        login({ ...values, recaptchaData: token })
            .then((response) => {
                if (response.complete) {
                    // @ts-expect-error this is valid
                    window.location = response.intended || '/';
                    return;
                }

                history.replace('/auth/login/checkpoint', { token: response.confirmationToken });
            })
            .catch((error) => {
                console.error(error);

                setToken('');
                if (ref.current) ref.current.reset();

                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
    };

    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={{ username: '', password: '' }}
            validationSchema={object().shape({
                username: string().required('A username or email must be provided.'),
                password: string().required('Please enter your account password.'),
            })}
        >
            {({ isSubmitting, setSubmitting, submitForm }) => (
                <LoginFormContainer title={'Sign in to your account'}>
                    <Field
                        type={'text'}
                        label={'Username atau Email'}
                        name={'username'}
                        disabled={isSubmitting}
                        placeholder={'Masukkan username atau email'}
                    />
                    <div css={tw`mt-5`}>
                        <Field
                            type={'password'}
                            label={'Kata Sandi / Password'}
                            name={'password'}
                            disabled={isSubmitting}
                            placeholder={'••••••••••••'}
                        />
                    </div>
                    <div css={tw`mt-7`}>
                        <SubmitButton
                            type={'submit'}
                            size={'xlarge'}
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            Masuk ke Panel
                        </SubmitButton>
                    </div>
                    {recaptchaEnabled && (
                        <Reaptcha
                            ref={ref}
                            size={'invisible'}
                            sitekey={siteKey || '_invalid_key'}
                            onVerify={(response) => {
                                setToken(response);
                                submitForm();
                            }}
                            onExpire={() => {
                                setSubmitting(false);
                                setToken('');
                            }}
                        />
                    )}
                    <div css={tw`mt-5 text-center`}>
                        <Link
                            to={'/auth/password'}
                            css={tw`text-xs sm:text-sm text-gray-400 hover:text-sky-400 font-medium no-underline transition-colors duration-150 inline-block`}
                        >
                            Lupa kata sandi?
                        </Link>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};

export default LoginContainer;
