import request from '@/utils/request';
import { I_Response } from '@/api/base';

export const getProjectData = async <T = any>(): Promise<T> => {
    return new Promise((_res, _rej) => {
        request.get<any, I_Response<T>>(`blog/links?linktype=project`).then((res) => {
            if (res.status !== 200) {
                _rej(res.reason);
            }
            _res(res.data);
        }).catch((err: Error) => {
            _rej(err);
        });
    });
};
export const getFriendData = async <T = any>(): Promise<T> => {
    return new Promise((_res, _rej) => {
        request.get<any, I_Response<T>>(`blog/links?linktype=friend`).then((res) => {
            if (res.status !== 200) {
                _rej(res.reason);
            }
            _res(res.data);
        }).catch((err: Error) => {
            _rej(err);
        });
    });
};