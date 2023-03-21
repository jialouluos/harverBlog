<script lang="ts">
import { getNoticeData } from '@/api';
import { useThrottle } from '@/hooks';
interface I_State {
    isShow: boolean;
    notice: string;
}
export default defineComponent({
    setup() {
        const boxRef = ref<HTMLDivElement>();
        const loopRef = ref<HTMLDivElement>();
        const state = reactive<I_State>({
            isShow: false,
            notice: ""
        });
        getNoticeData<any>().then(res => {
            state.notice = res;
        });
        onMounted(() => {
            watch(() => state.notice, (next) => {
                state.notice = next;
                if (state.notice) {
                    state.isShow = true;
                    if (loopRef.value!.offsetWidth > boxRef.value!.offsetWidth ) {
                        loopRef.value!.classList.add('animate');
                    }
                }
            });
        });

        useThrottle(() => {
            if (loopRef.value!.offsetWidth > boxRef.value!.offsetWidth) {
                loopRef.value!.classList.add('animate');
            }
        }, 500, null, 'resize', true);

        return {
            boxRef,
            loopRef,
            ...toRefs(state)
        };
    },
});
</script>
<template>
    <div class="notice_box" v-show="isShow">
        <div class="notice_flex">
            <div ref="boxRef">
                <p ref="loopRef">{{ notice }}</p>
            </div>
        </div>
    </div>
</template>
<style lang = "less" scoped>
.notice_box {
    width: 100%;
    height: 30px;
    display: flex;
    margin-bottom: 10px;
    justify-content: center;

    .notice_flex {
        width: 100%;
        background-color: var(--main_opacity_color);
        border-radius: 5px;

        &>div {
            overflow: hidden;
            height: 20px;
            text-align: center;
            margin: 5px 0px;

            p {
                font-size: 14px;
                color: var(--font_main_color);
                display: inline-block;
                user-select: none;
                white-space: nowrap;
            }
        }
    }
}

.animate {
    animation: 10s wordsLoop linear infinite normal;
}

@keyframes wordsLoop {
    0% {
        transform: translateX(100%);
        -webkit-transform: translateX(100%);
    }

    100% {
        transform: translateX(-100%);
        -webkit-transform: translateX(-100%);
    }
}
</style>