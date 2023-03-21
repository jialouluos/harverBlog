<script lang="ts">
import { getArticleData } from '@/api';
import { useMatchMedia } from '@/hooks';
import { I_Article, I_SignArticle } from '@/types';
import { useAccessory } from '@/store';
interface I_State {
    updateArticleData: I_SignArticle[];
    headurl: string;
    valid: boolean;
    clickCount: number;
    classifyCount: number;
    labelCount: number;
    articleCount: number;
}

export default defineComponent({
    setup() {
        const router = useRouter();
        const { proxy } = getCurrentInstance()!;
        const state = reactive<I_State>({
            updateArticleData: [],
            headurl: "https://oss.jialouluo.top/Images/logo.jpg",
            valid: true,
            clickCount: 0,
            classifyCount: 0,
            labelCount: 0,
            articleCount: 0
        });
        const accessoryStore = useAccessory();
        const { classification, labels } = storeToRefs(accessoryStore);
        let tween: any = null;
        const isMatch = ref(false);
        const sideRef = ref<HTMLElement>();
        const openUrl = (url: string) => {
            if (!url) return proxy?.$mymsg.info("兵马未到,粮草为行,请耐心等待几天吧~");
            url && window.open(url);
        };
        onMounted(() => {
            useMatchMedia(isMatch, 1000, 'max', true, (match) => {
                if (match) {
                    handlerMouseLeave();
                } else {
                    handlerMouseEnter(true);
                }
            });//媒体查询
            state.labelCount = labels.value.length;
            state.classifyCount = classification.value.length;
        });
        const InfoDisplay = (singleArticle: I_SignArticle) => {
            if (!state.valid) return proxy!.$mymsg.info("点击太快，请慢一点~");
            setTimeout(() => {
                state.valid = true;
            }, 2000);
            state.valid &&
                router.push({
                    name: "v_display",
                    query: { id: singleArticle._id },
                });
            state.valid = false;
        };
        const infoAbout = () => {
            router.push({
                name: "v_about",
            });
        };
        getArticleData<I_Article>(2, 1, 4, false).then((data) => {
            state.articleCount = data.count;
            state.updateArticleData = data.data.map(item => {
                item.updateDate = Math.floor((new Date().valueOf() - new Date(item.updateDate).valueOf()) / (60 * 60 * 24 * 1000)) + "天前";
                if (item.updateDate === "0天前") item.updateDate = "今天";
                return item;
            });
        });

        const handlerMouseEnter = (needRun?: boolean) => {
            tween && tween.kill();
            tween = null;
            if ((!sideRef || !isMatch.value) && !needRun) return;
            sideRef.value && proxy?.$gsap.to(sideRef.value, {
                duration: 0.3,
                x: '0',
                ease: "power2.out"
            });
        };
        const handlerMouseLeave = () => {
            if (!sideRef || !isMatch.value) return;
            tween = proxy?.$gsap.to(sideRef.value!, {
                duration: 0.3,
                delay: 0.5,
                x: '-300',
                ease: "power2.out"
            });
        };
        let timer: any;
        const intoPersonalSpace = () => {
            state.clickCount++;
            if (state.clickCount >= 3) {
                state.clickCount = 0;
                router.replace('person');
            }
            timer && clearTimeout(timer);
            timer = setTimeout(() => {
                state.clickCount = 0;
            }, 1000);

        };
        return {
            openUrl,
            infoAbout,
            sideRef,
            isMatch,
            ...toRefs(state),
            handlerMouseEnter,
            handlerMouseLeave,
            intoPersonalSpace,
            InfoDisplay
        };
    },
});
</script>
<template>
    <div class="side_display" ref="sideRef" @mouseover="() => handlerMouseEnter()" @mouseleave="handlerMouseLeave">
        <i v-if="isMatch" class="ic i-expend"></i>
        <div class="first_box">
            <div class="head_img_box">
                <div class="img_box">
                    <img v-lazyImg="headurl" alt="">
                </div>
                <span class="head_name" @click="intoPersonalSpace">迦楼罗</span>
            </div>
            <div class="info_box">
                <ul class="blog_info">
                    <a>
                        <div>文章</div>
                        <div>{{ articleCount }}</div>
                    </a>
                    <a>
                        <div>分类</div>
                        <div>{{ classifyCount }}</div>
                    </a>
                    <a>
                        <div>标签</div>
                        <div>{{ labelCount }}</div>
                    </a>
                </ul>
                <ul class="person_info">
                    <li class="ic i-github" @click="openUrl('https://github.com/jialouluos')"></li>
                    <li class="ic i-QQ "
                        @click="openUrl('https://qm.qq.com/cgi-bin/qm/qr?k=1k4LcLZ0-nVHfN0xOReA7o0EmN6HVpKn&noverify=0')">
                    </li>
                    <li class="ic i-shader " @click="openUrl('https://www.shadertoy.com/user/jialouluo')"></li>
                    <li class="ic i-about " @click="infoAbout()">
                    </li>
                </ul>
            </div>
        </div>
        <div class="second_box">
            <div class="update_box">
                <h4>最近更新</h4>
                <ul>
                    <li v-for="(item) in updateArticleData" :key="item._id">
                        <p class="content" @click="InfoDisplay(item)"> {{ item.title }}</p>
                        <div class="info">
                            <span>{{ `(${item.updateDate.replace(/[-]/, '')})` }} </span>
                            <span> <i :class="['ic', item.isPublic ? 'i-suoding' : 'i-jiesuo']"
                                    :style="{ color: item.isPublic ? 'var(--font_main_color)' : 'var(--hover_color)' }"></i></span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
<style lang = "less" scoped>
@W: 3.75vw;
@0: 0;
@reSizeW: (1/@W);
@H: 6.67vh;
@reSizeH: (1/@H);


.side_display {
    position: relative;
    overflow: visible;

    min-width: 180px;
    width: 250px;
    height: auto;

    .first_box {
        background-color: var(--main_opacity_color);

        .head_img_box {
            // margin-top: 100px;
            position: relative;
            width: 100%;
            height: 130px;
            display: flex;
            justify-content: center;
            flex-wrap: wrap;


            .img_box {
                position: relative;
                width: 100px;
                height: 100px;
                border-radius: 50%;
                border: 5px solid var(--hover_color);
                overflow: hidden;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;

                    &:hover {
                        animation: identifier 2.0s 1;
                    }
                }
            }

            @keyframes identifier {
                0% {
                    transform: rotate(0deg);
                }

                100% {
                    transform: rotate(360deg);
                }
            }

            .head_name {
                display: block;
                position: relative;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 20px;
                line-height: 20px;
                text-align: center;
                font-size: 20px;
                font-weight: 600;
                color: var(--font_main_color);
                user-select: none;

                &:hover {
                    cursor: pointer;
                    color: var(--hover_color);
                }
            }
        }

        .info_box {
            width: 90%;
            margin: 20px auto;
            height: auto;
            border-radius: 10px;
            padding: 10px 0px;

            .blog_info {
                display: flex;
                justify-content: center;

                a {
                    flex: 1;
                    text-align: center;
                    height: 100%;
                    border-right: 1px solid var(--border_color);
                    color: var(--font_main_color);

                    &:hover {
                        color: var(--hover_color);
                        cursor: pointer;
                    }
                }

                :nth-last-child(1) {
                    border-right: none;
                }

                margin-bottom: 20px !important;
            }

            .person_info {
                display: flex;

                :nth-child(n) {
                    border-right: 1px solid var(--border_color);
                }

                :nth-last-child(1) {
                    border-right: none;
                }

                li {
                    width: 90%;
                    height: auto;
                    box-sizing: border-box;
                    max-width: 90%;
                    line-height: 24px;
                    text-align: center;
                    font-size: 20px;
                    margin-bottom: 5px !important;
                    color: var(--font_second_color);

                    &:hover {
                        color: var(--hover_color);
                        cursor: pointer;
                    }
                }
            }


        }

        padding-top:20px;
        border-radius: 5px;
    }


    .second_box {

        padding: 20px 0px;
        border-radius: 5px;
        background-color: var(--main_opacity_color);

        .update_box {
            width: 100%;

            height: auto;
            border-radius: 10px;
            // padding: 10px 0px;

            h4 {
                font-size: 16px;
                margin-bottom: 10px;
                position: relative;
                text-align: center;
                color: var(--font_main_color);

                &::before {
                    content: "";
                    width: 30%;
                    height: 1px;
                    background-color: var(--border_color);
                    position: absolute;
                    left: 0;
                    top: 50%;
                }

                &::after {
                    content: "";
                    width: 30%;
                    height: 1px;
                    background-color: var(--border_color);
                    position: absolute;
                    right: 0;
                    top: 50%;
                }
            }

            li {
                width: 100%;
                height: auto;

                margin-bottom: 5px !important;
                color: var(--font_second_color);
                box-sizing: border-box;
                line-height: 24px;
                font-size: 12px;
                width: 100%;
                overflow: hidden;

                .info {
                    display: flex;
                    justify-content: space-between;

                    span {
                        display: block;
                        width: 50%;
                        text-align: center;
                        border-bottom: 1px dotted var(--border_color);
                    }
                }

                .content {
                    word-wrap: break-word;
                    word-break: break-all;
                    padding-left: 5px !important;
                    /*1.先强制一行显示*/
                    white-space: nowrap;
                    /*2.溢出的部分隐藏起来*/
                    overflow: hidden;
                    /*3.文字溢出的时候用省略号来显示*/
                    text-overflow: ellipsis;
                    font-size: 14px;

                    &:hover {
                        color: var(--hover_color);
                        cursor: pointer;
                    }
                }
            }
        }
    }



}

@media (max-width: 1000px) {
    .side_display {
        position: fixed;
        z-index: 99999;
        min-width: 0px;
        width: 90%;
        max-width: 300px;
        transform: translateX(-300px);
        display: block;
        top: 60px;
        left: 0px;
        border-radius: 0px 5px 5px 0px;

        &>i {
            position: absolute;
            content: "";
            width: 24px;
            right: -40px;
            top: 10px;
            border-radius: 4px;
            font-size: 24px;
            display: flex;
            justify-content: center;
            align-content: center;


        }

        .head_img_box {
            margin-top: 10* @reSizeH;
            height: 120 * @reSizeW;

            .img_box {
                width: 100 * @reSizeW;
                height: 100 * @reSizeW;
                border-radius: 50%;
                overflow: hidden;
            }
        }
    }
}

@media (max-width: 500px) {
    .side_display {
        background-color: var(--main_color);

        .first_box {
            background-color: var(--main_color);
        }

        .second_box {
            background-color: var(--main_color);
        }
    }
}
</style>