import { defineStore } from 'pinia';
import useInitStore from '@/hooks/useInitStore';
export type T_Classify = ({ classify: string; } & { _id: string; })[];
export type T_Label = ({ label: string; } & { _id: string; })[];
export interface I_PageState {
    page_state: number,
    main_page_state: number,
    article_count: number;
    page_number_state: number;
};
export interface I_AccessoriesStore {
    [key: string]: T_Classify | T_Label | I_PageState | boolean | I_VisitStore;
}
export interface I_VisitStore {
    is_visit: boolean,
    total_degree: number,
    person: number,
    disable: boolean;
}
export interface I_BlogStyle {
    is_day: boolean;
    is_card: boolean;
}
export default defineStore("accessories", {
    state: (): { classification: T_Classify, labels: T_Label, pages: I_PageState, init_state: I_AccessoriesStore | null, only_public: boolean, blog_style: I_BlogStyle, visits: I_VisitStore; } => {
        return {
            classification: [],
            labels: [],
            pages: {
                page_state: 1,
                main_page_state: 1,
                article_count: 0,
                page_number_state: 8,
            },
            only_public: true,
            init_state: null,

            visits: {
                is_visit: false,
                total_degree: -1,
                person: -1,
                disable: false,
            },
            blog_style: {
                is_day: true,
                is_card: true
            }
        };
    },
    getters: {
        maxPage: (state) => Math.ceil(state.pages.article_count / state.pages.page_number_state),
    },
    actions: {
        initState(): boolean {
            if (this.init_state) return false;

            const RawState: any = toRaw(this);
            for (let item of Object.keys(RawState)) {
                if (!/(^\$|^_|init_state)/.test(item) && typeof RawState[item] !== "function") {
                    if (!this.init_state) this.init_state = {} as I_AccessoriesStore;
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
        },
    }
});
