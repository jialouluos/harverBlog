import request from '@/utils/request';
import { I_Response } from '@/api/base';
import dayjs from 'dayjs';
import { Window } from '@/api';
import axios from 'axios';
declare const window: Window & typeof globalThis;
export const getVisitData = async <T = any>(): Promise<T> => {
    return new Promise((_res, _rej) => {
        request.get<any, I_Response<T>>(`blog/visit_count`).then((res) => {
            if (res.status !== 200) {
                _rej(res.reason);
            }
            _res(res.data);
        }).catch((err: Error) => {
            _rej(err);
        });
    });
};
export const addVisiter = async <T = any>(): Promise<T> => {

    return new Promise(async (_res, _rej) => {
        try {
            const { data: { ip } } = await axios.get('https://api.ipify.org?format=json');
            request.post<any, I_Response<T>>("blog/add_visit", {
                ip,
                time: dayjs().format("YYYY-MM-DD HH:mm"),
            }).then((res) => {
                if (res.status !== 200) {
                    _rej(res.reason);
                }
                _res(res.data);
            }).catch((err: Error) => {
                _rej(err);
            });
        } catch (err) {

            _rej(err);
        }

    });
};