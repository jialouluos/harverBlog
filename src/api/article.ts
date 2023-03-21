import request from '@/utils/request';
import CryptoJS from 'crypto-js';
import { I_Response } from '@/api/base';
import { I_SingleArticlePassword } from '@/types';
import { I_ResComment, I_ReqComment } from '@/types';

export const getArticleData = async <T = any>(type: 2 | 1, pageNumber: number, pageSize: number, onlyPublic: boolean): Promise<T> => {
    return new Promise((_res, _rej) => {
        request.get<any, I_Response<T>>(`blog/articles?type=${type}&pagenum=${pageNumber}&pagesize=${pageSize}&onlyPublic=${onlyPublic}`).then((res) => {
            if (res.status !== 200) {
                _rej(res.reason);
            }
            (res.data as any).data = ((res.data as any).data as any).map((item: any) => {
                const bytes = CryptoJS.AES.decrypt(item, ((res.data as any) as any).user);
                return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            });
            _res(res.data);
        }).catch((err: Error) => {
            _rej(err);
        });
    });
};
export const checkSingleArticlePublic = async <T = any>(id: string): Promise<T> => {
    return new Promise((_res, _rej) => {
        request.get<any, I_Response<T>>(`blog/public?id=${id}`).then((res) => {
            if (res.status !== 200) {
                _rej(res.reason);
            }
            _res(res.data);
        }).catch((err: Error) => {
            _rej(err);
        });
    });
};
export const checkSingleArticlePassword = async <T = any>(id: string, password: string): Promise<T> => {
    return new Promise((_res, _rej) => {
        request.get<any, I_Response<T>>(`blog/check_pwd?id=${id}&password=${password}`).then((res) => {
            if (res.status !== 200) {
                _rej(res.reason);
            }
            _res(res.data);
        }).catch((err: Error) => {
            _rej(err);
        });
    });
};
export const getSingleArticle = async <T = any>(id: string, password: string): Promise<T> => {
    return new Promise((_res, _rej) => {
        request.get<any, I_Response<T>>(`blog/article?id=${id}&vaildpwd=${password}`).then((res) => {
            if (res.status !== 200) {
                _rej(res.reason);
            }
            const bytes = CryptoJS.AES.decrypt((res.data as any).article, ((res.data as any) as any).user);
            (res.data as any).article = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            _res(res.data);
        }).catch((err: Error) => {
            _rej(err);
        });
    });
};
export const getQQHeadAndNickname = async <T = any>(qq: string): Promise<T> => {
    return new Promise((_res, _rej) => {
        request.get<any, I_Response<T>>(`blog/qq_header?qq=${qq}`).then((res) => {
            if (res.status !== 200) {
                _rej(res.reason);
            }
            _res(res.data);
        }).catch((err: Error) => {
            _rej(err);
        });
    });
};
export const addComment = async <T = any>(data: I_ReqComment): Promise<T> => {

    return new Promise((_res, _rej) => {
        request.post<any, I_Response<T>>(`blog/add_comment`, data).then((res) => {
            if (res.status !== 200) {
                _rej(res.reason);
            }
            _res(res.reason as any);
        }).catch((err: Error) => {
            _rej(err);
        });
    });
};
export const getComments = async <T = I_ResComment[]>(id: string): Promise<T> => {
    return new Promise((_res, _rej) => {
        request.get<any, I_Response<T>>(`blog/comments?id=${id}`).then((res) => {
            if (res.status !== 200) {
                _rej(res.reason);
            }
            _res(res.data);
        }).catch((err: Error) => {
            _rej(err);
        });
    });
};
