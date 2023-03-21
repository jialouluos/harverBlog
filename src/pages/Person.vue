

<script lang="ts">
import { getRandomQuestionByAll, getRandomQuestionByType, getQuestionTypes } from '@/api';
interface I_State {
    question: {
        content: string;
        myAnswer: string,
        answer: string,
    },
    types: string[];
    showAnswer: boolean;
    currentType: string;
    isCanChange: boolean;
}
export default defineComponent({
    setup() {
        const state = reactive<I_State>({
            question: {
                content: "",
                myAnswer: "",
                answer: "",
            },
            showAnswer: false,
            types: [],
            currentType: "all",
            isCanChange: true
        });
        onMounted(() => {
            getAllTypes();
        });
        const { proxy } = getCurrentInstance()!;
        const changeQuestion = () => {
            if (!state.isCanChange) return proxy?.$mymsg.info("切换太频繁，请慢一点~");
            state.showAnswer = false;
            state.isCanChange = false;
            setTimeout(() => {
                state.isCanChange = true;
            }, 1000);
            if (state.currentType === 'all' || !state.currentType) {
                state.currentType = 'all';
                getQuestionByAll();
            } else {
                getQuestionByType(state.currentType);
            }
        };
        const getAllTypes = () => {
            getQuestionTypes().then(res => {
                state.types = [...res];
                state.types.push('all');
            });
        };
        const getQuestionByAll = () => {
            getRandomQuestionByAll().then(res => {
                state.question.answer = res.answer;
                state.question.content = res.question + `(${res.type})`;
                state.question.myAnswer = "";
            });
        };
        const getQuestionByType = (type: string) => {
            getRandomQuestionByType(type).then(res => {
                state.question.answer = res.answer;
                state.question.content = res.question + `(${res.type})`;
                state.question.myAnswer = "";
            });
        };
        return {
            ...toRefs(state),
            changeQuestion
        };
    },
});
</script>
<template>
    <div class="person_box">
        <div class="problem_box">
            <h4>随机一问(自用，答案为自身理解，并非标准正解)</h4>
            <div class="problem_text">
                <h2>{{ question.content }}</h2>
                <div>
                    <el-select v-model="currentType" placeholder="选择题目类型">
                        <el-option v-for="item in types" :key="item" :label="item" :value="item" />
                    </el-select>
                    <el-button @click="changeQuestion">换一个问题</el-button>
                </div>

            </div>
            <div class="problem_self">
                <div class="problem_self_text">
                    <el-input type="textarea" v-model="question.myAnswer" placeholder='输入你的理解'
                        style="margin-bottom: 0px;"></el-input>
                </div>
                <div class="problem_self_answer">
                    <el-input type="textarea" v-model="question.answer" placeholder='这里会显示答案'
                        style="margin-bottom: 0px;" v-show="showAnswer" readonly></el-input>
                    <el-button v-show="!showAnswer" @click="showAnswer = !showAnswer">查看答案</el-button>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang = "less" >
.person_box {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    padding: 0px 10px !important;

    .problem_box {
        width: 100%;
        height: auto;
        background-color: var(--main_color);
        padding: 10px 20px;
        padding-bottom: 30px;
        border-radius: 5px;

        h4 {
            text-align: center;
            margin: 10px 0px;
            color: var(--font_main_color)
        }

        .problem_text {
            display: flex;
            justify-content: space-between;
            align-items: center;

            h2 {
                display: inline-block;
                height: auto;
                padding: 5px 0px;
                line-height: 20px;
                font-size: 20px;
                color: var(--font_main_color);
                margin-right: 10px;
                background-color: var(--main_color);
                word-wrap: break-word;
                word-break: break-all;
                white-space: pre-wrap !important;
            }
        }

        .problem_self {
            display: flex;
            justify-content: space-between;

            .problem_self_text {
                margin-top: 10px;
                width: 48%;
                display: inline-block;

                .el-textarea__inner {
                    min-height: 200px !important;
                    font-size: 22px !important;
                }
            }



            .problem_self_answer {
                margin-top: 10px;
                width: 48%;
                display: flex;
                justify-content: center;
                align-items: center;
                right: 0px;


                .el-textarea__inner {
                    min-height: 200px !important;
                    font-size: 22px !important;
                }
            }
        }

    }
}
</style>