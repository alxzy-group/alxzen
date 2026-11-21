import React, { useEffect, useRef, useState } from 'react';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';
import { Field, Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { Actions, useStoreActions, useStoreState } from 'easy-peasy';
import { object, string } from 'yup';
import debounce from 'debounce';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import InputSpinner from '@/components/elements/InputSpinner';
import getServers from '@/api/getServers';
import { Server } from '@/api/server/getServer';
import { ApplicationStore } from '@/state';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import Input from '@/components/elements/Input';
import { ip } from '@/lib/formatters';

type Props = RequiredModalProps;

interface Values {
    term: string;
}

const CustomInput = styled(Input)`
    ${tw`rounded-xl transition-all shadow-none`}
    background: hsl(var(--bg-surface)) !important;
    border: 1.5px solid hsl(var(--border)) !important;
    color: hsl(var(--text-primary)) !important;
    &:focus {
        border-color: #38bdf8 !important;
        box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.16) !important;
    }
`;

const ServerResult = styled(Link)`
    ${tw`flex items-center p-3.5 rounded-xl no-underline transition-all duration-150`}
    background: hsl(var(--bg-surface));
    border: 1px solid hsl(var(--border));

    &:hover {
        background: rgba(14, 165, 233, 0.08);
        border-color: rgba(56, 189, 248, 0.45);
        transform: translateY(-1px);
    }

    &:not(:last-of-type) {
        ${tw`mb-2`};
    }
`;

const SearchWatcher = () => {
    const { values, submitForm } = useFormikContext<Values>();

    useEffect(() => {
        if (values.term.length >= 3) {
            submitForm();
        }
    }, [values.term]);

    return null;
};

export default ({ ...props }: Props) => {
    const ref = useRef<HTMLInputElement>(null);
    const isOwner = useStoreState((state) =>
        Boolean(
            (state.user.data as any)?.isOwner ||
            (state.user.data as any)?.is_owner ||
            (window as any).PterodactylUser?.is_owner ||
            (window as any).PterodactylUser?.isOwner
        )
    );
    const [servers, setServers] = useState<Server[]>([]);
    const { clearAndAddHttpError, clearFlashes } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes
    );

    const search = debounce(({ term }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('search');

        getServers({ query: term, type: isOwner ? 'admin-all' : undefined })
            .then((servers) => setServers(servers.items.filter((_, index) => index < 5)))
            .catch((error) => {
                console.error(error);
                clearAndAddHttpError({ key: 'search', error });
            })
            .then(() => setSubmitting(false))
            .then(() => ref.current?.focus());
    }, 500);

    useEffect(() => {
        if (props.visible) {
            if (ref.current) ref.current.focus();
        }
    }, [props.visible]);

    const InputWithRef = (inputProps: any) => <CustomInput autoFocus {...inputProps} ref={ref} />;

    return (
        <Formik
            onSubmit={search}
            validationSchema={object().shape({
                term: string().min(3, 'Please enter at least three characters to begin searching.'),
            })}
            initialValues={{ term: '' } as Values}
        >
            {({ isSubmitting }) => (
                <Modal {...props}>
                    <Form>
                        <FormikFieldWrapper
                            name={'term'}
                            label={'Quick Server Search'}
                            description={'Enter a server name, UUID, or IP:port allocation (min. 3 characters).'}
                        >
                            <SearchWatcher />
                            <InputSpinner visible={isSubmitting}>
                                <Field as={InputWithRef} name={'term'} placeholder={'Search servers...'} />
                            </InputSpinner>
                        </FormikFieldWrapper>
                    </Form>
                    {servers.length > 0 && (
                        <div css={tw`mt-5`}>
                            {servers.map((server) => (
                                <ServerResult
                                    key={server.uuid}
                                    to={`/server/${server.id}`}
                                    onClick={() => props.onDismissed()}
                                >
                                    <div css={tw`flex-1 mr-4 min-w-0`}>
                                        <p
                                            css={tw`truncate m-0 text-sm font-bold`}
                                            style={{ color: 'hsl(var(--text-primary))' }}
                                        >
                                            {server.name}
                                        </p>
                                        <p
                                            css={tw`mt-1 text-xs font-mono m-0`}
                                            style={{ color: 'hsl(var(--text-muted))', fontVariantNumeric: 'tabular-nums' }}
                                        >
                                            {server.allocations
                                                .filter((alloc) => alloc.isDefault)
                                                .map((allocation) => (
                                                    <span key={allocation.ip + allocation.port.toString()}>
                                                        {allocation.alias || ip(allocation.ip)}:{allocation.port}
                                                    </span>
                                                ))}
                                        </p>
                                    </div>
                                    <div css={tw`flex-none text-right`}>
                                        <span
                                            style={{
                                                fontSize: 11,
                                                padding: '3px 9px',
                                                borderRadius: 999,
                                                background: 'rgba(14, 165, 233, 0.12)',
                                                color: '#38bdf8',
                                                border: '1px solid rgba(56, 189, 248, 0.25)',
                                                fontWeight: 700,
                                            }}
                                        >
                                            {server.node}
                                        </span>
                                    </div>
                                </ServerResult>
                            ))}
                        </div>
                    )}
                </Modal>
            )}
        </Formik>
    );
};
