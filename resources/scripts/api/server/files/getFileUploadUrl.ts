import http from '@/api/http';

export interface FileUploadInfo {
    url: string;
    uploadLimitMb: number;
}

export const getFileUploadInfo = (uuid: string): Promise<FileUploadInfo> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}/files/upload`)
            .then(({ data }) =>
                resolve({
                    url: data.attributes.url,
                    uploadLimitMb: Number(data.attributes.upload_limit_mb) || 100,
                })
            )
            .catch(reject);
    });
};

export default (uuid: string): Promise<string> => getFileUploadInfo(uuid).then((info) => info.url);
