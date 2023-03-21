<script lang="ts">
import { getArticleData } from '@/api';
import { I_Article, I_SignArticle } from '@/types';
import { useAccessory } from '@/store';
import { useLoading, useMatchMedia } from '@/hooks';
export default defineComponent({
    components: {
        'Side': defineAsyncComponent(() => import("@/components/Side.vue")),
        'Article': defineAsyncComponent(() => import("@/components/Article.vue")),
        'Page': defineAsyncComponent(() => import("@/components/Page.vue")),
        'Notice': defineAsyncComponent(() => import("@/components/Notice.vue")),
    },
    setup() {
        const { proxy } = getCurrentInstance()!;
        let articleData = ref<I_SignArticle[]>([]);//文章数据
        const ArticleRef = ref<HTMLDivElement>();
        const AccessoriesStore = useAccessory();//状态数据
        const isMatch = ref(false);
        const textArray = ["欢迎来到harver的小站", "welcome to harver's Blog"];
        const welcometext = ref("");
        const getText = () => {
            let index = 0;
            let flag = true;
            let arrIndex = 0;
            let roolIndex = 0;
            const timer = setInterval(() => {
                welcometext.value = textArray[arrIndex].slice(0, index);
                if (flag) {
                    index++;
                    if (textArray[arrIndex].length === index) {
                        flag = false;
                        roolIndex++;
                        if (roolIndex === 2) {
                            roolIndex = 0;
                            arrIndex = ++arrIndex % textArray.length;
                        }
                    }
                } else {
                    index--;
                    if (index === 0) {
                        flag = true;
                        roolIndex++;
                        if (roolIndex === 2) {
                            roolIndex = 0;
                            arrIndex = ++arrIndex % textArray.length;
                        }
                    }

                }
            }, 300);
        };
        const { pages, only_public, maxPage } = storeToRefs(AccessoriesStore);//解构
        // const prefixImageURL = "https://tuapi.eees.cc/api.php?category={dongman,fengjing}&type=302";//随机图片URL
        const prefixImageURL = ["https://api.r10086.com/img-api.php?type=动漫综合1", "https://api.r10086.com/img-api.php?type=动漫综合2", "https://api.r10086.com/img-api.php?type=动漫综合3", "https://api.r10086.com/img-api.php?type=动漫综合4", "https://api.r10086.com/img-api.php?type=动漫综合5", "https://api.r10086.com/img-api.php?type=动漫综合6", "https://api.r10086.com/img-api.php?type=动漫综合7"];//随机图片URL
        const route = useRoute();//路由
        const isLoading = ref(true);
        onMounted(() => {
            const [startLoading, endLoading] = useLoading(ArticleRef.value!);//加载动画
            getText();
            watch([() => pages.value.main_page_state, () => only_public.value], (next) => {
                //在主页面
                startLoading();
                isLoading.value = true;
                route.name === "v_home" && getArticleData<I_Article>(2, next[0], pages.value.page_number_state, only_public.value).then(data => {
                    articleData.value = data.data.map((item, index) => {
                        return {
                            ...item,
                            previewImage: item.previewImage || prefixImageURL[(Math.floor(Math.random() * prefixImageURL.length))]
                        };
                    });
                    endLoading();
                    isLoading.value = false;
                    pages.value.article_count = data.count;
                }).catch((err) => {
                    endLoading();
                    isLoading.value = false;
                    articleData.value = [];
                });
            }, { immediate: true });
        });
        return {
            articleData,
            maxPage,
            ArticleRef,
            isLoading,
            welcometext
        };
    },
});
</script>
<template>
    <header class="by_header">
        <div class="contain">
            <h1 class="content">{{ welcometext }}</h1>
            <div class="notice">
                <Notice></Notice>
            </div>
        </div>
        <li class="down"><i class="ic i-xiajiantou"></i></li>


    </header>
    <div class="head_display" ref="ArticleRef">
        <Side></Side>
        <Article :articleData="articleData" v-if="!isLoading"></Article>
    </div>
    <Page></Page>
</template>
<style lang = "less" scoped>
.by_header {
    position: relative;
    top: -80px;
    height: 100vh;
    width: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    &::before {
        position: absolute;
        content: "";

        width: 100%;
        height: 100%;
        top: 0px;
        background-color: rgba(0, 0, 0, 0.2);
    }

    .contain {
        width: 80%;
        height: 80%;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid #fff;
        position: relative;

        .content {
            // text-decoration: underline;
            word-wrap: break-word;
            word-break: break-all;
            z-index: 100;
            font-size: 40px;
            color: #fff;
            user-select: none;
            height: 60px;
            border-bottom: 3px solid #fff;

            &::after {
                content: "|";
                position: absolute;
                animation: show 1s infinite;
            }

            @keyframes show {
                0% {
                    opacity: 0;
                }

                50% {
                    opacity: 1;
                }

                100% {
                    opacity: 0;
                }
            }
        }

        .notice {
            position: absolute;
            bottom: 160px;
            width: 100%;
        }
    }


    .down {
        width: 60px;
        height: 60px;
        position: absolute;
        bottom: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        border: 1px solid #fff;
        animation: down_a 1s infinite;

        i {
            color: #fff;
        }

        @keyframes down_a {
            0% {
                transform: translateY(0px);
            }

            50% {
                transform: translateY(10px);
            }

            100% {
                transform: translateY(0px);
            }
        }
    }


}

.head_display {
    position: relative;
    width: 85%;
    height: auto;
    overflow: visible;
    margin: 0 auto;
    box-sizing: border-box;
    display: flex;
    margin-bottom: 10px;
    justify-content: flex-start;
    min-height: calc(100vh - 140px);
}

@media (max-width: 1200px) {
    .head_display {
        width: 95%;
        transition: width 0.5s;
    }

    .by_header {
        .content {
            font-size: 24px !important;
            height: 30px !important;
        }
    }
}

@media (max-width: 1000px) {
    .head_display {
        width: 100%;
        transition: width 0.5s;
    }

    .by_header {
        .content {
            font-size: 20px !important;
            height: 26px !important;
        }
    }
}

@media (max-width: 500px) {
    .head_display {
        width: 100%;
        transition: width 0.5s;
    }

    .by_header {
        .content {
            font-size: 18px !important;
            height: 24px !important;
        }
    }
}

@media (max-width: 300px) {

    .by_header {
        .content {
            font-size: 14px !important;
            height: 20px !important;
        }
    }
}

@media (max-width: 200px) {

    .by_header {
        .content {
            font-size: 12px !important;
            text-decoration: underline !important;
            border-bottom: none !important;
        }
    }
}
</style>