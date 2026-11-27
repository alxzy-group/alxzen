import React, { useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import login from '@/api/auth/login';
import LoginFormContainer, {
    AuthFieldGroup,
    AuthSubmitButton,
    InputLeadingIcon,
    PasswordToggleButton,
} from '@/components/auth/LoginFormContainer';
import { useStoreState } from 'easy-peasy';
import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import Field from '@/components/elements/Field';
import tw from 'twin.macro';
import Reaptcha from 'reaptcha';
import useFlash from '@/plugins/useFlash';
import Label from '@/components/elements/Label';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faEye, faEyeSlash, faLock, faUser } from '@fortawesome/free-solid-svg-icons';

interface Values {
    username: string;
    password: string;
}

const LoginContainer = ({ history }: RouteComponentProps) => {
    const ref = useRef<Reaptcha>(null);
    const [token, setToken] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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
                <LoginFormContainer
                    heading={'Masuk ke Workspace'}
                    subtitle={'Masukkan username atau email dan kata sandi akun Anda untuk melanjutkan.'}
                >
                    <div>
                        <Label htmlFor={'login-username'}>Username atau Email</Label>
                        <AuthFieldGroup>
                            <InputLeadingIcon>
                                <FontAwesomeIcon icon={faUser} />
                            </InputLeadingIcon>
                            <Field
                                id={'login-username'}
                                type={'text'}
                                name={'username'}
                                disabled={isSubmitting}
                                placeholder={'namauser atau email@domain.com'}
                                autoComplete={'username'}
                            />
                        </AuthFieldGroup>
                    </div>

                    <div css={tw`mt-5`}>
                        <div css={tw`flex items-center justify-between mb-1.5`}>
                            <Label htmlFor={'login-password'} style={{ marginBottom: 0 }}>
                                Kata Sandi
                            </Label>
                            <Link
                                to={'/auth/password'}
                                css={tw`text-xs font-semibold text-sky-400 hover:text-sky-300 no-underline transition-colors duration-150`}
                            >
                                Lupa kata sandi?
                            </Link>
                        </div>
                        <AuthFieldGroup hasRightAction>
                            <InputLeadingIcon>
                                <FontAwesomeIcon icon={faLock} />
                            </InputLeadingIcon>
                            <Field
                                id={'login-password'}
                                type={showPassword ? 'text' : 'password'}
                                name={'password'}
                                disabled={isSubmitting}
                                placeholder={'••••••••••••'}
                                autoComplete={'current-password'}
                            />
                            <PasswordToggleButton
                                type={'button'}
                                onClick={() => setShowPassword((s) => !s)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} css={tw`text-sm`} />
                            </PasswordToggleButton>
                        </AuthFieldGroup>
                    </div>

                    <div css={tw`mt-7`}>
                        <AuthSubmitButton
                            type={'submit'}
                            size={'xlarge'}
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            <span>Masuk ke Panel</span>
                            {!isSubmitting && <FontAwesomeIcon icon={faArrowRight} css={tw`text-xs`} />}
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
                </LoginFormContainer>
            )}
        </Formik>
    );
};

export default LoginContainer;
