import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import requestPasswordResetEmail from '@/api/auth/requestPasswordResetEmail';
import { httpErrorToHuman } from '@/api/http';
import LoginFormContainer, {
    AuthFieldGroup,
    AuthSecondaryLink,
    AuthSubmitButton,
    InputLeadingIcon,
} from '@/components/auth/LoginFormContainer';
import { useStoreState } from 'easy-peasy';
import Field from '@/components/elements/Field';
import Label from '@/components/elements/Label';
import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import tw from 'twin.macro';
import Reaptcha from 'reaptcha';
import useFlash from '@/plugins/useFlash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEnvelope, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

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
                <LoginFormContainer
                    heading={'Pulihkan Kata Sandi'}
                    subtitle={'Masukkan alamat email akun Anda untuk menerima tautan reset kata sandi.'}
                >
                    <div>
                        <Label htmlFor={'forgot-email'}>Alamat Email</Label>
                        <AuthFieldGroup>
                            <InputLeadingIcon>
                                <FontAwesomeIcon icon={faEnvelope} />
                            </InputLeadingIcon>
                            <Field
                                id={'forgot-email'}
                                name={'email'}
                                type={'email'}
                                disabled={isSubmitting}
                                placeholder={'nama@domain.com'}
                                description={'Kami akan mengirimkan instruksi pemulihan ke email terdaftar Anda.'}
                                autoComplete={'email'}
                            />
                        </AuthFieldGroup>
                    </div>

                    <div css={tw`mt-7`}>
                        <AuthSubmitButton
                            type={'submit'}
                            size={'xlarge'}
                            disabled={isSubmitting}
                            isLoading={isSubmitting}
                        >
                            <span>Kirim Tautan Reset</span>
                            {!isSubmitting && <FontAwesomeIcon icon={faPaperPlane} css={tw`text-xs`} />}
                        </AuthSubmitButton>
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
                        <AuthSecondaryLink to={'/auth/login'}>
                            <FontAwesomeIcon icon={faArrowLeft} css={tw`text-xs`} />
                            <span>Kembali ke Halaman Login</span>
                        </AuthSecondaryLink>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};
