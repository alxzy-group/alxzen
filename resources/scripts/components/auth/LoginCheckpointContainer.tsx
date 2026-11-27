import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import loginCheckpoint from '@/api/auth/loginCheckpoint';
import LoginFormContainer, {
    AuthFieldGroup,
    AuthSecondaryLink,
    AuthSubmitButton,
    InputLeadingIcon,
} from '@/components/auth/LoginFormContainer';
import { ActionCreator } from 'easy-peasy';
import { StaticContext } from 'react-router';
import { useFormikContext, withFormik } from 'formik';
import useFlash from '@/plugins/useFlash';
import { FlashStore } from '@/state/flashes';
import Field from '@/components/elements/Field';
import Label from '@/components/elements/Label';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faKey, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

interface Values {
    code: string;
    recoveryCode: '';
}

type OwnProps = RouteComponentProps<Record<string, string | undefined>, StaticContext, { token?: string }>;

type Props = OwnProps & {
    clearAndAddHttpError: ActionCreator<FlashStore['clearAndAddHttpError']['payload']>;
};

const LoginCheckpointContainer = () => {
    const { isSubmitting, setFieldValue } = useFormikContext<Values>();
    const [isMissingDevice, setIsMissingDevice] = useState(false);

    return (
        <LoginFormContainer
            heading={'Verifikasi Dua Langkah'}
            subtitle={
                isMissingDevice
                    ? 'Masukkan salah satu kode pemulihan cadangan akun Anda.'
                    : 'Masukkan kode 6-digit dari aplikasi authenticator Anda.'
            }
        >
            <div>
                <Label htmlFor={'checkpoint-code'}>
                    {isMissingDevice ? 'Kode Pemulihan (Recovery Code)' : 'Kode Autentikasi 2FA'}
                </Label>
                <AuthFieldGroup monospace>
                    <InputLeadingIcon>
                        <FontAwesomeIcon icon={isMissingDevice ? faKey : faShieldAlt} />
                    </InputLeadingIcon>
                    <Field
                        id={'checkpoint-code'}
                        name={isMissingDevice ? 'recoveryCode' : 'code'}
                        description={
                            isMissingDevice
                                ? 'Masukkan salah satu recovery code yang tersimpan saat aktivasi 2FA.'
                                : 'Masukkan token 6-digit yang dihasilkan aplikasi authenticator Anda.'
                        }
                        type={'text'}
                        placeholder={isMissingDevice ? 'XXXX-XXXX-XXXX' : '000000'}
                        autoComplete={'one-time-code'}
                        disabled={isSubmitting}
                        autoFocus
                    />
                </AuthFieldGroup>
            </div>

            <div css={tw`mt-7`}>
                <AuthSubmitButton size={'xlarge'} type={'submit'} disabled={isSubmitting} isLoading={isSubmitting}>
                    <span>Verifikasi &amp; Lanjutkan</span>
                    {!isSubmitting && <FontAwesomeIcon icon={faArrowRight} css={tw`text-xs`} />}
                </AuthSubmitButton>
            </div>

            <div css={tw`mt-5 text-center`}>
                <button
                    type={'button'}
                    onClick={() => {
                        setFieldValue('code', '');
                        setFieldValue('recoveryCode', '');
                        setIsMissingDevice((s) => !s);
                    }}
                    css={tw`bg-transparent border-0 cursor-pointer text-xs sm:text-sm text-sky-400 hover:text-sky-300 font-semibold transition-colors duration-150 inline-block`}
                >
                    {!isMissingDevice ? 'Gunakan Kode Pemulihan (Perangkat Hilang)' : 'Gunakan Kode Authenticator'}
                </button>
            </div>

            <div css={tw`mt-3 text-center`}>
                <AuthSecondaryLink to={'/auth/login'}>
                    <FontAwesomeIcon icon={faArrowLeft} css={tw`text-xs`} />
                    <span>Kembali ke Halaman Login</span>
                </AuthSecondaryLink>
            </div>
        </LoginFormContainer>
    );
};

const EnhancedForm = withFormik<Props, Values>({
    handleSubmit: ({ code, recoveryCode }, { setSubmitting, props: { clearAndAddHttpError, location } }) => {
        loginCheckpoint(location.state?.token || '', code, recoveryCode)
            .then((response) => {
                if (response.complete) {
                    // @ts-expect-error this is valid
                    window.location = response.intended || '/';
                    return;
                }

                setSubmitting(false);
            })
            .catch((error) => {
                console.error(error);
                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
    },

    mapPropsToValues: () => ({
        code: '',
        recoveryCode: '',
    }),
})(LoginCheckpointContainer);

export default ({ history, location, ...props }: OwnProps) => {
    const { clearAndAddHttpError } = useFlash();

    if (!location.state?.token) {
        history.replace('/auth/login');

        return null;
    }

    return (
        <EnhancedForm clearAndAddHttpError={clearAndAddHttpError} history={history} location={location} {...props} />
    );
};
