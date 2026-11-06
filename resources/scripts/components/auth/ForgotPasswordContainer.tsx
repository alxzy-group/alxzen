import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import requestPasswordResetEmail from '@/api/auth/requestPasswordResetEmail';
import { httpErrorToHuman } from '@/api/http';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { useStoreState } from 'easy-peasy';
import Field from '@/components/elements/Field';
import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
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
import Reaptcha from 'reaptcha';
import useFlash from '@/plugins/useFlash';

interface Values {
    email: string;
}

export default () => {
    const ref = useRef<Reaptcha>(null);
    const [token, setToken] = useState('');

    const { clearFlashes, addFlash } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState((state) => state.settings.data!.recaptcha);

    useEffect(() => {
        clearFlashes();
    }, []);

    const handleSubmission = ({ email }: Values, { setSubmitting, resetForm }: FormikHelpers<Values>) => {
        clearFlashes();

        // If there is no token in the state yet, request the token and then abort this submit request
        // since it will be re-submitted when the recaptcha data is returned by the component.
        if (recaptchaEnabled && !token) {
            ref.current!.execute().catch((error) => {
                console.error(error);

                setSubmitting(false);
                addFlash({ type: 'error', title: 'Error', message: httpErrorToHuman(error) });
            });

            return;
        }

        requestPasswordResetEmail(email, token)
            .then((response) => {
                resetForm();
                addFlash({ type: 'success', title: 'Success', message: response });
            })
            .catch((error) => {
                console.error(error);
                addFlash({ type: 'error', title: 'Error', message: httpErrorToHuman(error) });
            })
            .then(() => {
                setToken('');
                if (ref.current) ref.current.reset();

                setSubmitting(false);
            });
    };

    return (
        <Formik
            onSubmit={handleSubmission}
            initialValues={{ email: '' }}
            validationSchema={object().shape({
                email: string()
                    .email('A valid email address must be provided to continue.')
                    .required('A valid email address must be provided to continue.'),
            })}
        >
            {({ isSubmitting, setSubmitting, submitForm }) => (
                <LoginFormContainer title={'Request Password Reset'} css={tw`w-full flex`}>
                    <Field
                        label={'Email'}
                        description={
                            'Enter your account email address to receive instructions on resetting your password.'
                        }
                        name={'email'}
                        type={'email'}
                    />
                    <div css={tw`mt-7`}>
                        <SubmitButton 
                            type={'submit'} 
                            size={'xlarge'} 
                            disabled={isSubmitting} 
                            isLoading={isSubmitting}
                        >
                            Kirim Tautan Reset
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
