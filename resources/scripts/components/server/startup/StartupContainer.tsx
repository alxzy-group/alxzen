import React, { useCallback, useEffect, useState } from 'react';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import tw from 'twin.macro';
import VariableBox from '@/components/server/startup/VariableBox';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import getServerStartup from '@/api/swr/getServerStartup';
import Spinner from '@/components/elements/Spinner';
import { ServerError } from '@/components/elements/ScreenBlock';
import { httpErrorToHuman } from '@/api/http';
import { ServerContext } from '@/state/server';
import { useDeepCompareEffect } from '@/plugins/useDeepCompareEffect';
import Select from '@/components/elements/Select';
import isEqual from 'react-fast-compare';
import Input from '@/components/elements/Input';
import setSelectedDockerImage from '@/api/server/setSelectedDockerImage';
import InputSpinner from '@/components/elements/InputSpinner';
import useFlash from '@/plugins/useFlash';
import PageHeader from '@/components/elements/PageHeader';
import EmptyState from '@/components/elements/EmptyState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCopy, faCube, faPlayCircle, faSearch, faTerminal, faTimes } from '@fortawesome/free-solid-svg-icons';
import copy from 'copy-to-clipboard';

const StartupContainer = () => {
    const [loading, setLoading] = useState(false);
    const [copiedCmd, setCopiedCmd] = useState(false);
    const [varSearch, setVarSearch] = useState('');
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const variables = ServerContext.useStoreState(
        ({ server }) => ({
            variables: server.data!.variables,
            invocation: server.data!.invocation,
            dockerImage: server.data!.dockerImage,
        }),
        isEqual
    );

    const { data, error, isValidating, mutate } = getServerStartup(uuid, {
        ...variables,
        dockerImages: { [variables.dockerImage]: variables.dockerImage },
    });

    const setServerFromState = ServerContext.useStoreActions((actions) => actions.server.setServerFromState);
    const isCustomImage =
        data &&
        !Object.values(data.dockerImages)
            .map((v) => v.toLowerCase())
            .includes(variables.dockerImage.toLowerCase());

    useEffect(() => {
        mutate();
    }, []);

    useDeepCompareEffect(() => {
        if (!data) return;

        setServerFromState((s) => ({
            ...s,
            invocation: data.invocation,
            variables: data.variables,
        }));
    }, [data]);

    const updateSelectedDockerImage = useCallback(
        (v: React.ChangeEvent<HTMLSelectElement>) => {
            setLoading(true);
            clearFlashes('startup:image');

            const image = v.currentTarget.value;
            setSelectedDockerImage(uuid, image)
                .then(() => setServerFromState((s) => ({ ...s, dockerImage: image })))
                .catch((error) => {
                    console.error(error);
                    clearAndAddHttpError({ key: 'startup:image', error });
                })
                .then(() => setLoading(false));
        },
        [uuid]
    );

    const handleCopyCommand = () => {
        if (!data?.invocation) return;
        copy(data.invocation);
        setCopiedCmd(true);
        setTimeout(() => setCopiedCmd(false), 1800);
    };

    const q = varSearch.trim().toLowerCase();
    const filteredVariables = data
        ? q
            ? data.variables.filter(
                (v) =>
                    v.name.toLowerCase().includes(q) ||
                    v.envVariable.toLowerCase().includes(q) ||
                    v.description.toLowerCase().includes(q)
            )
            : data.variables
        : [];

    return !data ? (
        !error || (error && isValidating) ? (
            <Spinner centered size={Spinner.Size.LARGE} />
        ) : (
            <ServerError title={'Connection Error'} message={httpErrorToHuman(error)} onRetry={() => mutate()} />
        )
    ) : (
        <ServerContentBlock title={'Startup Settings'} showFlashKey={'startup:image'}>
            <PageHeader
                icon={faPlayCircle}
                title={'Startup Configuration'}
                description={'Inspect the container startup command, Docker runtime image, and environment variables.'}
                badge={`${data.variables.length} Variables`}
            />
            <div css={tw`grid grid-cols-1 lg:grid-cols-12 gap-6 items-start`}>
                <TitledGreyBox icon={faTerminal} title={'Startup Command'} css={tw`lg:col-span-8`}>
                    <div className="relative">
                        <div
                            css={tw`font-mono text-xs sm:text-sm rounded-xl py-3 pl-4 pr-24 overflow-x-auto border`}
                            style={{
                                background: 'hsl(var(--bg-surface))',
                                borderColor: 'hsl(var(--border))',
                                color: '#38bdf8',
                            }}
                        >
                            {data.invocation}
                        </div>
                        <button
                            type="button"
                            onClick={handleCopyCommand}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors border"
                            style={{
                                background: copiedCmd ? 'rgba(16, 185, 129, 0.14)' : 'hsl(var(--bg-elevated))',
                                borderColor: copiedCmd ? 'rgba(52, 211, 153, 0.4)' : 'hsl(var(--border))',
                                color: copiedCmd ? '#34d399' : 'hsl(var(--text-secondary))',
                            }}
                            title="Copy Startup Command"
                        >
                            <FontAwesomeIcon icon={copiedCmd ? faCheck : faCopy} style={{ fontSize: 10 }} />
                            <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
                        </button>
                    </div>
                </TitledGreyBox>
                <TitledGreyBox icon={faCube} title={'Docker Image'} css={tw`lg:col-span-4`}>
                    {Object.keys(data.dockerImages).length > 1 && !isCustomImage ? (
                        <>
                            <InputSpinner visible={loading}>
                                <Select
                                    disabled={Object.keys(data.dockerImages).length < 2}
                                    onChange={updateSelectedDockerImage}
                                    defaultValue={variables.dockerImage}
                                >
                                    {Object.keys(data.dockerImages).map((key) => (
                                        <option key={data.dockerImages[key]} value={data.dockerImages[key]}>
                                            {key}
                                        </option>
                                    ))}
                                </Select>
                            </InputSpinner>
                            <p css={tw`text-xs mt-2.5 mb-0`} style={{ color: 'hsl(var(--text-muted))' }}>
                                Select a container runtime image to use when booting this server instance.
                            </p>
                        </>
                    ) : (
                        <>
                            <Input disabled readOnly value={variables.dockerImage} />
                            {isCustomImage && (
                                <p css={tw`text-xs mt-2.5 mb-0`} style={{ color: 'hsl(var(--text-muted))' }}>
                                    This {"server's"} Docker image has been manually set by an administrator and cannot
                                    be changed through this UI.
                                </p>
                            )}
                        </>
                    )}
                </TitledGreyBox>
            </div>
            <div css={tw`mt-8 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                <h3 css={tw`text-base font-bold tracking-tight m-0`} style={{ color: 'hsl(var(--text-primary))' }}>
                    Environment Variables
                </h3>
                {data.variables.length > 0 && (
                    <div className="relative flex items-center w-full sm:w-64">
                        <FontAwesomeIcon
                            icon={faSearch}
                            style={{
                                position: 'absolute',
                                left: 11,
                                fontSize: 11,
                                color: 'hsl(var(--text-muted))',
                                pointerEvents: 'none',
                            }}
                        />
                        <input
                            type="text"
                            value={varSearch}
                            onChange={(e) => setVarSearch(e.target.value)}
                            placeholder="Search environment variables..."
                            className="w-full pl-8 pr-8 py-1.5 rounded-xl text-xs outline-none transition-colors"
                            style={{
                                background: 'hsl(var(--bg-elevated))',
                                border: '1px solid hsl(var(--border))',
                                color: 'hsl(var(--text-primary))',
                            }}
                        />
                        {varSearch && (
                            <button
                                type="button"
                                onClick={() => setVarSearch('')}
                                style={{
                                    position: 'absolute',
                                    right: 10,
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'hsl(var(--text-muted))',
                                    cursor: 'pointer',
                                    fontSize: 11,
                                }}
                                title="Clear search"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        )}
                    </div>
                )}
            </div>
            {filteredVariables.length === 0 ? (
                <EmptyState
                    icon={faSearch}
                    title={`No matching variables for "${varSearch}"`}
                    description={'Try searching with another variable key, label, or keyword.'}
                />
            ) : (
                <div css={tw`grid gap-5 md:grid-cols-2`}>
                    {filteredVariables.map((variable) => (
                        <VariableBox key={variable.envVariable} variable={variable} />
                    ))}
                </div>
            )}
        </ServerContentBlock>
    );
};

export default StartupContainer;
