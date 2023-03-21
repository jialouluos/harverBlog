import useInitStore from '@/hooks/useInitStore';
import { defineStore } from 'pinia';

export interface I_ArticleState {
    [key: string]: string | string[] | boolean | number;
};

export interface I_ArticleStore {
    [key: string]: I_ArticleState | string[] | boolean | number;
};
export default defineStore("article", {
    state: (): { article_state: I_ArticleState, init_state: I_ArticleStore | null; } => {
        return {
            article_state: {
                _id: "", //_ID
                title: "", //文章标题
                content: "", //解析前的markdown
                introduction: "", //文章介绍
                previewImage: "",
                classification: [], //分类已选的值
                labels: [], //标签已选的值
                code: "", //代码
                publicPassword: "", //文章密码
                isHaveCode: false, //展示代码块开关
                isPublic: true, //是否公开
                createDate: "",
                updateDate: "",
                visits: 0, //访问量
                updateMessage: [],//更新消息
            },
            init_state: null,
        };
    },
    getters: {

    },
    actions: {
        initState(): boolean {
            if (this.init_state) return false;
            const RawState: any = toRaw(this);
            for (let item of Object.keys(RawState)) {
                if (!/(^\$|^_|init_state)/.test(item) && typeof RawState[item] !== "function") {
                    if (!this.init_state) this.init_state = {} as I_ArticleStore;
                    this.init_state[item] = useInitStore<any>(toRaw(RawState[item]));
                }
            }
            return true;
        },
        resetState(): boolean {
            if (!this.init_state) return false;
            const RawState: any = toRaw(this.init_state);
            for (let item of Object.keys(RawState)) {
                if (!/(^\$|^_|init_state)/.test(item) && typeof RawState[item] !== "function") {
                    (this as any)[item] = reactive(useInitStore<any>(toRaw(RawState[item])));
                }
            }
            return true;
        }
    },
    // persist: {
    //     enabled: true
    // }
});
