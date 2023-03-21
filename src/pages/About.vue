<script lang="ts">
import { useMatchMedia } from "@/hooks";
import { getPersonData } from "@/api";
type stackInfo = {
    name: string,//技术栈名称
    icon: string,//icon
    color: string;//图标背景颜色
};
type SingleTodo = {
    name: string;
    isComplete: boolean;
    talk?: string;
};
interface I_State {
    headurl: string;
    displayCount: number;
    stackList: [stackInfo, stackInfo | null][];
    todoStudy: SingleTodo[];

}
export default defineComponent({
    setup() {
        const state = reactive<I_State>({
            headurl: "https://oss.jialouluo.top/Images/logo.jpg",
            displayCount: 7,
            todoStudy: [],
            stackList: []
        });
        const isMatch = ref(false);
        const isShow = ref(false);
        const { proxy } = getCurrentInstance()!;
        const overRef = ref<HTMLDivElement>();
        const toDoRef = ref<HTMLDivElement>();


        onMounted(async () => {
            if (!overRef.value) return;
            useMatchMedia(isMatch, 768, 'max', false);//媒体查询
            await getPersonData<{
                skill: [stackInfo, stackInfo | null][];
                skill2: SingleTodo[];
            }>().then(res => {
                state.stackList = [...res.skill];
                state.todoStudy = [...res.skill2];
                state.stackList.push(...state.stackList.slice(0, state.displayCount));
            });
            const len = Math.max(0, overRef.value!.children.length - state.displayCount);
            for (let value of [...overRef.value!.children as unknown as HTMLDivElement[]].values()) {
                value.animate({
                    transform: ["translateX(0px)", `translateX(-${len * (isMatch.value ? 70 : 130)}px)`],
                }, {
                    duration: 2000 * len,
                    iterations: Infinity,
                    easing: "linear",
                });
            }
        });
        const showText = (text?: string) => {
            if (!text) return;
            isShow.value = !isShow.value;
            proxy?.$mymsg.info(text, { needClose: true, stay: true });
        };
        return {
            ...toRefs(state),
            overRef,
            toDoRef,
            isMatch,
            showText
        };
    },
});
</script>
<template>
    <div class="about_box">
        <div class="about">
            <div class="person_box">
                <div class="img_box">
                    <img v-lazyImg="headurl" alt="">
                </div>
                <span class="about_me" :data-small="'要保持别人总比你优秀的想法去学习！'" :data-about="'关于我'"></span>
            </div>
            <div class="person_profile_box">
                <div class="talk">很荣幸且高兴你能在万千博客中找到我~</div>
                <div class="information">
                    <div>
                        <span>西南科技大学</span>
                        <span class="school">软件工程</span>
                    </div>
                    <div>
                        <span>目前职业：</span>
                        <span class="occ">大三学生</span>
                    </div>
                    <div>
                        <span>出生：</span>
                        <span class="birth">2001</span>
                    </div>
                </div>
            </div>
            <div class="technology_stack_box">
                <div class="tech_over" ref="overRef">
                    <div v-for="(item) in stackList" :key="item[0].name">
                        <div :style="{ backgroundColor: item[0].color }">
                            <img v-lazyImg="item[0]?.icon">
                        </div>
                        <div :style="{ backgroundColor: item[1] ? item[1].color : 'var(--main_color)' }">
                            <img v-lazyImg="item[1]?.icon" v-if="item[1]">
                            <div src="" v-if="!item[1]"></div>
                        </div>
                    </div>
                </div>
                <div class="skill_box">
                    <span
                        v-for="item, index in stackList.slice(0, stackList.length - displayCount).flat().filter((item) => item != null) "
                        :key="item && item.name ? item.name : index" class="skill">
                        <i>
                            <img class="img_icon" v-lazyImg="item?.icon" :style="{ backgroundColor: item?.color }">
                        </i>
                        <span>{{ item?.name }}</span>
                    </span>
                </div>


            </div>
            <div class="todo_box" ref="toDoRef">
                <span>技术路线</span>
                <ul>
                    <li v-for="item in todoStudy" :key="item.name" :class="[item.isComplete ? '' : 'will']">
                        <div class="left" v-if="item.talk"></div>
                        <div class="middle">
                            <div> <span>{{ item.name }}</span> <i :class="['ic', item.isComplete ? 'i-dui' : 'i-cuo']"
                                    :style="{ backgroundColor: item.isComplete ? '' : 'var(--main_second_color)' }"></i></div>
                        </div>
                        <div class="right" v-if="item.talk">
                            <span v-if="!isMatch">{{ item.talk }}</span>
                            <i v-if="isMatch" @click="showText(item.talk)">...</i>
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

.about_box {
    width: 100%;

    display: flex;
    height: auto;
    justify-content: center;

    // background-color: #fff;
    .about {
        width: 80%;
        height: auto;

        .person_box {
            width: 200px;
            height: auto;
            margin: 0 auto;
            margin-bottom: 20px;
            border-radius: 50%;

            .img_box {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                overflow: hidden;

                img {
                    border-radius: 50%;
                    width: 100%;
                    height: 100%;
                }
            }

            .about_me {
                display: block;
                width: 100%;
                text-align: center;
                position: relative;

                &::before {
                    content: attr(data-small);
                    display: none;
                    width: auto;
                    color: var(--font_third_color);
                    font-size: 20px;
                    height: 60px;
                    animation: out 1s 1;
                    text-align: center;
                }

                &::after {
                    content: attr(data-about);
                    display: inline-block;
                    width: auto;
                    height: 60px;
                    text-align: center;
                    animation: out 1s 1;
                    font-size: 40px;
                    color: var(--font_third_color);
                }

                &:hover {
                    &::after {
                        display: none;
                    }

                    &::before {
                        display: inline-block;
                    }
                }

                @keyframes in {
                    0% {
                        opacity: 1;
                    }

                    100% {
                        opacity: 0;
                    }
                }

                @keyframes out {
                    0% {
                        opacity: 0;
                    }

                    100% {
                        opacity: 1;
                    }
                }
            }
        }

        .person_profile_box {
            width: 100%;
            height: auto;

            display: flex;
            margin-top: 10px;
            justify-content: space-between;

            .talk {
                display: flex;
                flex-direction: column;
                justify-content: center;
                background-color: var(--main_opacity_color);
                backdrop-filter: blur(4px);
                width: 45%;
                border-radius: 5px;
                color: var(--font_main_color);
                text-align: center;
                font-size: 20px;
            }

            .information {
                display: flex;
                justify-content: space-around;
                align-items: center;

                background-color: var(--main_opacity_color);
                backdrop-filter: blur(4px);
                width: 45%;
                height: auto;
                border-radius: 5px;



                div {
                    padding: 20px;

                    :nth-child(1) {
                        display: block;
                        font-size: 12px;
                        color: #4c4948;
                    }

                    :nth-child(2) {
                        font-size: 34px;
                        color: rgb(54, 53, 53);
                    }

                    .birth {
                        color: #43A6c6;
                    }

                    .occ {
                        color: #b04fe6;
                    }

                    .school {
                        color: #4cb359;
                    }
                }
            }
        }

        .technology_stack_box {
            width: 80%;
            height: 300px;
            overflow-y: hidden;
            overflow-x: hidden;
            background-color: var(--main_opacity_color);
            backdrop-filter: blur(4px);
            border-radius: 20px;
            margin: 20px auto;
            display: flex;
            justify-content: flex-start;
            align-content: flex-start;
            flex-wrap: wrap;
            padding: 10px;

            &:hover {
                .tech_over {
                    animation: out_stack 0.3s 1 forwards;
                }
            }

            .skill_box {
                width: 100%;
                height: calc(100% - 16px);
                overflow-y: auto;
                display: flex;
                justify-content: flex-start;
                align-content: flex-start;
                flex-wrap: wrap;

                &::-webkit-scrollbar {
                    height: 5px;
                    width: 5px;
                }

                &::-webkit-scrollbar-thumb {
                    border-radius: 10px;
                    background-color: var(--main_opacity_color);
                }

                &::-webkit-scrollbar-track {
                    border-radius: 10px;
                    background-color: rgba(117, 117, 117, 0.6);
                }

                .skill {
                    // pointer-events: none;
                    user-select: none;
                    width: auto;
                    height: auto;
                    line-height: 20px;
                    text-align: center;
                    margin: 5px;
                    background-color: #f7f9fe;
                    border-radius: 40px;
                    display: flex;
                    padding-right: 20px;
                    padding-left: 5px;
                    box-shadow: 0 8px 16px -4px #2c2d300c;
                    justify-content: flex-start;
                    align-items: center;
                    border: 3px solid #c0c6d8;

                    i {
                        display: flex;
                        align-items: center;
                        margin-right: 5px;

                        .img_icon {
                            width: 30px;
                            background-color: var(--main_opacity_color);
                            border-radius: 50%;
                            padding: 5px;
                            height: 30px;

                            img {
                                border-radius: 50%;
                                width: 100%;
                                height: 100%;
                            }
                        }
                    }


                }
            }

            .tech_over {
                pointer-events: none;

                &>div {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;


                    :nth-child(2) {
                        transform: translateX(-65px);
                    }

                    &>div {
                        margin: 5px;
                        width: 120px;
                        height: 120px;
                        background-color: var(--main_opacity_color);
                        border-radius: 25%;
                        padding: 10px;
                        position: relative;

                        img {
                            width: 100%;
                            height: 100%;
                        }

                        div {

                            width: 100%;
                            height: 100%;
                            border-radius: 25%;
                            background-color: var(--main_color);
                            margin: 0;
                            padding: 0;
                        }
                    }
                }

                user-select: none;
                width: 100%;
                height: 100%;
                background-color: var(--main_color);

                position: absolute;
                top: 0px;
                left: 0px;
                z-index: 1;
                display: flex;
                font-size: 30px;


            }

            &::before {
                content: "技能点";
                display: block;
                width: 100%;
                text-align: center;
                font-size: 14px;
                color: var(--hover_color);
                position: relative;
                margin-bottom: 10px;
            }
        }



        .todo_box {
            height: auto;
            width: 100%;
            background-color: var(--main_opacity_color);
            border-radius: 20px;
            margin: 40px 0px;

            &>span {
                display: block;
                width: 100%;
                text-align: center;
                font-size: 24px;
                user-select: none;
                color: var(--font_main_color);
                border-radius: 20px 20px 0px 0px;
                background-color: var(--main_opacity_color);
                position: relative;
            }

            ul {
                height: auto;
                width: 100%;
                position: relative;
                padding: 20px 0px 40px 0px !important;

                li {
                    position: relative;
                    width: 100%;
                    height: 40px;
                    margin: 40px 0px !important;
                    display: flex;
                    justify-content: center;

                    .left {
                        flex: 2;
                    }

                    .middle {
                        min-width: 100px;
                        padding: 0px 10px;
                        position: relative;
                        height: 40px;
                        z-index: 4;
                        display: flex;
                        text-align: center;
                        align-items: center;
                        justify-content: center;
                        background-color: var(--main_color);
                        border-radius: 10px;
                        font-size: 24px;
                        margin: 0 40px;

                        div {
                            position: relative;
                            width: 100%;
                            height: 40px;
                            display: flex;
                            text-align: center;
                            align-items: center;
                            justify-content: center;

                            i {
                                position: absolute;
                                right: -20px;
                                width: 20px;
                                height: 20px;
                                font-size: 20px;
                                border-radius: 10px;
                                background-color: var(--hover_color);
                                color: #fcfeff;

                                &::before {
                                    width: 20px;
                                    height: 20px;
                                }
                            }

                            &::after {
                                content: "";
                                position: absolute;
                                width: 10px;
                                height: 10px;
                                border-radius: 5px;
                                bottom: -5px;
                                z-index: 3;
                                background-color: var(--hover_color);
                            }

                            &::before {
                                content: "";
                                position: absolute;
                                width: 10px;
                                height: 10px;
                                border-radius: 5px;
                                top: -5px;
                                z-index: 3;
                                background-color: var(--hover_color);
                            }

                            span {
                                color: var(--font_third_color);
                            }
                        }

                        &::after {
                            content: "";
                            position: absolute;
                            bottom: -40px;
                            width: 2px;
                            height: 40px;
                            z-index: 2;
                            background-color: var(--hover_color);
                        }


                    }

                    .right {
                        flex: 2;
                        height: auto;
                        // min-height: 40px;
                        border-radius: 10px;

                        // background-color: green;
                        span {

                            max-width: 90%;

                            padding: 5px 5px 5px 10px;
                            font-size: 14px;
                            color: var(--font_second_color);
                            border-radius: 10px;

                        }

                        display: flex;
                        position: relative;
                        align-items: center;

                        &:before {
                            content: "";
                            position: absolute;
                            width: 10px;
                            height: 10px;
                            border-radius: 5px;
                            left: -5px;
                            z-index: 3;
                            background-color: var(--hover_color);
                        }

                        &::after {
                            content: "";
                            position: absolute;
                            left: -40px;
                            width: 40px;
                            height: 2px;
                            z-index: 2;
                            background-color: var(--hover_color);
                        }

                    }

                }

                .will {
                    @will : var(--main_second_color);

                    .middle {
                        &::after {
                            background-color: @will !important;
                        }

                        div {

                            &::before {
                                background-color: @will !important;
                            }

                            &::after {
                                background-color: @will !important;
                            }
                        }
                    }

                    .right {
                        &::after {
                            background-color: @will;
                        }

                        &::before {
                            background-color: @will;
                        }
                    }
                }

                :nth-child(1) {
                    .middle {
                        div {
                            &::before {
                                display: none;
                            }
                        }

                    }
                }

                :nth-last-child(1) {
                    margin: 0px !important;

                    .middle {
                        div {
                            &::after {
                                display: none;
                            }
                        }

                        &:after {
                            display: none;
                        }
                    }
                }
            }
        }

        @keyframes out_stack {
            0% {
                opacity: 1;
            }

            100% {
                display: none;
                opacity: 0;
            }


        }

    }

}

@media (max-width: 1200px) {
    .person_profile_box {
        .talk {
            height: 80px !important;
        }

        .talk,
        .information {
            width: 100%;
        }

        .information {
            height: 80px !important;

            div {
                height: 80px !important;

                :nth-child(1) {
                    font-size: 12px !important;
                }

                :nth-child(2) {
                    font-size: 15px !important;
                }
            }
        }


    }
}

@media (max-width: 768px) {
    .about_box {
        .about {
            width: 95%;

            .person_box {
                width: 200*@reSizeW;

                .img_box {
                    width: 100*@reSizeW;
                    margin: 0 auto;
                }

                .about_me {
                    height: 70*@reSizeW;
                    font-size: 18*@reSizeW;

                    &::before,
                    &::after {
                        font-size: 18*@reSizeW;
                    }
                }
            }

            .person_profile_box {
                flex-wrap: wrap;

                .talk {
                    margin: 10 * @reSizeW;
                    height: 80* @reSizeW;
                }

                .talk,
                .information {
                    width: 100%;
                }

                .information {
                    height: 80 * @reSizeW;

                    div {
                        height: 80 * @reSizeW;

                        :nth-child(1) {
                            font-size: 12 * @reSizeW;
                        }

                        :nth-child(2) {
                            font-size: 18 * @reSizeW;
                        }
                    }
                }


            }

            .technology_stack_box {
                width: 80%;
                height: 140px;

                .tech_over {
                    display: none;

                    &>div {
                        div {
                            width: 60px;
                            height: 60px;
                        }
                    }
                }

                .skill_box {
                    .skill {


                        &>span {
                            font-size: 12px;
                        }
                    }
                }

            }

            .todo_box {
                ul {
                    li {
                        .right {
                            max-height: 40px;

                            span {
                                max-height: 40px;
                            }

                            i {
                                width: 30px;
                                height: 30px;
                                cursor: pointer;
                                user-select: none;
                                // pointer-events: none;
                                text-align: center;
                                background-color: rgb(119, 135, 240);
                                border-radius: 50%;
                            }
                        }
                    }
                }
            }
        }
    }

}
</style>