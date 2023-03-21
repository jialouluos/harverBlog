
<script lang="ts">
import { useMatchMedia } from '@/hooks';
import { PropType } from 'vue-demi';
import { I_SignArticle } from '../types';
import { useAccessory } from '@/store';
export default defineComponent({
    props: {
        articleData: {
            type: Array as PropType<I_SignArticle[]>,
            required: true
        }
    },
    setup(props) {
        const articleData = ref<I_SignArticle[]>([]);
        const { proxy } = getCurrentInstance()!;
        const sliceArticles = ref<I_SignArticle[][]>([]);
        const valid = ref(true);
        const articleRef = ref<HTMLDivElement>();
        const isMatch = ref(false);
        const sliceCount = ref(4);
        const router = useRouter();
        const accessoryStore = useAccessory();
        const { blog_style } = storeToRefs(accessoryStore);
        onMounted(() => {
            useMatchMedia(isMatch, 768, 'max', true, (match) => {
                if (match) {
                    sliceCount.value = 2;
                } else {
                    sliceCount.value = 4;
                }
            });//媒体查询
        });
        watch([() => props.articleData, () => sliceCount.value], (next) => {
            articleData.value = next[0];
            sliceArticles.value = [];
            for (let i = 0; i < Math.ceil(next[0].length / sliceCount.value); i++) {
                sliceArticles.value[i] = next[0].slice(i * sliceCount.value, (i + 1) * sliceCount.value);
            }
        }, { immediate: true });
        const InfoDisplay = (singleArticle: I_SignArticle) => {
            if (!valid.value) return proxy!.$mymsg.info("点击太快，请慢一点~");
            setTimeout(() => {
                valid.value = true;
            }, 2000);
            valid.value &&
                router.push({
                    name: "v_display",
                    query: { id: singleArticle._id },
                });
            valid.value = false;
        };
        const url = "https://oss.jialouluo.top/Images/logo.jpg";
        return {
            articleData,
            InfoDisplay,
            articleRef,
            sliceArticles,
            url,
            blog_style,

        };
    },
});
</script>
<template>
    <div class="article_box " ref="articleRef">
        <div class=" _show " :class="[blog_style.is_card ? '_card' : '_strip']" v-for="(item,index) in sliceArticles"
            :key="index">
            <div class="single_article " v-for="(item2) in item" :key="item2._id">
                <div class="article_img">
                    <img v-lazyImg="item2.previewImage" alt="">
                    <p>{{ item2.introduction }}</p>
                </div>
                <div class="article_body">
                    <div class="article_title">
                        <h4>{{ item2.title }}</h4>
                    </div>
                    <div class="article_tag">
                        <div>
                            <i class="ic i-classify"></i>
                            <span v-for="(item3) in item2.classification" :key="item2._id + item3">{{ item3 }}</span>
                        </div>
                        <div>
                            <i class="ic i-label"></i>
                            <span v-for="(item3) in item2.label" :key="item2._id + item3">{{ item3 }}</span>
                        </div>
                        <div>
                            <i class="ic i-create_time"></i>
                            <span>{{ item2.createDate.replace(/[- ]/g, '/') }}</span>
                        </div>
                        <div>
                            <i class="ic i-update_time"></i>
                            <span>{{ item2.updateDate.replace(/[- ]/g, '/') }}</span>
                        </div>
                    </div>
                    <div class="article_into">
                        <a @click="InfoDisplay(item2)">
                            <i class="_underline">
                                查看详情
                                <i class="ic i-into" style="font-size:16px"></i>
                            </i>
                        </a>
                    </div>
                    <div class="article_state">
                        <div class="visit">
                            <i class="ic i-eye "></i>
                            <span>{{ item2.visits }}</span>
                        </div>
                        <div class="lock">
                            <i :class="['ic', item2.isPublic ? 'i-suoding' : 'i-jiesuo']"
                                :style="{ color: item2.isPublic ? 'var(--font_main_color)' : 'var(--hover_color)' }"></i>
                        </div>
                    </div>
                </div>

            </div>
        </div>

    </div>
</template>
<style lang = "less" scoped>
.article_box {
    position: relative;
    top: 0px;
    width: calc(100% - 20vw); // Sidewidth: 250px;
    height: auto;

    ._card {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        margin: 0 auto;
        transition: all 0.5s;

        .single_article {
            width: 23%;
            min-width: 170px;
            max-width: 260px;
            box-shadow: 1px 1px 7px 1px var(--shadow_second_color);
            display: inline-block;
            height: 400px;
            box-sizing: border-box;
            background-color: var(--main_opacity_color);
            margin: 1%;

            @keyframes shadow_scale {
                0% {
                    box-shadow: 1px 1px 7px 1px var(--shadow_second_color);
                }

                100% {
                    box-shadow: 1px 1px 17px 1px var(--hover_color);
                }
            }

            &:hover {
                animation: shadow_scale 0.5s;
                animation-fill-mode: forwards;
            }

            .article_img {
                width: 100%;
                height: 40%;
                overflow: hidden;
                position: relative;

                &:hover {
                    &>p {
                        transform: translate(0);
                    }

                    &>img {
                        &:hover {
                            transform: scale(1.2);
                        }
                    }


                }

                img {
                    width: 100%;
                    height: 100%;
                    transition: transform 0.5s ease-in-out;

                }



                p {
                    position: absolute;
                    display: block;
                    width: 100%;
                    height: 100%;
                    top: 0px;
                    margin: 0;
                    transform: translate(0, 100%);
                    padding: 20px 20px;
                    overflow: hidden;
                    font-size: 12px;
                    color: rgb(247, 247, 247);
                    background-color: rgba(18, 1, 1, 0.6);
                    transition: transform 0.5s ease-in-out;
                }
            }

            .article_body {
                height: 60%;
                width: 100%;

                .article_title {
                    text-align: center;
                    word-wrap: break-word;
                    word-break: break-all;
                    width: 100%;
                    margin: 10px 0 0 0;
                    padding: 0px 5px;
                    text-align: center;
                    font-size: calc(14px + 0.4vw);
                    color: var(--font_third_color);
                    font-weight: 300;
                    line-height: calc(20px + 0.2vw);
                    height: calc(40px + 0.4vw);
                    font-family: sans-serif;
                    overflow: hidden;
                }

                .article_tag {
                    height: 120px;
                    width: 100%;

                    &>div {
                        height: 30px;
                        padding: 1% 0;
                        color: var(--font_main_color);
                        overflow: hidden;

                        i {
                            margin-left: 15px;
                            margin-right: 10px;
                            padding-left: 5px;
                            font-size: 14px;
                            line-height: 20px;
                            height: 20px;
                            color: var(--hover_color);
                        }

                        span {

                            margin-left: 5px;
                            font-size: 14px;
                            line-height: 20px;
                            height: 20px;
                            vertical-align: text-bottom;
                            // width:80px;
                            overflow: hidden;
                            font-size: 12px;
                            border-bottom: 1px solid var(--hover_color);
                        }
                    }
                }

                .article_into {
                    width: 100%;

                    height: 30px;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    a {
                        position: relative;
                        color: var(--font_second_color);

                        &:hover {
                            cursor: pointer;
                            color: var(--hover_color);
                        }

                        &>i {
                            &::before {
                                background: var(--hover_color);
                            }
                        }
                    }
                }

                .article_state {
                    width: 100%;
                    position: relative;
                    display: flex;

                    &>div {
                        display: inline-block;
                        width: 50%;
                        padding: 0px 1%;
                    }

                    .visit {
                        height: 20px;

                        i {
                            color: var(--hover_color);
                            font-size: 16px;
                            line-height: 20px;
                            margin: 0px 15px;
                        }

                        span {
                            color: var(--font_second_color);
                            font-size: 14px;
                        }
                    }

                    .lock {
                        position: relative;
                        height: 20px;

                        i {
                            line-height: 20px;
                            margin: 0px 15px;
                            float: right;
                        }
                    }
                }
            }

        }
    }

    ._strip {
        display: flex;
        flex-wrap: wrap;
        width: 80%;
        height: auto;
        margin-left: 1%;
        transition: all 0.5s;

        .single_article {
            width: 100%;
            height: 180px;
            margin: 10px 0px;
            box-shadow: 1px 1px 7px 1px var(--shadow_second_color);
            background-color: var(--main_opacity_color);
            border-radius: 5px;

            .article_img {
                width: 40%;
                height: 100%;
                display: inline-block;
                overflow: hidden;
                position: relative;
                border-radius: 5px 0px 0px 5px;

                &:hover {
                    &>p {
                        transform: translate(0, 0);
                    }

                    &>img {
                        &:hover {
                            transform: scale(1.2);
                        }
                    }


                }

                img {
                    width: 100%;
                    height: 100%;
                    transition: transform 0.5s ease-in-out;

                }

                p {
                    position: absolute;
                    display: block;
                    width: 100%;
                    height: 100%;
                    top: 0px;
                    margin: 0;
                    transform: translate(0, 100%);
                    padding: 20px 20px;
                    overflow: hidden;
                    font-size: 12px;
                    color: rgb(247, 247, 247);
                    background-color: rgba(18, 1, 1, 0.6);
                    transition: transform 0.5s ease-in-out;
                }
            }

            .article_body {
                display: inline-block;
                width: 60%;
                height: 100%;
                vertical-align: top;

                .article_title {
                    text-align: center;
                    word-wrap: break-word;
                    word-break: break-all;
                    width: 100%;
                    margin: 10px 0 0 0;
                    padding: 0px 5px;
                    text-align: center;
                    font-size: calc(14px + 0.4vw);
                    color: var(--font_third_color);
                    font-weight: 300;
                    line-height: calc(20px + 0.2vw);
                    height: calc(40px + 0.4vw);
                    font-family: sans-serif;
                    overflow: hidden;
                }

                .article_tag {
                    height: 70px;
                    width: 100%;

                    &>div {
                        height: 24px;
                        width: 50%;
                        display: inline-block;
                        padding: 1% 0;
                        color: var(--font_main_color);
                        overflow: hidden;

                        i {
                            margin-left: 15px;
                            margin-right: 10px;
                            padding-left: 5px;
                            font-size: 14px;
                            line-height: 20px;
                            height: 20px;
                            color: var(--hover_color);
                        }

                        span {

                            margin-left: 5px;
                            font-size: 14px;
                            line-height: 20px;
                            height: 20px;
                            vertical-align: text-bottom;
                            // width:80px;
                            overflow: hidden;
                            font-size: 12px;
                            border-bottom: 1px solid var(--hover_color);
                        }
                    }
                }

                .article_into {
                    width: 100%;

                    height: 30px;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    a {
                        position: relative;
                        color: var(--font_second_color);

                        &:hover {
                            cursor: pointer;
                            color: var(--hover_color);
                        }

                        &>i {
                            &::before {
                                background: var(--hover_color);
                            }
                        }
                    }
                }

                .article_state {
                    width: 100%;
                    position: relative;
                    display: flex;

                    &>div {
                        display: inline-block;
                        width: 50%;
                        padding: 0px 1%;
                    }

                    .visit {
                        height: 20px;

                        i {
                            color: var(--hover_color);
                            font-size: 16px;
                            line-height: 20px;
                            margin: 0px 15px;
                        }

                        span {
                            font-size: 14px;
                            color: var(--font_second_color);
                        }
                    }

                    .lock {
                        position: relative;
                        height: 20px;

                        i {
                            line-height: 20px;
                            margin: 0px 15px;
                            float: right;
                        }
                    }
                }
            }
        }
    }

    :nth-child(1) {
        .single_article {
            margin-top: 0px;
        }
    }

    :nth-child(n+2) {

        .single_article {
            margin-bottom: 0px;
        }
    }

}

@media (max-width: 1200px) {
    .article_box {
        width: calc(100% - 10vw); // Sidewidth: 250px;
        transition: width 0.5s;

        ._strip {
            width: 100%;
            transition: width 0.5s;
        }
    }
}

@media (max-width: 1000px) {
    .article_box {
        width: calc(100%);
        transition: width 0.5s;

        ._strip {
            margin: 0px;
            width: 80%;
            margin: 0 auto;
            transition: width 0.5s;

            .single_article {
                margin-top: 0px;
                margin-bottom: 10px;
            }

        }
    }
}

@media (max-width: 768px) {
    .article_box {


        margin: 0 auto;

        ._card {
            width: 80%;
            transition: width 0.5s;
            margin: 0 auto;

            .single_article {
                width: 60%;
            }
        }

        ._strip {

            .single_article {
                width: 100%;
                transition: width 0.5s;

                .article_body {
                    .article_tag {
                        div {
                            i {
                                padding: 0;
                                margin: 0px 2px;
                            }


                        }
                    }
                }

            }

        }
    }
}

@media (max-width: 550px) {
    .article_box {
        width: 100%;
        transition: width 0.5s;

        ._strip {
            width: 100%;
            transition: width 0.5s;

            .single_article {
                .article_img {
                    width: 50%;
                }

                .article_body {
                    width: 50%;

                    .article_tag {
                        height: 80px;

                        :nth-child(n+3) {
                            width: 100%;
                        }
                    }

                    .article_into {
                        height: 24px;
                    }
                }
            }
        }
    }
}

@media (max-width: 400px) {
    .article_box {
        width: 95%;

        ._card {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;

            .single_article {
                width: 100%;
                margin: 10px 0px;
            }
        }

    }
}
</style>