<script lang="ts">
import { useAccessory } from '@/store';
import { storeToRefs } from 'pinia';
import { useReturnTop, useTheme, useThrottle } from '@/hooks';
import { getCategoryData } from '@/api';
import { I_Classify, I_Label } from '@/types';
export default defineComponent({

    setup() {
        const Instance = getCurrentInstance()!;
        const { proxy } = Instance;
        const accessoryStore = useAccessory();//Store
        const { pages, classification, labels, only_public, blog_style } = storeToRefs(accessoryStore);
        const classifyRef = ref<HTMLLIElement>();
        const labelRef = ref<HTMLLIElement>();
        const router = useRouter();
        const route = useRoute();

        const state = reactive({
            showTool: false,
            showSet: false,
            isShow: true,
            isMatch: false,
        });
        const setRef = ref<HTMLDivElement>()!;
        const headRef = ref<HTMLDivElement>()!;
        //改变主题配色
        const changeStyle = (isDay: boolean) => {
            accessoryStore.blog_style.is_day = isDay;
            if (blog_style.value.is_day) {
                //日间模式
                useTheme("day");
            } else {
                //夜间模式
                useTheme("night");
            }
            proxy?.$mymsg.success("主页似乎发生了一些变化~");
        };
        //搜索路由
        const intoSeek = () => {
            router.push({ name: 'v_seek' });
        };
        //动态显示隐藏header栏
        useThrottle((event) => {
            if (!event) return;
            if (!headRef.value) return;
            if ((event as any).wheelDelta < 0) {
                headRef.value.style.transform = 'translateY(-60px)';
                headRef.value.style.transition = "all 0.5s";
            } else {
                headRef.value.style.transform = 'translateY(0px)';
                headRef.value.style.transition = "all 0.5s";
            }
        }, 200, document, "wheel", true);
        //分类/标签鼠标移入
        const handlerMouseEnter = (type: "classify" | "label") => {
            const ref = type === "classify" ? classifyRef : labelRef;
            if (!ref) return;
            ref.value?.classList.add('active');
        };
        //分类/标签鼠标移出
        const handlerMouseLeave = (type: "classify" | "label") => {
            const ref = type === "classify" ? classifyRef : labelRef;
            if (!ref) return;
            ref.value?.classList.remove('active');
        };
        //进入分类/标签路由
        const InfoCategory = (key: string, type: 'classify' | 'label') => {
            if (key === route.query.key) return;
            if (type !== "classify" && type !== "label") {
                return proxy?.$mymsg.error("type must be classify or label and don't be empty");
            }
            key && router.push({
                name: "v_category",
                query: {
                    key,
                    type,
                },
            });
        };
        /** 加载分类和标签的种类数据 */
        onMounted(() => {
            !classification.value.length && getCategoryData<I_Classify[]>('classify').then(data => {
                accessoryStore.classification = data;
            });
            !labels.value.length && getCategoryData<I_Label[]>('label').then(data => {
                accessoryStore.labels = data;
            });
            if (blog_style.value.is_day) {
                //日间模式
                useTheme("day");
            } else {
                //夜间模式
                useTheme("night");
            }
        });
        //是否显示加锁文章
        const changeOnlyPublic = () => {
            useReturnTop(Instance, () => {
                accessoryStore.pages.main_page_state = 1;
                accessoryStore.pages.page_state = 1;
            });
            only_public.value
                ? proxy?.$mymsg.success("现在能看见隐藏的文章了")
                : proxy?.$mymsg.info("现在不能看见隐藏的文章了");
            accessoryStore.only_public = !accessoryStore.only_public;
        };
        //willDO
        const willDo = () => {
            proxy?.$mymsg.info("兵马未到,粮草为行,请耐心等待几天吧~");
        };
        //显示工具条
        const showManyFunction = (show?: boolean) => {
            state.showTool = show !== undefined ? show : !state.showTool;
        };
        //显示/隐藏设置
        const showSet = (show?: boolean, delay?: number) => {
            state.showSet = show ? show : !state.showSet;
            if (state.showSet) {
                proxy?.$gsap.to(setRef.value!, {
                    duration: 0.3,
                    x: '0',
                    ease: "power2.out"
                });
            } else {
                proxy?.$gsap.to(setRef.value!, {
                    duration: 0.3,
                    x: '300',
                    delay: delay || 0,
                    ease: "power2.out"
                });
            }

        };
        return {
            pages,
            classification,
            labels,
            classifyRef,
            blog_style,
            labelRef,
            setRef,
            router,
            InfoCategory,
            changeStyle,
            changeOnlyPublic,
            handlerMouseEnter,
            handlerMouseLeave,
            intoSeek,
            showManyFunction,
            willDo,
            accessoryStore,
            only_public,
            showSet,
            state,
            headRef,
        };
    },
});
</script>
<template>
    <div class="main_head" ref="headRef">
        <div class="img_box">harver's Blog</div>
        <div class="head_router">
            <div class="menu_box">
                <ul class="menu">
                    <li @click="() => { pages.page_state = 1; }">
                        <router-link to="home" class="_ripple"><i class="ic i-home"
                                style="margin-right:3px;"></i><span>主页</span>
                        </router-link>
                    </li>
                    <li @mouseleave="handlerMouseLeave('classify')">
                        <a @mouseover="handlerMouseEnter('classify')"><i class="ic i-classify"
                                style="margin-right:3px;"></i><span>分类</span></a>
                        <ul ref="classifyRef">
                            <li v-for="item, index in classification" :key="item._id"
                                @click="InfoCategory(item.classify, 'classify')" :style="{ '--i': index }">
                                {{ item.classify }}
                            </li>
                        </ul>
                    </li>
                    <li @mouseleave="handlerMouseLeave('label')">
                        <a @mouseover="handlerMouseEnter('label')"><i class="ic i-label"
                                style="margin-right:3px;"></i><span>标签</span></a>
                        <ul ref="labelRef">
                            <li v-for="item in labels" :key="item._id" @click="InfoCategory(item.label, 'label')">
                                {{ item.label }}
                            </li>
                        </ul>
                    </li>
                    <li>
                        <router-link to="timeline" class="_ripple "><i class="ic i-time"
                                style="margin-right:3px;"></i><span>归档</span></router-link>
                    </li>
                    <li>
                        <router-link to="project" class="_ripple"><i class="ic i-project"
                                style="margin-right:3px;"></i><span>项目</span>
                        </router-link>
                    </li>
                    <li>
                        <router-link to="friend" class="_ripple"><i class="ic i-friend"
                                style="margin-right:3px;"></i><span>友链</span>
                        </router-link>
                    </li>
                    <li>
                        <router-link to="demo" class="_ripple"><i class="ic i-demo"
                                style="margin-right:3px;"></i><span>案例</span>
                        </router-link>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div class="setting_box" ref="setRef" @mouseleave="state.showSet ? showSet(false, 0.5) : ''">
        <ul>
            <li>
                <span>布局：</span>
                <el-switch active-text="卡片" inactive-text="长条" v-model="blog_style.is_card" />
            </li>

        </ul>
    </div>
    <ul class="tool_box" :class="[state.showTool ? 'menu_active' : '']">
        <div class="expand" :class="['ic', 'i-menu']" @click="showManyFunction()">
        </div>
        <li style="--i:1"><i :class="['ic', 'i-seek', 'seek']" @click="intoSeek"></i></li>
        <li style="--i:2"><i :class="['ic', 'i-set', 'setting']" @click="showSet()"></i></li>
        <li style="--i:3"><i :class="['ic', blog_style.is_day ? 'i-day' : 'i-night', 'theme']"
                :style="{ color: 'var(--hover_color)' }" @click="changeStyle(!blog_style.is_day)"></i></li>
        <li style="--i:4"><i :class="['ic', only_public ? 'i-suoding' : 'i-jiesuo', 'lock']"
                :style="{ color: only_public ? 'var(--font_main_color)' : 'var(--hover_color)' }"
                @click="changeOnlyPublic"></i></li>
    </ul>
</template>

<style lang = "less" scoped>
.main_head {
    position: fixed;

    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
    width: 100%;
    height: 60px;
    top: 0px;
    box-shadow: 0 0 10px var(--shadow_color);
    background: var(--main_opacity_color);
    backdrop-filter: blur(2px);

    .img_box {
        flex: 1;
        padding-left: 20px;
        color: var(--font_main_color);
    }

    .head_router {
        display: inline-block;
        flex: 4;
        height: 100%;

        .menu_box {
            height: 100%;
            width: 100%;

            .menu {
                display: flex;
                height: 100%;
                justify-content: flex-end;

                position: relative;

                &>li {
                    margin: 0px 15px !important;
                }
            }

            ul {
                &>li {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    position: relative;
                    height: auto;
                    align-items: center;
                    list-style-type: none;

                    a {
                        margin: 0px;
                        font-size: 16px;
                        color: var(--font_main_color);
                        text-decoration: none;

                        i {
                            font-size: 16px;
                        }

                        &:hover {
                            color: var(--hover_color);
                            cursor: pointer;
                        }
                    }

                    ul {
                        &::after {
                            content: "";
                            position: absolute;
                            top: -10px;
                            width: 0px;
                            height: 0px;
                            border-bottom: 10px solid var(--main_opacity_color);
                            border-right: 10px solid transparent;
                            border-left: 10px solid transparent;
                            transform: translateX(190px);
                        }

                        //弹出来的选项
                        position: absolute;
                        color: var(--font_main_color);
                        top: 70px;
                        // height: 0px;
                        // overflow: hidden;
                        width: 400px;
                        background-color: var(--main_opacity_color);
                        justify-content: flex-start;
                        align-items: flex-start;
                        backdrop-filter: blur(10px);
                        display: flex;
                        flex-wrap: wrap;
                        border-radius: 10px;
                        padding: 10px !important;
                        display: none;

                        li {
                            width: auto;
                            height: auto;
                            padding: 8px !important;
                            position: relative;
                            color: var(--font_main_color);
                            background-color: var(--main_opacity_color);
                            border-radius: 10px;
                            margin: 2px !important;

                            &:hover {
                                color: var(--hover_color);
                                cursor: pointer;
                            }
                        }
                    }

                    .active {
                        display: flex;
                        height: auto;
                    }
                }
            }
        }
    }


}

.setting_box {
    z-index: 100;
    position: fixed;
    width: 300px;
    height: calc(100vh);
    transform: translateX(300px);
    background-color: var(--main_opacity_color);
    right: 0px;
    top: 0px;
    box-shadow: -1px 0px 10px var(--shadow_color);

    &>div {
        text-align: center;
        margin: 20px 0px;
        cursor: pointer;

        &:hover {
            color: var(--hover_color);
        }
    }

    ul {
        li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0px 20px;
            height: 40px;
            border-bottom: 1px solid var(--shadow_color);

            span {
                user-select: none;
                font-size: 16px;
                padding-left: 10px;
            }
        }
    }
}

.tool_box {
    width: 120px;
    height: 120px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    position: fixed;
    left: 10px;
    bottom: 10px;
    z-index: 9999;

    .expand {
        position: absolute;
        width: 40px;
        height: 40px;
        background-color: var(--main_opacity_color);
        backdrop-filter: blur(2px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        border-radius: 50%;
        box-shadow: 0 0px 4px rgba(0, 0, 0, 0.15);
        font-size: 20px;

        &:hover {
            transition: all 0.5s;
            color: var(--hover_color) !important;
            cursor: pointer;
        }
    }

    li {
        position: absolute;
        left: 0;
        transform: rotate(0deg) translateX(45px);
        transform-origin: 60px;
        transition: 0.6s;
        transition-delay: calc(0.1s * var(--i));


        i {
            background-color: var(--main_opacity_color);
            backdrop-filter: blur(2px);
            width: 30px;
            height: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 50%;
            transform: rotate(calc(360deg / -4 * var(--i))) !important;
            opacity: 0;
            transition: all 0.5s;
            transition: opacity 1s 0.3s;
            color: var(--font_main_color);

            &:hover {
                transition: all 0.5s;
                color: var(--hover_color) !important;
                cursor: pointer;
            }
        }
    }
}

.menu_active li {
    transform: rotate(calc(360deg / 4 * var(--i))) !important;

    i {
        opacity: 1 !important;
    }
}

@media (max-width: 768px) {
    .main_head {
        z-index: 999999;

        .head_router {
            flex: 10;
            padding: 0px;

            .menu_box {

                .menu {
                    justify-content: space-evenly;
                    padding: 0px;

                    li {
                        margin: 0px !important;
                        padding: 0px 5px;

                        a {
                            text-align: center;
                            // width: 70px;
                            font-size: 15px;
                        }

                        ul {
                            width: calc(210 * var(--reSizeW));

                            &::after {
                                transform: translateX(calc(90 * var(--reSizeW)));
                            }

                            li {
                                padding: calc(3 * var(--reSizeW)) !important;
                                margin: calc(1 * var(--reSizeW)) !important;
                                font-size: 12px;
                                // height: 20px;
                            }
                        }
                    }
                }
            }
        }
    }


}

@media (max-width:455px) {
    .main_head {
        .head_router {
            .menu_box {
                .menu {
                    &>li {
                        width: auto;
                        padding: 0px;

                        &>a {
                            &::before {
                                display: none;
                            }

                            i {

                                margin: 0px !important;
                                font-size: 18px;
                            }

                            span {
                                display: block;
                            }
                        }


                        ul {
                            width: calc(260 * var(--reSizeW));

                            &::after {
                                transform: translateX(calc(105 * var(--reSizeW)));
                            }

                            li {
                                padding: calc(5 * var(--reSizeW)) !important;
                                margin: calc(2 * var(--reSizeW)) !important;
                                font-size: 12px;
                                // height: 20px;
                            }
                        }


                    }
                }
            }
        }
    }

    .tool_box {
        left: 0px;
        bottom: 0px;
    }
}
</style>