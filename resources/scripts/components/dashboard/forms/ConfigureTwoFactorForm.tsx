import React, { useEffect, useState } from 'react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import SetupTOTPDialog from '@/components/dashboard/forms/SetupTOTPDialog';
import RecoveryTokensDialog from '@/components/dashboard/forms/RecoveryTokensDialog';
import DisableTOTPDialog from '@/components/dashboard/forms/DisableTOTPDialog';
import { useFlashKey } from '@/plugins/useFlash';

export default () => {
    const [tokens, setTokens] = useState<string[]>([]);
    const [visible, setVisible] = useState<'enable' | 'disable' | null>(null);
    const isEnabled = useStoreState((state: ApplicationStore) => state.user.data!.useTotp);
    const { clearAndAddHttpError } = useFlashKey('account:two-step');

    useEffect(() => {
        return () => {
            clearAndAddHttpError();
        };
    }, [visible]);

    const onTokens = (tokens: string[]) => {
        setTokens(tokens);
        setVisible(null);
    };

    return (
        <div>
            <SetupTOTPDialog open={visible === 'enable'} onClose={() => setVisible(null)} onTokens={onTokens} />
            <RecoveryTokensDialog tokens={tokens} open={tokens.length > 0} onClose={() => setTokens([])} />
            <DisableTOTPDialog open={visible === 'disable'} onClose={() => setVisible(null)} />
            <p css={tw`text-sm`}>
                {isEnabled
                    ? 'Two-step verification is currently enabled on your account.'
                    : 'You do not currently have two-step verification enabled on your account. Click the button below to begin configuring it.'}
            </p>
            <div css={tw`mt-6`}>
                {isEnabled ? (
                    <Button.Danger 
                        onClick={() => setVisible('disable')}
                        css={tw`w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 rounded-xl font-semibold py-3 transition-all`}
                    >
                        Disable Two-Step
                    </Button.Danger>
                ) : (
                    <Button 
                        onClick={() => setVisible('enable')}
                        css={tw`w-full bg-indigo-500 hover:bg-indigo-400 border-none rounded-xl text-white font-semibold py-3 shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] transition-all`}
                    >
                        Enable Two-Step
                    </Button>
                )}
            </div>
        </div>
    );
};
