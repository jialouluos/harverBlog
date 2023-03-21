import request from '@/utils/request';
import { I_Response } from '@/api/base';
/**
 * 
 * @param type 'classify' | 'label'
 * @returns Promise<I_Response<T_Classify | T_Label>>
 */
export const getCategoryData = async <T = any>(type: 'classify' | 'label'): Promise<T> => {
    return new Promise((_res, _rej) => {
        request.get<any, I_Response<T>>(`blog/categorys?categorytype=${type}`).then((res) => {
            if (res.status !== 200) {
                _rej(res.reason);
            }
            _res(res.data);
        }).catch((err: Error) => {
            _rej(err);
        });
    });
};
export const getCategoryList = async <T = any>(type: 'classify' | 'label', value: string, seektype: 2|1, pagenum: number, pagesize: number, onlyPublic: boolean): Promise<T> => {
    return new Promise((_res, _rej) => {
        request.get<any, I_Response<T>>(`blog/screen_article?categorytype=${type}&condition=${value}&type=${seektype}&pagenum=${pagenum}&pagesize=${pagesize}&onlyPublic=${onlyPublic}`).then((res) => {
            if (res.status !== 200) {
                _rej(res.reason);
            }
            _res(res.data);
        }).catch((err: Error) => {
            _rej(err);
        });
    });
};
