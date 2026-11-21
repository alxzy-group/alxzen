import React, { memo, useState } from 'react';
import { ServerEggVariable } from '@/api/server/types';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { usePermissions } from '@/plugins/usePermissions';
import InputSpinner from '@/components/elements/InputSpinner';
import Input from '@/components/elements/Input';
import Switch from '@/components/elements/Switch';
import { debounce } from 'debounce';
import updateStartupVariable from '@/api/server/updateStartupVariable';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import getServerStartup from '@/api/swr/getServerStartup';
import Select from '@/components/elements/Select';
import isEqual from 'react-fast-compare';
import { ServerContext } from '@/state/server';

interface Props {
    variable: ServerEggVariable;
}

const VariableBox = ({ variable }: Props) => {
    const FLASH_KEY = `server:startup:${variable.envVariable}`;

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [loading, setLoading] = useState(false);
    const [canEdit] = usePermissions(['startup.update']);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { mutate } = getServerStartup(uuid);

    const setVariableValue = debounce((value: string) => {
        setLoading(true);
        clearFlashes(FLASH_KEY);

        updateStartupVariable(uuid, variable.envVariable, value)
            .then(([response, invocation]) =>
                mutate(
                    (data) => ({
                        ...data,
                        invocation,
                        variables: (data.variables || []).map((v) =>
                            v.envVariable === response.envVariable ? response : v
                        ),
                    }),
                    false
                )
            )
            .catch((error) => {
                console.error(error);
                clearAndAddHttpError({ error, key: FLASH_KEY });
            })
            .then(() => setLoading(false));
    }, 500);

    const useSwitch = variable.rules.some(
        (v) => v === 'boolean' || v === 'in:0,1' || v === 'in:1,0' || v === 'in:true,false' || v === 'in:false,true'
    );
    const isStringSwitch = variable.rules.some((v) => v === 'string');
    const selectValues = variable.rules.find((v) => v.startsWith('in:'))?.split(',') || [];

    return (
        <TitledGreyBox
            title={
                <div className='flex items-center justify-between w-full gap-2 flex-wrap'>
                    <div className='flex items-center gap-2'>
                        {!variable.isEditable && (
                            <span
                                className='px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border'
                                style={{
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    borderColor: 'rgba(245, 158, 11, 0.3)',
                                    color: '#fbbf24',
                                }}
                            >
                                Read Only
                            </span>
                        )}
                        <span style={{ color: 'hsl(var(--text-primary))' }}>{variable.name}</span>
                    </div>
                    <code
                        className='font-mono text-[10px] px-2 py-0.5 rounded-md border'
                        style={{
                            background: 'hsl(var(--bg-elevated))',
                            borderColor: 'hsl(var(--border))',
                            color: '#38bdf8',
                        }}
                    >
                        {variable.envVariable}
                    </code>
                </div>
            }
        >
            <FlashMessageRender byKey={FLASH_KEY} className='mb-3' />
            <InputSpinner visible={loading}>
                {useSwitch ? (
                    <Switch
                        readOnly={!canEdit || !variable.isEditable}
                        name={variable.envVariable}
                        defaultChecked={
                            isStringSwitch ? variable.serverValue === 'true' : variable.serverValue === '1'
                        }
                        onChange={() => {
                            if (canEdit && variable.isEditable) {
                                if (isStringSwitch) {
                                    setVariableValue(variable.serverValue === 'true' ? 'false' : 'true');
                                } else {
                                    setVariableValue(variable.serverValue === '1' ? '0' : '1');
                                }
                            }
                        }}
                    />
                ) : selectValues.length > 0 ? (
                    <Select
                        onChange={(e) => setVariableValue(e.target.value)}
                        name={variable.envVariable}
                        defaultValue={variable.serverValue ?? variable.defaultValue}
                        disabled={!canEdit || !variable.isEditable}
                    >
                        {selectValues.map((selectValue) => (
                            <option
                                key={selectValue.replace('in:', '')}
                                value={selectValue.replace('in:', '')}
                            >
                                {selectValue.replace('in:', '')}
                            </option>
                        ))}
                    </Select>
                ) : (
                    <Input
                        onKeyUp={(e) => {
                            if (canEdit && variable.isEditable) {
                                setVariableValue(e.currentTarget.value);
                            }
                        }}
                        readOnly={!canEdit || !variable.isEditable}
                        name={variable.envVariable}
                        defaultValue={variable.serverValue ?? ''}
                        placeholder={variable.defaultValue}
                    />
                )}
            </InputSpinner>

            <p className='mt-2.5 text-xs mb-0' style={{ color: 'hsl(var(--text-muted))' }}>
                {variable.description}
            </p>
        </TitledGreyBox>
    );
};

export default memo(VariableBox, isEqual);
