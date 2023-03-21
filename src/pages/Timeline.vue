<script lang="ts">
import { getArticleData } from "@/api";
import { useLoading } from "@/hooks";
import { I_Article, I_SignArticle } from "@/types";
interface I_Event {
    time: string;
    eventDesrc: string;
    eventType: "更新" | "新增";
}
interface I_Data {
    year: number;
    events: I_Event[];
}
interface I_State {
    timeList: I_SignArticle[];
    currentList: I_Data;
    valid: boolean;
    currentYear: number;
    yearMap: Map<number, number>;
    yearArray: [[number, number], [number, number] | []][];
    isComplete: boolean;
    currentIndex: number;
    maxIndx: number;
    displayCount: number;
    isShowYear: boolean;
}
export default defineComponent({
    setup() {
        const router = useRouter();
        const { proxy } = getCurrentInstance()!;

        const state = reactive<I_State>({
            timeList: [],
            currentList: {
                year: 2022,
                events: []
            },
            valid: true,
            currentYear: 2022,
            yearMap: new Map<number, number>(),
            yearArray: [],
            isComplete: false,
            currentIndex: 1,
            maxIndx: 1,
            displayCount: 20,
            isShowYear: false,
        });
        const yearRef = ref<HTMLDivElement>()!;
        const LoadRef = ref<HTMLDivElement>();
        onMounted(() => {
            const [startLoad, endLoad] = useLoading(LoadRef.value!);
            state.isComplete = false;
            startLoad();
            getArticleData<I_Article>(1, 1, 1, false).then((data) => {
                state.timeList = data.data;
                state.timeList.forEach((item) => {
                    const year = new Date(item.createDate).getFullYear();
                    if (!state.yearMap.has(year)) {
                        state.yearMap.set(year, 1);
                    } else {
                        state.yearMap.set(year, state.yearMap.get(year)! + 1);
                    }
                });
                const willHandlerMap = [...state.yearMap.entries()];
                for (let i = 0, len = willHandlerMap.length; i < len; i += 2) {
                    if (i + 1 >= len) {
                        //说明是最后一个
                        state.yearArray.push([[willHandlerMap[i][0], willHandlerMap[i][1]], []]);
                    } else {
                        state.yearArray.push([[willHandlerMap[i][0], willHandlerMap[i][1]], [willHandlerMap[i + 1][0], willHandlerMap[i + 1][1]]]);
                    }
                }
                endLoad();
                state.isComplete = true;
            }).catch((err) => {
                console.error(err);
                endLoad();
                state.timeList = [];
                state.isComplete = true;
            });
        });
        watch([() => state.currentYear, () => state.timeList, () => state.currentIndex], (newVal) => {
            state.currentList.year = newVal[0];
            state.maxIndx = Math.ceil(newVal[1].length / state.displayCount);
            state.currentIndex = Math.min(newVal[2], state.maxIndx);
            state.currentIndex = Math.max(state.currentIndex, 1);
            state.currentList.events = state.timeList.filter(item => {
                return new Date(item.createDate).getFullYear() === state.currentYear;
            }).map(item => {
                if (new Date(item.updateDate) > new Date(item.createDate)) {
                    return {
                        time: item.updateDate,
                        eventDesrc: item.title,
                        eventType: '更新' as "更新" | "新增",
                    };
                } else {
                    return {
                        time: item.createDate,
                        eventDesrc: item.title,
                        eventType: '新增' as "更新" | "新增",
                    };
                }

            }).sort((a, b) => +new Date(b.time) - +new Date(a.time)).slice((state.currentIndex - 1) * state.displayCount, (state.currentIndex) * state.displayCount);
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
        const changeYear = (year: number) => {
            if (year < 2019) return proxy!.$mymsg.info("没有这么早的文章哦~");
            state.currentYear = year;
        };
        const changePage = (willChangeValue: 1 | -1) => {
            if (state.currentIndex + willChangeValue > state.maxIndx) return;
            state.currentIndex += willChangeValue;
        };

        const showYearList = () => {

            if (!yearRef.value) return;
            state.isShowYear = !state.isShowYear;
            if (state.isShowYear) {
                yearRef.value && proxy?.$gsap.to(yearRef.value!, {
                    duration: 0.3,
                    x: '0',
                    ease: "power2.out"
                });
            } else {
                yearRef.value && proxy?.$gsap.to(yearRef.value!, {
                    duration: 0.3,

                    x: '310',
                    ease: "power2.out"
                });
            }

        };

        return {
            ...toRefs(state),
            InfoDisplay,
            changeYear,
            changePage,
            showYearList,
            LoadRef,
            yearRef
        };
    },
});
</script>
<template>
    <div class="timeline_box">
        <div class="timeline" ref="LoadRef">
            <div class="time_display_box">
                <ul>
                    <li class="total">
                        <span>{{ '目前总共' + timeList.length + '篇文章,继续努力!' }}</span>
                    </li>
                    <li class="year_group">
                        <ul>
                            <li class="year">{{ currentList.year }}</li>
                            <li v-for="item2 in currentList.events"
                                :key="currentList.year + item2.time + item2.eventDesrc" class="event">
                                <span style="flex:1;">{{ item2.time }}</span><span
                                    style="font-weight: 800; color:#52a7d9;margin:0px 10px;flex:1;">{{ item2.eventType + '了一篇文章:' }}</span>
                                <span style="color:#8e0b97;flex:1;">{{ item2.eventDesrc }}</span>
                            </li>
                        </ul>
                    </li>
                </ul>

                <div class="time_page_box">
                    <i class="ic i-last" @click="changePage(-1)"></i>
                    <i class="ic i-next" @click="changePage(1)"></i>
                </div>
            </div>
        </div>
        <div class="year_classify_box" v-if="isComplete" ref="yearRef">
            <i class="ic i-expend" @click="showYearList"></i>
            <div v-for=" item, index in yearArray" :key="index" class="year_group">
                <div class="single_year_1 single_year ">
                    <span @click="changeYear(item[0][0])">{{ item[0][0] + `(${(item[0][1])})` }}</span>
                </div>
                <div class="single_year_2 single_year " v-if="item[1].length !== 0">
                    <span
                        @click="changeYear(item[1].length !== 0 ? item[1][0] : -1)">{{ item[1][0] + `(${(item[1][1])})` }}</span>
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

.timeline_box {
    width: 100%;
    height: 100%;

    .timeline {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
        border-radius: 5px;

        .time_display_box {
            width: 80%;
            height: 100%;
            background-color: var(--main_opacity_color);
            border-radius: 5px;
            box-shadow: 0 0 10px 0 var(--shadow_color);
            min-height: calc(100vh - 160px);
            padding-bottom: 20px;
            padding-top: 30px;
            position: relative;

            &>ul {
                position: relative;
                margin-left: 60px !important;
                display: flex;
                align-items: center;
                flex-wrap: wrap;

                &::before {
                    content: '';
                    position: absolute;
                    top: 6px;
                    left: -2px;
                    width: 3px;
                    height: calc(100% - 16px);
                    background-color: var(--shadow_second_color);
                }

                .total {
                    font-size: 16px;
                    color: var(--font_main_color);
                    position: relative;
                    display: flex;
                    align-items: center;
                    height: 20px;
                    padding-left: 20px !important;
                    width: 100%;

                    &::before {
                        content: "";
                        position: absolute;
                        left: -5px;
                        background-color: var(--main_color);
                        width: 10px;
                        height: 10px;
                        z-index: 3;
                        border-radius: 50%;
                    }

                    &::after {
                        content: "";
                        position: absolute;
                        left: -10px;
                        background-color: var(--hover_color);
                        width: 20px;
                        z-index: 1;
                        height: 20px;
                        border-radius: 50%;
                    }

                }



                .year_group {
                    display: block;
                    width: 100%;
                    min-height: calc(100vh - 260px);


                    li {
                        padding-left: 20px !important;
                    }

                    .year {
                        margin: 40px 0px !important;
                        font-size: 26px;
                        color: var(--font_second_color);
                        position: relative;
                        display: flex;
                        align-items: center;
                        height: 20px;
                        width: 100%;
                        font-weight: 600;

                        &::before {
                            content: "";
                            position: absolute;
                            left: -4px;
                            background-color: var(--main_color);
                            width: 8px;
                            height: 8px;
                            z-index: 3;
                            border-radius: 50%;
                        }

                        &::after {
                            content: "";
                            position: absolute;
                            left: -8px;
                            background-color: var(--font_second_color);
                            width: 16px;
                            z-index: 1;
                            height: 16px;
                            border-radius: 50%;
                        }
                    }

                    .event {
                        margin: 10px 0px !important;
                        font-size: 16px;
                        border-bottom: 1px dashed #808080;
                        color: var(--font_main_color);
                        position: relative;
                        display: flex;
                        align-items: center;
                        min-height: 40px;
                        width: 100%;
                        font-weight: 600;

                        &::before {
                            content: "";
                            position: absolute;
                            left: -3px;
                            background-color: var(--main_color);
                            width: 6px;
                            height: 6px;
                            z-index: 3;
                            border-radius: 50%;
                        }

                        &::after {
                            content: "";
                            position: absolute;
                            left: -6px;
                            background-color: var(--shadow_second_color);
                            width: 12px;
                            z-index: 1;
                            height: 12px;
                            border-radius: 50%;
                        }
                    }

                }

            }

            .time_page_box {
                margin-top: 20px;
                width: 100%;
                height: 30px;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 16px;


                :nth-child(1) {
                    font-size: 34px;
                    width: 40px;
                    color: var(--shadow_second_color);
                    cursor: pointer;

                    &:hover {
                        color: var(--hover_color);
                        transform: translateX(-5px);
                        transition: all 0.3s;
                    }
                }

                :nth-child(2) {
                    width: 40px;
                    cursor: pointer;
                    color: var(--shadow_second_color);
                    font-size: 34px;

                    &:hover {
                        color: var(--hover_color);
                        transform: translateX(5px);
                        transition: all 0.3s;
                    }

                }
            }
        }
    }

    .year_classify_box {
        position: fixed;
        height: auto;
        max-height: 500px;
        width: 300px;
        right: 10px;
        top: 150px;
        border-radius: 10px;
        background-color: var(--main_opacity_color);
        backdrop-filter: blur(4px);
        padding: 10px;
        transform: translateX(310px);

        &>i {
            position: absolute;
            left: -30px;
            top: 15px;
            font-size: 24px;
            width: 40px;
            height: 40px;
            color: var(--font_main_color);

            &:hover {
                cursor: pointer;
                color: var(--hover_color);
            }
        }


        .year_group {
            display: flex;
            justify-content: space-between;
            height: 30px;
            border-radius: 5px;
            line-height: 30px;

            .single_year {
                position: relative;
                color: var(--font_main_color);

                span {
                    position: relative;
                    cursor: pointer;

                    &:hover {
                        color: var(--hover_color);
                    }
                }

                width: 50%;
                font-size: 20px;
                font-weight: 600;
                text-align: center;
                border: 1px solid var(--border_color);
            }
        }

        &::-webkit-scrollbar {
            height: 10px;
            width: 3px;
        }

        &::-webkit-scrollbar-thumb {
            border-radius: 5px;
            background-color: #73c3fc;
        }

        &::-webkit-scrollbar-track {
            border-radius: 5px;
            background-color: rgba(183, 225, 241, 0.6);
        }
    }
}

@media (max-width: 768px) {
    .timeline_box {
        .timeline {
            .time_display_box {
                width: 95%;

                &>ul {
                    margin-left: 10px !important;

                    .year_group {
                        &>ul {
                            .event {
                                span {
                                    font-size: 12px;
                                }



                                :nth-child(3) {
                                    word-wrap: break-word;
                                    word-break: break-all;
                                    overflow: hidden;
                                }
                            }
                        }
                    }
                }
            }
        }

        .year_classify_box {
            .year_group {
                .single_year {
                    span {
                        font-size: 16px;
                    }
                }
            }
        }
    }
}
</style>