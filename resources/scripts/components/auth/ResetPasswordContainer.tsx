import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router';
import performPasswordReset from '@/api/auth/performPasswordReset';
import { httpErrorToHuman } from '@/api/http';
import LoginFormContainer, {
    AuthFieldGroup,
    AuthSecondaryLink,
    AuthSubmitButton,
    InputLeadingIcon,
    PasswordToggleButton,
} from '@/components/auth/LoginFormContainer';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { Formik, FormikHelpers } from 'formik';
import { object, ref, string } from 'yup';
import Field from '@/components/elements/Field';
import Input from '@/components/elements/Input';
import Label from '@/components/elements/Label';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faCheck,
    faEnvelope,
    faEye,
    faEyeSlash,
    faLock,
} from '@fortawesome/free-solid-svg-icons';

interface Values {
    password: string;
    passwordConfirmation: string;
}

export default ({ match, location }: RouteComponentProps<{ token: string }>) => {
    const [email] = useState(() => new URLSearchParams(location.search).get('email') || '');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { clearFlashes, addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

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
                <LoginFormContainer
                    heading={'Atur Kata Sandi Baru'}
                    subtitle={'Buat kata sandi baru minimal 8 karakter untuk mengamankan akun Anda.'}
                >
                    <div>
                        <Label htmlFor={'reset-email'}>Email Akun</Label>
                        <AuthFieldGroup>
                            <InputLeadingIcon>
                                <FontAwesomeIcon icon={faEnvelope} />
                            </InputLeadingIcon>
                            <Input id={'reset-email'} value={email} disabled />
                        </AuthFieldGroup>
                    </div>

                    <div css={tw`mt-5`}>
                        <Label htmlFor={'reset-password'}>Kata Sandi Baru</Label>
                        <AuthFieldGroup hasRightAction>
                            <InputLeadingIcon>
                                <FontAwesomeIcon icon={faLock} />
                            </InputLeadingIcon>
                            <Field
                                id={'reset-password'}
                                name={'password'}
                                type={showPassword ? 'text' : 'password'}
                                disabled={isSubmitting}
                                placeholder={'Minimal 8 karakter'}
                                description={'Kata sandi baru minimal harus terdiri dari 8 karakter.'}
                                autoComplete={'new-password'}
                            />
                            <PasswordToggleButton
                                type={'button'}
                                onClick={() => setShowPassword((s) => !s)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} css={tw`text-sm`} />
                            </PasswordToggleButton>
                        </AuthFieldGroup>
                    </div>

                    <div css={tw`mt-5`}>
                        <Label htmlFor={'reset-password-confirm'}>Konfirmasi Kata Sandi Baru</Label>
                        <AuthFieldGroup hasRightAction>
                            <InputLeadingIcon>
                                <FontAwesomeIcon icon={faLock} />
                            </InputLeadingIcon>
                            <Field
                                id={'reset-password-confirm'}
                                name={'passwordConfirmation'}
                                type={showConfirm ? 'text' : 'password'}
                                disabled={isSubmitting}
                                placeholder={'Ulangi kata sandi baru'}
                                autoComplete={'new-password'}
                            />
                            <PasswordToggleButton
                                type={'button'}
                                onClick={() => setShowConfirm((s) => !s)}
                                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                            >
                                <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} css={tw`text-sm`} />
                            </PasswordToggleButton>
                        </AuthFieldGroup>
                    </div>

                    <div css={tw`mt-7`}>
                        <AuthSubmitButton
                            size={'xlarge'}
                            type={'submit'}
                            disabled={isSubmitting}
                            isLoading={isSubmitting}
                        >
                            <span>Simpan Kata Sandi Baru</span>
                            {!isSubmitting && <FontAwesomeIcon icon={faCheck} css={tw`text-xs`} />}
                        </AuthSubmitButton>
                    </div>

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
