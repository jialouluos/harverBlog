<script lang="ts">
import BlogWelComePoints from "./three/index.js";
export default defineComponent({
    setup() {
        const canvas = ref<HTMLElement>()!;
        let blogWelComePoints: any;
        onMounted(() => {
            // const bg = document.querySelector(".bg-squares") as any;
            // bg.style.display = "none";
            blogWelComePoints = new BlogWelComePoints(canvas.value!, false);
            blogWelComePoints.init();
            setTimeout(() => {
                const info = document.querySelector(".info_show") as any;
                info.style.display = "block";
            }, 2000);
            setTimeout(() => {
                const view = document.querySelector(".view_show") as any;
                view.style.display = "block";
            }, 1000);
        });
        onUnmounted(() => {
            // const bg = document.querySelector(".bg-squares") as any;
            // bg.style.display = "block";
            blogWelComePoints.dispose();
        });
        return {
            canvas,
        };
    },
});
</script>
<template>
    <div class="welcome_main">
        <h2 class="view view_show">harver</h2>
        <div class="info_box">
            <router-link to="warpper" class="info info_show">into</router-link>
        </div>
        <div style="width: 100%; height: 100%; text-align: center; color: #000fff" ref="canvas"></div>
    </div>
</template>
<style lang = "less" scoped>
@media (max-width: 997px) {
    .view {
        font-family: "Homenaje";
        display: none;
        pointer-events: none;
        position: fixed;
        font-size: 15vw;
        bottom: 22px;
        left: 10px;
        font-weight: 400;
        text-decoration: none;
        text-align: center;
        color: aliceblue;
    }

    .info {
        font-family: "Homenaje";
        display: none;
        position: relative;
        width: 15vw;
        border: 1px solid #fff;
        border-radius: 1vw;
        font-size: 6vw;
        font-weight: 400;
        text-decoration: none;

        &::before {
            content: "";
            position: absolute;
            bottom: 3px;
            width: 50%;
            transform: scaleX(0);
            transform-origin: right;
            height: 1px;
            background: #fff;
            transition: transform 0.5s cubic-bezier(0.93, 0.07, 0.17, 1);
        }

        &:hover::before {
            transform: scaleX(1);
            transform-origin: left;
        }

        color: aliceblue;
    }
}

@media (min-width: 997px) {
    .view {
        font-family: "Homenaje";
        display: none;
        pointer-events: none;
        position: fixed;
        font-size: 5vw;
        bottom: 22px;
        left: 10px;
        font-weight: 400;
        text-decoration: none;
        text-align: center;
        color: aliceblue;
    }

    .info {
        font-family: "Homenaje";
        display: none;
        position: relative;
        width: 5vw;
        border: 1px solid #fff;
        border-radius: 1vw;
        font-size: 3vw;
        font-weight: 400;
        text-decoration: none;

        &::before {
            content: "";
            position: absolute;
            bottom: 3px;
            width: 70%;
            transform: scaleX(0);
            transform-origin: right;
            height: 1px;
            background: #fff;
            transition: transform 0.5s cubic-bezier(0.93, 0.07, 0.17, 1);
        }

        &:hover::before {
            transform: scaleX(1);
            transform-origin: left;
        }

        color: aliceblue;
    }
}

.welcome_main {
    width: 100%;
    height: 100%;
    position: relative;
    background-image: none;
}

.info_box {
    width: 100%;

    text-align: center;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: calc(50% - 50px);
}
</style>