<script lang="ts">
import { getArticleData } from "@/api";

import { I_Article, I_SignArticle } from "@/types";
interface I_SeekArticle extends I_SignArticle {
    frontStr: string;
    afterStr: string;
}
interface I_SeekArticles {
    data: I_SeekArticle[];
    count: number;
}
interface I_State {
    seekKeyWord: string;
    frontStr: string;
    afterStr: string;
    seekData: I_SeekArticle[];
    valid: boolean;
    needEmpty: boolean;
}
export default defineComponent({
    setup() {
        const router = useRouter();
        const { proxy } = getCurrentInstance()!;

        const state = reactive<I_State>({
            seekKeyWord: "",
            seekData: [],
            frontStr: "",
            afterStr: "",
            valid: true,
            needEmpty: false,
        });
        onMounted(() => {

            getArticleData<I_SeekArticles>(1, 1, 1, false).then((data) => {
                state.seekData = data.data;
            }).catch((err) => {
                console.error(err);
                state.seekData = [];
            });
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
        onActivated(() => {
            state.seekKeyWord = "";
        });
        const searchData = computed({
            get() {
                if (state.seekData.length === 0) return [];
                if (
                    state.seekKeyWord.includes(`script`) ||
                    state.seekKeyWord.includes(`var`) ||
                    state.seekKeyWord.includes(`http`) ||
                    state.seekKeyWord.includes(`\\`)
                ) {
                    alert("存在搜索敏感词");
                    return [];
                }
                if (!state.seekKeyWord) return [];
                return state.seekData
                    .filter((child) => {
                        return (
                            child.title.includes(state.seekKeyWord) ||
                            child.content.includes(state.seekKeyWord) ||
                            child.introduction.includes(state.seekKeyWord)
                        );
                    })
                    .map((child) => {
                        let index = child.content.indexOf(state.seekKeyWord);
                        child.frontStr =
                            index !== -1
                                ? child.content.slice(index - 30 >= 0 ? index - 30 : 0, index)
                                : "";
                        child.afterStr =
                            index !== -1
                                ? child.content.slice(
                                    index + state.seekKeyWord.length,
                                    index + 90 + state.seekKeyWord.length >= child.content.length
                                        ? child.content.length
                                        : index + 90 + state.seekKeyWord.length
                                )
                                : "";
                        return child;
                    })
                    .map((child) => {
                        if (child.frontStr || child.afterStr) {
                            child.afterStr += "...";
                            return child;
                        }
                        let index = child.introduction.indexOf(state.seekKeyWord);
                        child.frontStr =
                            index !== -1
                                ? child.introduction.slice(
                                    index - 30 >= 0 ? index - 30 : 0,
                                    index
                                )
                                : "";
                        child.afterStr =
                            index !== -1
                                ? child.introduction.slice(
                                    index + state.seekKeyWord.length,
                                    index + 90 + state.seekKeyWord.length >=
                                        child.introduction.length
                                        ? child.introduction.length
                                        : index + 90 + state.seekKeyWord.length
                                )
                                : "";
                        if (child.afterStr) child.afterStr += "...";

                        return child;
                    });
            },
            set(value) {
            }
        });
        return {
            ...toRefs(state),
            InfoDisplay,
            searchData
        };
    },
});
</script>
<template>
    <div class="seek">
        <div class="seek_body">
            <div class="seek_display">
                <h4 style="margin: 0">请输入关键词搜索</h4>
                <div class="seek_input">
                    <i class="ic i-seek" style="font-size:24px;"> </i><input type="text" v-model="seekKeyWord"
                        placeholder="支持内容、引文、标题检索..." />
                </div>
                <div class="seek_result">
                    <i class="seek_article" v-for="item in searchData" :key="item._id">
                        <h4 @click="InfoDisplay(item)">{{ item.title }}</h4>
                        <div class="content">
                            {{ item.frontStr }}
                            <em v-if="(item.frontStr || item.afterStr) && seekKeyWord">{{ seekKeyWord
                            }}</em>
                            <span v-if="!item.frontStr && !item.afterStr">{{ item.introduction
                            }}</span>
                            {{ item.afterStr }}
                        </div>
                        <div class="unique">
                            <div>
                                分类：
                                <el-tag type="success" v-for="(item2, index) in item.classification" :key="index">
                                    {{ item2 }}
                                </el-tag>
                            </div>
                            <div>
                                标签：
                                <el-tag type="success" v-for="(item2, index) in item.label" :key="index">
                                    {{ item2 }}
                                </el-tag>
                            </div>

                        </div>
                    </i>
                </div>
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

.seek {
    width: 100%;
    height: 100%;

    .seek_body {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
        border-radius: 10px;

        .seek_display {
            width: 80%;
            height: 100%;
            border-radius: 10px;
            background-color: var(--main_opacity_color);
            backdrop-filter: blur(4px);
            box-shadow: 1px 1px 7px var(--shadow_color);
            overflow: auto;
            min-height: calc(100vh - 160px);

            h4 {
                height: 40px;
                text-align: center;
                font-size: 18px;
                font-weight: 400;
                line-height: 40px;
                color: var(--font_main_color);
            }

            .seek_input {
                height: 100px;
                width: 100%;
                margin-top: 20px;
                position: relative;

                i {
                    margin: 8px;
                    color: var(--font_main_color);
                    position: absolute;
                }

                input {
                    width: 100%;
                    height: 40px;
                    margin: 0;
                    padding: 0;
                    font-size: 18px;
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

            .seek_result {
                height: calc(100% - 160px);
                overflow: auto;

                i {
                    list-style: none;
                    font-style: normal;
                    display: inline-block;
                    width: 100%;
                }

                .seek_article {
                    height: auto;
                    background-color: var(--main_opacity_color);
                    padding-left: 30px;
                    box-sizing: border-box;
                    width: 100%;
                    border-bottom: 1px solid var(--border_color);

                    .content {
                        height: auto;
                        width: 100%;
                        color: var(--font_main_color);

                        em {
                            padding: 1px 5px 1px 4px;
                            border-radius: 5px;
                            background-color: #ebebeb;
                            color: var(--hover_color);
                            font-size: 14px;
                            font-style: normal;
                            white-space: pre-wrap;
                        }

                        span {
                            color: var(--font_main_color);
                            font-style: normal;
                            white-space: pre-wrap;
                        }
                    }

                    h4 {
                        margin: 0;
                        padding: 0;
                        height: 20px;
                        margin-top: 10px;
                        line-height: 20px;
                        color: var(--font_second_color);
                        cursor: pointer;
                    }

                    h4:hover {
                        color: var(--hover_color);
                    }

                    .unique {
                        height: 30px;
                        width: 100%;
                        margin-top: 10px;
                        margin-bottom: 10px;
                        display: flex;
                        justify-content: space-evenly;
                        align-items: center;

                        div {
                            display: inline-block;
                            width: 50%;
                            .el-tag {
                                background-color: #f2f2f2;
                                color: var(--hover_color);
                                margin: 0 5px;
                            }
                        }
                    }
                }
            }
        }
    }

}

@media (max-width: 768px) {
    .seek {

        .seek_body {


            .seek_display {
                width: 95%;

                .seek_result {
                    border-radius: 20px;

                    .seek_article {
                        padding-left: 5px;

                        .content {
                            font-size: 12px;
                        }

                        .unique {
                            div {
                                font-size: 12px;

                                span {
                                    font-size: 12px;
                                    padding: 5px 5px;

                                }
                            }
                        }
                    }


                }
            }
        }

    }
}
</style>