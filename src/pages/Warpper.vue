<script lang="ts">
import Tail from '@/components/Tail.vue';
import { getVisitData, addVisiter } from '@/api';
import { useAccessory } from '@/store';
import { storeToRefs } from 'pinia';
import { useLoading } from '@/hooks';
import { I_Visit, I_VisitPerson } from '@/types';
export default defineComponent({
    components: {
        "Header": defineAsyncComponent(() => import("@/components/Header.vue")),
    },
    setup() {
        const isOpen = ref(false);
        const HomeRef = ref<HTMLDivElement>();
        const { proxy } = getCurrentInstance()!;
        const router = useRouter();
        const accessoryStore = useAccessory();
        const { visits } = storeToRefs(accessoryStore);
        onMounted(() => {
            const [startLoading, stopLoading] = useLoading(HomeRef.value!);
            startLoading();
            if (accessoryStore.visits.disable) {
                stopLoading();
                proxy?.$mymsg.error("IP被拉黑!");
                return router.replace({ name: '404' });
            }
            !accessoryStore.visits.disable && addVisiter<I_VisitPerson>().then(data => {
                stopLoading();
                accessoryStore.visits.disable = data.disable;
                if (accessoryStore.visits.disable) {
                    return router.replace({ name: '404' });
                }
                isOpen.value = true;
                !accessoryStore.visits.disable && !accessoryStore.visits.is_visit && getVisitData<I_Visit>().then(data => {
                    accessoryStore.visits.total_degree = data.totalDegree;
                    accessoryStore.visits.person = data.person;
                    accessoryStore.visits.is_visit = true;
                });
            }).catch(() => {
                stopLoading();
                proxy?.$mymsg.error("IP获取失败，请刷新重试！");
                return router.replace({ name: '404' });
            });
        });
        return {
            isOpen,
            visits,
            HomeRef,
        };
    },
});
</script>
<template>
    <div class="warpper" ref="HomeRef" :style="{ minHeight: isOpen ? 'calc(100vh - 50px)' : '100vh' }">
        <div v-if="isOpen" style="width:100%;height:100%;position:relative;">
            <Header></Header>
            <div class="sandbox">
                <router-view v-slot="{ Component }">
                    <keep-alive>
                        <component :is="Component" :key="$route.name" v-if="$route.meta.keepAlive" />
                    </keep-alive>
                    <component :is="Component" :key="$route.name" v-if="!$route.meta.keepAlive" />
                </router-view>
            </div>
            <Tail :visits="visits"></Tail>
        </div>
    </div>
    <ul class="bg-squares">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
    </ul>
</template>
<style lang ="less" scoped>
@W: 3.75vw;
@0: 0;
@reSizeW: (1/@W);
@H: 6.67vh;
@reSizeH: (1/@H);

.warpper {
    width: 100%;
    position: relative;
    min-height: calc(100vh - 50px);
    background-image: var(--bg_image);
    background-attachment: fixed;
    background-size: cover;

    .sandbox {
        position: relative;
        padding-top: 80px;
        -webkit-text-size-adjust: 100%;
        min-height: calc(100vh - 50px);
    }

}

/* 背景方块 */
.bg-squares {
    pointer-events: none;
    list-style: none;
    position: fixed;
    overflow: hidden;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 0;

    .size(@left: 0, @width: 40px, @height: 40px, @backgroundColor: rgba(235, 237, 237, 0.1), @delay: 0s, @duration: 20s) {
        left: @left;
        width: @width;
        height: @height;
        background-color: @backgroundColor;
        /* 动画延迟时间 */
        animation-delay: @delay;
        animation-duration: @duration;
    }

    li {
        .size();
        position: absolute;
        bottom: -160px;
        /* 执行动画：动画名 时长 线性 无限次播放 */
        animation: square 20s linear infinite;

        &:nth-child(1) {
            .size(10%, 40px, 40px, rgba(189, 221, 246, 0.1));
        }

        &:nth-child(2) {
            .size(20%, 80px, 80px, rgba(143, 182, 212, 0.1), 2s, 17s);
        }

        &:nth-child(3) {
            .size(25%, 40px, 40px, rgba(143, 206, 212, 0.1), 4s);
        }

        &:nth-child(4) {
            .size(40%, 30px, 20px, rgba(255, 255, 255, 0.25), 22s);
        }

        &:nth-child(5) {
            .size(70%, 90px, 90px, rgba(205, 143, 212, 0.1));
        }

        &:nth-child(6) {
            .size(80%, 120px, 120px, rgba(255, 255, 255, 0.2), 3s);

        }

        &:nth-child(7) {
            .size(32%, 30px, 40px, rgba(212, 212, 143, 0.1), 7s);

        }

        &:nth-child(8) {
            .size(55%, 20px, 20px, rgba(168, 212, 143, 0.1), 15, 40s);

        }

        &:nth-child(9) {
            .size(25%, 10px, 10px, rgba(255, 255, 255, 0.1), 2, 40s);

        }

        &:nth-child(10) {
            .size(90%, 160px, 160px, rgba(168, 184, 244, 0.1), 11s);
        }

        &:nth-child(11) {
            .size(10%, 160px, 160px, rgba(168, 244, 172, 0.1), 5s);
        }
    }

    /* 定义动画 */
    @keyframes square {
        0% {

            transform: translateY(0);
        }

        100% {

            transform: translateY(-120vh) rotate(600deg);
        }
    }
}
</style>