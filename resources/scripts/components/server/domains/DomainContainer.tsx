import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { useFlashKey } from '@/plugins/useFlash';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Button from '@/components/elements/Button';
import Input from '@/components/elements/Input';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { getServerDomains, createServerDomain, ServerDomain } from '@/api/server/domains';
import DomainRow from '@/components/server/domains/DomainRow';
import PageHeader from '@/components/elements/PageHeader';
import EmptyState from '@/components/elements/EmptyState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faPlusCircle } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const domainLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.domains ?? 0);
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
            <PageHeader
                icon={faGlobe}
                title={'Subdomains'}
                description={'Attach instant custom subdomains routed directly to your server allocation.'}
                badge={domainLimit > 0 ? `${domains.length} / ${domainLimit} Used` : undefined}
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 xl:col-span-8">
                    <div
                        className="p-6 rounded-2xl relative"
                        style={{
                            background: 'hsl(var(--bg-elevated))',
                            border: '1px solid hsl(var(--border))',
                            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03), 0 8px 24px rgba(0, 0, 0, 0.18)',
                        }}
                    >
                        <SpinnerOverlay visible={loading} />
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-base m-0" style={{ color: 'hsl(var(--text-primary))' }}>
                                Active Subdomains
                            </h2>
                            <span
                                className="text-xs font-mono px-2.5 py-0.5 rounded-full"
                                style={{
                                    background: 'hsl(var(--bg-surface))',
                                    border: '1px solid hsl(var(--border))',
                                    color: 'hsl(var(--text-muted))',
                                }}
                            >
                                {domains.length} Active
                            </span>
                        </div>

                        {!loading && domains.length === 0 ? (
                            <EmptyState
                                icon={faGlobe}
                                title={'No Subdomains Configured'}
                                description={'Create a custom subdomain on the right panel to route web traffic directly to this instance.'}
                            />
                        ) : (
                            <div className="flex flex-col gap-3">
                                {domains.map((domain) => (
                                    <DomainRow
                                        key={domain.id}
                                        domain={domain}
                                        onDeleted={() => setDomains((s) => s.filter((d) => d.id !== domain.id))}
                                        onUpdated={(d) => setDomains((s) => s.map((x) => (x.id === d.id ? d : x)))}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-5 xl:col-span-4">
                    <div
                        className="p-6 rounded-2xl relative"
                        style={{
                            background: 'hsl(var(--bg-elevated))',
                            border: '1px solid hsl(var(--border))',
                            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03), 0 8px 24px rgba(0, 0, 0, 0.18)',
                        }}
                    >
                        <SpinnerOverlay visible={submitting} />
                        <div className="flex items-center gap-2.5 mb-3">
                            <FontAwesomeIcon icon={faPlusCircle} style={{ color: '#38bdf8' }} />
                            <h2 className="font-bold text-base m-0" style={{ color: 'hsl(var(--text-primary))' }}>
                                Create Subdomain
                            </h2>
                        </div>

                        {domainLimit === 0 ? (
                            <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/25 p-4 rounded-xl">
                                Subdomains cannot be created for this server (Domain Limit is 0). Contact an administrator to allocate domains.
                            </div>
                        ) : domainLimit > 0 && domains.length >= domainLimit ? (
                            <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/25 p-4 rounded-xl">
                                You have reached the maximum limit of {domainLimit} {domainLimit === 1 ? 'subdomain' : 'subdomains'} for this server.
                            </div>
                        ) : (
                            <form onSubmit={submit}>
                                <p className="text-xs mb-4" style={{ color: 'hsl(var(--text-muted))' }}>
                                    Create an instantly routed HTTPS subdomain pointing directly to this server.
                                </p>

                                <div className="flex items-stretch mb-5">
                                    <Input
                                        type="text"
                                        name="domain"
                                        placeholder="myserver"
                                        value={newDomain}
                                        onChange={(e) =>
                                            setNewDomain(e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())
                                        }
                                        disabled={submitting}
                                        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                                    />
                                    <div
                                        className="px-3.5 flex items-center text-xs font-mono whitespace-nowrap"
                                        style={{
                                            background: 'hsl(var(--bg-surface))',
                                            border: '1.5px solid hsl(var(--input-border))',
                                            borderLeft: 'none',
                                            borderTopRightRadius: 'var(--radius, 10px)',
                                            borderBottomRightRadius: 'var(--radius, 10px)',
                                            color: '#38bdf8',
                                        }}
                                    >
                                        .{(window as any).SiteConfiguration?.subdomain_base || 'yourdomain.com'}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" color="primary" disabled={submitting || newDomain.length < 3}>
                                        Create Subdomain
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </ServerContentBlock>
    );
};
