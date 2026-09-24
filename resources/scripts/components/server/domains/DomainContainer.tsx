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
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-8/12">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl relative">
                        <SpinnerOverlay visible={loading} />
                        <h2 className="text-gray-100 font-semibold mb-4 text-xl">Active Subdomains</h2>
                        
                        {!loading && domains.length === 0 && (
                            <p className="text-gray-400 text-sm">No subdomains have been created for this server.</p>
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
                
                <div className="w-full md:w-4/12">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl relative">
                        <SpinnerOverlay visible={submitting} />
                        <h2 className="text-gray-100 font-semibold mb-4 text-xl">Create Subdomain</h2>
                        
                        <form onSubmit={submit}>
                            <p className="text-sm text-gray-400 mb-6">
                                Create a free, instantly active subdomain for your server.
                            </p>
                            
                            <div className="flex items-center mb-6">
                                <Input 
                                    type="text"
                                    name="domain"
                                    placeholder="myserver"
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())}
                                    disabled={submitting}
                                    className="flex-1 rounded-r-none border-white/10 bg-black/20 focus:ring-sky-500 focus:border-sky-500 text-gray-200"
                                />
                                <div className="bg-black/50 border border-white/10 border-l-0 px-4 py-[11px] rounded-r flex items-center text-gray-300">
                                    <span className="opacity-70 select-none">.{(window as any).SiteConfiguration?.subdomain_base || 'yourdomain.com'}</span>
                                </div>
                            </div>
                            
                            <div className="flex justify-end">
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
