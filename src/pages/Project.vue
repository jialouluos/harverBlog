<script lang="ts">
import { getProjectData } from "@/api";
import { useMatchMedia } from "@/hooks";
import { I_Project } from "@/types";

export default defineComponent({
    setup() {
        const currentdisplay = ref<I_Project>();
        const openDialog = ref(false);
        const isMatch = ref(false);
        const openUrl = (url: string) => {
            !/[1-9]+.top/.test(url) && window.open(url);
        };
        const openPreviewDialog = (data: I_Project) => {
            openDialog.value = true;
            currentdisplay.value = data;
        };
        const closePreviewDialog = () => {
            openDialog.value = false;
        };
        const projectList = ref<I_Project[]>([]);
        onMounted(() => {
            getProjectData<I_Project[]>().then(data => {
                projectList.value = data;
            });
            useMatchMedia(isMatch, 768, 'max', false);//媒体查询
        });
        return {
            openUrl,
            openPreviewDialog,
            closePreviewDialog,
            projectList,
            openDialog,
            currentdisplay,
            isMatch
        };
    },
});
</script>
<template>
    <div class="project_display_box">
        <div class="project_display">
            <div class="project_box" v-for="item in projectList" :key="item.name">
                <div class="project_name_box">
                    <span @click="openUrl(item.url)">{{ item.name }}</span>
                </div>
                <div class="project_preview_box">
                    <span @click="openPreviewDialog(item)">预览</span>
                </div>
            </div>
        </div>
        <el-dialog title="项目预览图" v-model="openDialog" :width="isMatch ? '80%' : '60%'" @close="closePreviewDialog"
            :style="{ backgroundColor: 'var(--main_color)' }">
            <div class="when_time">项目时间：{{ currentdisplay?.time }}</div>
            <div class="when_work">负责模块：{{ currentdisplay?.work }}</div>
            <div class="when_introduction">{{ currentdisplay?.introduction }}</div>
            <div v-for="(item, index) in currentdisplay?.images" :key="item + index" class="img_preview">
                <div><img v-lazyImg="item" alt="" /></div>
            </div>
        </el-dialog>
    </div>
</template>
<style lang = "less" scoped>
@W: 3.75vw;
@0: 0;
@reSizeW: (1/@W);
@H: 6.67vh;
@reSizeH: (1/@H);

.project_display_box {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;

    .project_display {
        width: 80%;
        min-height: calc(100vh - 160px);
        max-height: calc(100vh - 160px);
        overflow: auto;
        background-color: var(--main_opacity_color);
        backdrop-filter: blur(4px);
        box-shadow: 1px 1px 7px var(--shadow_color);
        border-radius: 5px;
        display: flex;
        justify-content: center;
        align-content: flex-start;

        flex-wrap: wrap;

        .project_box {
            display: flex;
            margin: 10px 0px;
            width: 90%;
            height: 50px;
            border-radius: 5px;
            background-color: var(--hover_color);
            align-items: center;

            .project_name_box {
                width: 70%;
                background-color: var(--main_second_color);

                height: 100%;
                border-radius: 5px 0px 0px 5px;
                font-size: 16px;
                display: flex;
                justify-content: center;
                text-align: center;
                align-items: center;
                color: var(--font_second_color);
            }

            .project_preview_box {
                width: 30%;
                display: flex;
                border-radius: 0px 5px 5px 0px;
                justify-content: center;
                align-items: center;
                text-align: center;
                // background-color: rgba(229, 229, 248, 0.7);
                height: 100%;
                font-size: 16px;
                color: var(--font_second_color);
            }
        }
    }

    span {
        cursor: pointer;
        display: inline-block;
        margin: 0;
        padding: 0;
        max-width: 500px;
        /*1.先强制一行显示*/
        white-space: nowrap;
        /*2.溢出的部分隐藏起来*/
        overflow: hidden;
        /*3.文字溢出的时候用省略号来显示*/
        text-overflow: ellipsis;
        text-align: center;
        height: 24px;
        line-height: 24px;


        &:hover {
            color: var(--hover_color);
        }
    }

    .img_preview {
        width: 100%;
        height: 100%;

        &>div {
            width: 100%;
            height: 100%;

            img {
                width: 100%;
                height: 100%;
            }
        }
    }

    .when_introduction {
        width: 100%;
        color: var(--font_main_color);
        font-size: 18px;
        margin-bottom: 10px;
    }

    .when_time {
        width: 100%;
        height: 20px;
        text-align: center;
        color: var(--font_main_color);
    }

    .when_work {
        width: 100%;
        margin: 10px 0px;
        font-size: 16px;
        // text-align: center;
        color: var(--hover_color);
    }
}

@media (max-width: 768px) {
    .project_display_box {
        height: 100%;

        .el-dialog {
            width: 90%;

            .when_time {
                height: auto;
            }

            .when_work,
            .when_introduction {
                font-size: 14px;
            }
        }

    }
}
</style>