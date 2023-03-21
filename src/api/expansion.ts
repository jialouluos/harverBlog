import request from '@/utils/request';
import { I_Response } from '@/api/base';

export const getNoticeData = async <T = any>(): Promise<T> => {
    return new Promise((_res, _rej) => {
        request.get<any, I_Response<T>>(`blog/notice`).then((res) => {
            if (res.status !== 200) {
                _rej(res.reason);
            }
            _res(res.data);
        }).catch((err: Error) => {
            _rej(err);
        });
    });
};
export const getPersonData = async <T = any>(): Promise<T> => {
    return new Promise((_res, _rej) => {
        request.get<any, I_Response<T>>(`blog/about`).then((res) => {
            if (res.status !== 200) {
                _rej(res.reason);
            }
            _res(res.data);
        }).catch((err: Error) => {
            _rej(err);
        });
    });
};
export const getRandomQuestionByType = async <T = any>(type: string): Promise<T> => {
    return new Promise((_res, _rej) => {
        request.get<any, I_Response<T>>(`blog/question?type=${type}`).then((res) => {
            if (res.status !== 200) {
                _rej(res.reason);
            }
            _res(res.data);
        }).catch((err: Error) => {
            _rej(err);
        });
    });
};
export const getRandomQuestionByAll = async <T = any>(): Promise<T> => {
    return new Promise((_res, _rej) => {
        request.get<any, I_Response<T>>(`blog/questions`).then((res) => {
            if (res.status !== 200) {
                _rej(res.reason);
            }
            _res(res.data);
        }).catch((err: Error) => {
            _rej(err);
        });
    });
};
export const getQuestionTypes = async <T = any>(): Promise<T> => {
    return new Promise((_res, _rej) => {
        request.get<any, I_Response<T>>(`blog/question_types`).then((res) => {
            if (res.status !== 200) {
                _rej(res.reason);
            }
            _res(res.data);
        }).catch((err: Error) => {
            _rej(err);
        });
    });
};
