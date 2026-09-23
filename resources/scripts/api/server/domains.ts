import http from '@/api/http';

export interface ServerDomain {
    id: number;
    domain: string;
    status: string;
    verification_cname_name: string | null;
    verification_cname_target: string | null;
    created_at: string;
}

export const getServerDomains = async (uuid: string): Promise<ServerDomain[]> => {
    const { data } = await http.get(`/api/client/servers/${uuid}/domains`);
    return (data.data || []).map((item: any) => item.attributes);
};

export const createServerDomain = async (uuid: string, domain: string): Promise<ServerDomain> => {
    const { data } = await http.post(`/api/client/servers/${uuid}/domains`, { domain });
    return data.attributes;
};

export const deleteServerDomain = async (uuid: string, id: number): Promise<void> => {
    await http.delete(`/api/client/servers/${uuid}/domains/${id}`);
};

export const verifyServerDomain = async (uuid: string, id: number): Promise<ServerDomain> => {
    const { data } = await http.post(`/api/client/servers/${uuid}/domains/${id}/verify`);
    return data.attributes;
};
