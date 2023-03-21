
<script lang="ts">
import { SingleDemo, T_Type } from '@/types';
import { getSingleDemo, getDemosByType } from '@/api';
import { useMatchMedia } from '@/hooks';
interface I_State {
    currentDisplay: SingleDemo;
    categoryList: T_Type[];
    currentCategory: T_Type | "";
    currentId: string | "";
    isCanChangeCategory: boolean;
    previewData: SingleDemo[];
    isShow: boolean;
    seekKeyWord: string;
}
export default defineComponent({
    setup() {
        const state = reactive<I_State>({
            previewData: [],
            categoryList: ['Three.js', 'WebGL', 'Shader', 'Css', 'Other'],
            currentCategory: "Three.js",
            currentId: "",
            isCanChangeCategory: true,
            currentDisplay: {
                _id: "",
                code: "",
                type: "",
                title: "",
                img: "",
            },
            isShow: false,
            seekKeyWord: ""
        });

        const { proxy } = getCurrentInstance()!;
        const getList = () => {
            getDemosByType<SingleDemo[]>(state.currentCategory).then(res => {
                state.previewData = [...res];
                state.currentId = res[0]._id;
                state.currentDisplay = res[0];
            }).catch(err => {
                state.previewData = [];
                state.currentId = "";
                state.currentDisplay = {
                    _id: "",
                    code: "",
                    type: "",
                    title: "",
                    img: "",
                };
            });
        };
        onMounted(() => {
            getList();
            useMatchMedia(null, 768, 'min', true, (ismatch) => {
                state.isShow = ismatch;
            });
        });
        const seekDemo = (e: MouseEvent) => {
            let target = e.target as HTMLElement;
            while (target.className !== "par" && target.parentElement !== document.body) {
                target = target.parentElement as HTMLElement;
            }
            if (target.className !== "par") return;
            state.currentId = (target.attributes as any)['data-id'].value;
        };
        const changeCurrentCategory = (v: T_Type | "") => {
            if (!state.isCanChangeCategory) return proxy?.$mymsg.info("切换太频繁~");
            state.currentCategory = v;
            getList();
            state.isCanChangeCategory = false;
            setTimeout(() => {
                state.isCanChangeCategory = true;
            }, 500);
        };
        const changeShow = () => {
            state.isShow = !state.isShow;
        };
        const filterDemo = () => {
            if (!state.seekKeyWord) return getList();
            state.previewData = state.previewData.filter(item => {
                return item.title.includes(state.seekKeyWord);
            });
        };
        watch(() => state.currentId, (next) => {
            if (next) {
                state.currentDisplay = state.previewData.find(v => v._id === next)!;
            }
        });
        return {
            ...toRefs(state),
            seekDemo,
            changeCurrentCategory,
            changeShow,
            filterDemo
        };
    },
});
</script>
<template>
    <div class="select_box" :class="[isShow ? 'select_active' : 'select_close']">
        <div class="expend ic i-expend" @click="changeShow"></div>
        <div class="select">
            <h4>
                <span v-for="item in categoryList" :key="item" @click="changeCurrentCategory(item)"
                    :style="{ color: currentCategory === item ? 'var(--hover_color)' : '' }">{{ item }}</span>
            </h4>
            <div class="seek_input">
                <i class="ic i-seek" style="font-size:24px;cursor: pointer;" @click="filterDemo"> </i><input type="text"
                    v-model="seekKeyWord" placeholder="案例搜索..." />
            </div>
            <ul @click="seekDemo">
                <li v-for="item in previewData" :key="item._id"
                    :class="[currentId && currentId === item._id ? 'active' : '']">
                    <div class="par" :data-id="item._id">
                        <div>
                            <img :src="item.img" :alt="item.title">
                        </div>
                        <p>{{ item.title }}</p>
                    </div>
                </li>
            </ul>
        </div>
    </div>
    <div class="run_box">
        <iframe frameborder="0" :srcdoc="currentDisplay.code" class="run"></iframe>
    </div>
</template>
<style lang = "less" scoped>
.select_box {
    width: 300px;
    background-color: var(--main_color);
    backdrop-filter: blur(4px);
    box-shadow: 1px 1px 7px var(--shadow_color);
    margin-left: 10px;
    border-radius: 10px;
    height: calc(100vh - 140px);
    display: inline-block;

    .select {
        width: 300px;
        overflow: auto;
        color: var(--font_third_color);
        border-radius: 10px;
        padding: 10px;
        height: calc(100vh - 140px);
        display: inline-block;

        &::-webkit-scrollbar {
            height: 10px;
            width: 8px;
        }

        &::-webkit-scrollbar-thumb {
            border-radius: 5px;
            background-color: var(--hover_color);
        }

        &::-webkit-scrollbar-track {
            border-radius: 5px;
            background-color: rgba(183, 225, 241, 0.6);
        }

        h4 {
            text-align: center;
            margin-bottom: 10px;
            overflow-y: auto;
            width: 100%;
            height: 20px;
            font-size: 14px;

            span {
                display: inline;
                border-bottom: 1px var(--hover_color) solid;
                margin: 0px 5px;
                position: relative;
                user-select: none;

                &::after {
                    content: "";
                    height: 100%;
                    position: absolute;
                    right: -5px;
                    top: 0px;
                    width: 2px;
                    background-color: var(--hover_color);
                }

                &:nth-last-child(1) {
                    &::after {
                        display: none;
                    }
                }

                &:hover {
                    cursor: pointer;
                    color: var(--hover_color);
                }
            }
        }

        ul {
            border-radius: 10px;
            li {
                width: 100%;
                background-color: var(--main_second_color);
                height: 190px;
                margin: 10px 0px !important;
                border-radius: 5px;
                user-select: none;
                color: var(--font_third_color);
                &:nth-child(1) {
                    margin-top: 0px !important;
                }

                &:nth-last-child(1) {
                    margin-bottom: 0px !important;
                }

                &>div {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    width: 100%;

                    div {
                        height: 160px;
                        width: 100%;

                        img {
                            width: 100%;
                            height: 100%;
                        }
                    }

                    p {
                        text-align: center;
                        height: 30px;
                        line-height: 30px;
                        font-size: 14px;
                    }
                }

                &:hover {
                    cursor: pointer;
                }
            }
        }
    }

    .expend {
        display: none;
    }

    .seek_input {
        height: 60px;
        width: 100%;
        margin-top: 10px;
        position: relative;

        i {
            margin: 4px;
            color: var(--font_main_color);
            position: absolute;
        }

        input {
            width: 100%;
            height: 30px;
            margin: 0;
            padding: 0;
            font-size: 14px;
            padding-left: 50px;
            color: var(--font_main_color);
            background-color: var(--main_opacity_color);
            border: 0;
            box-sizing: border-box;
            outline: none;
            /*去掉默认input焦点边框*/
            border-radius: 10px;
            display: inline-block;
        }
    }
}


.active {


    border: #429efb 3px solid;

}

.run_box {
    display: inline-block;
    vertical-align: top;
    margin-left: 10px;
    height: calc(100vh - 140px);
    width: calc(100vw - 330px);
    background-color: #fff;
    border-radius: 10px;

    .run {
        box-sizing: border-box;
        width: 100%;
        margin: 0px;
        padding: 0px;
        border-radius: 10px;
        height: 100%;
        border: var(--border_color) solid 1px;
    }

}

@media (max-width: 768px) {


    .select_box {
        position: absolute;
        left: 0px;
        margin-left: 0px;

        .expend {
            display: block;
            border-radius: 5px;
            position: absolute;
            top: 10px;
            right: -40px;
            width: 30px;
            height: 30px;
            background-color: var(--main_color);
            text-align: center;
            line-height: 30px;
            user-select: none;
            cursor: pointer;

            &::before {
                width: 100%;
                height: 100%;
                font-size: 24px;
            }
        }
    }

    .run_box {
        width: 100%;
        margin: 0px;
    }
}

.select_active {
    transform: translateX(0px);
    transition: all 0.5s;
}

.select_close {
    transform: translateX(-310px);
    transition: all 0.5s;
}
</style>