import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { useFlashKey } from '@/plugins/useFlash';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import Input from '@/components/elements/Input';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { getServerDomains, createServerDomain, ServerDomain } from '@/api/server/domains';
import DomainRow from '@/components/server/domains/DomainRow';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('server:domains');
    
    const [domains, setDomains] = useState<ServerDomain[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newDomain, setNewDomain] = useState('');

    const refreshDomains = () => {
        setLoading(true);
        getServerDomains(uuid)
            .then(setDomains)
            .catch(clearAndAddHttpError)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        refreshDomains();
    }, [uuid]);

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        
        clearFlashes();
        setSubmitting(true);
        
        createServerDomain(uuid, newDomain)
            .then((domain) => {
                setDomains((s) => [...s, domain]);
                setNewDomain('');
            })
            .catch(clearAndAddHttpError)
            .finally(() => setSubmitting(false));
    };

    return (
        <ServerContentBlock title={'Subdomains'} showFlashKey={'server:domains'}>
            <div css={tw`flex flex-col md:flex-row gap-8`}>
                <div css={tw`w-full md:w-8/12`}>
                    <div css={tw`bg-neutral-700 p-4 rounded shadow-md relative`}>
                        <SpinnerOverlay visible={loading} />
                        <h2 css={tw`text-neutral-300 font-semibold mb-4 text-xl`}>Active Subdomains</h2>
                        
                        {!loading && domains.length === 0 && (
                            <p css={tw`text-neutral-400 text-sm`}>No subdomains have been created for this server.</p>
                        )}

                        {domains.map((domain) => (
                            <DomainRow 
                                key={domain.id} 
                                domain={domain} 
                                onDeleted={() => setDomains(s => s.filter(d => d.id !== domain.id))}
                                onUpdated={(d) => setDomains(s => s.map(x => x.id === d.id ? d : x))}
                            />
                        ))}
                    </div>
                </div>
                
                <div css={tw`w-full md:w-4/12`}>
                    <div css={tw`bg-neutral-700 p-4 rounded shadow-md relative`}>
                        <SpinnerOverlay visible={submitting} />
                        <h2 css={tw`text-neutral-300 font-semibold mb-4 text-xl`}>Create Subdomain</h2>
                        
                        <form onSubmit={submit}>
                            <p css={tw`text-sm text-neutral-400 mb-4`}>
                                Create a free, instantly active subdomain for your server.
                            </p>
                            
                            <div css={tw`flex items-center mb-4`}>
                                <Input 
                                    type="text"
                                    name="domain"
                                    placeholder="myserver"
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())}
                                    disabled={submitting}
                                    css={tw`flex-1 rounded-r-none`}
                                />
                                <div css={tw`bg-neutral-600 border border-neutral-700 border-l-0 px-4 py-2 rounded-r flex items-center text-neutral-300`}>
                                    <span css={tw`opacity-50 select-none`}>.{(window as any).SiteConfiguration?.subdomain_base || 'yourdomain.com'}</span>
                                </div>
                            </div>
                            
                            <div css={tw`flex justify-end`}>
                                <Button type="submit" color="primary" disabled={submitting || newDomain.length < 3}>
                                    Create Subdomain
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ServerContentBlock>
    );
};
