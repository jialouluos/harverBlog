<script lang="ts">

export default defineComponent({
    props: {
        visits: {
            type: Object,
            required: true
        }
    },
    setup(props) {
        const author = ref("harver");
        const Myherf = ref("");//跳转链接
        const getUrl = () => {
            Myherf.value = window.location.href;
        };
        const visits = props.visits;
        return {
            author,
            Myherf,
            getUrl,
            visits
        };
    },
});
</script>
<template>
    <footer class="body_tail" id="copyright">
        <div class="tail_display_box">
            <div class="view">
                <div>访客量：{{ visits.person }}</div>
                <div>总访问量：{{ visits.total_degree }}</div>
            </div>
            <div class="self">
                <span>本文版权归作者所有，欢迎转载，但未经作者同意还请保留此段声明及
                    <a :href="Myherf" @click="getUrl">原文(博客)链接</a></span>
            </div>
        </div>
    </footer>
</template>
<style lang = "less" scoped>
@W: 3.75vw;
@0: 0;
@reSizeW: (1/@W);
@H: 6.67vh;
@reSizeH: (1/@H);

.body_tail {
    width: 100%;
    position: relative;
    user-select: none;
    box-shadow: 0 0 10px var(--shadow_color);
    min-height: 50px;

    .tail_display_box {
        width: 100%;
        border-radius: 5px;
        height: 50px;
        text-align: center;
        background: var(--main_opacity_color);
        backdrop-filter: blur(4px);
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;

        .view {
            position: relative;
            font-family: cursive;
            font-style: italic;
            margin-left: 10px;
            width: 400px;
            font-size: 14px;

            :nth-child(1) {
                border-right: 1px solid var(--hover_color);
            }

            div {
                width: 200px;
                border-bottom: var(--hover_color) solid 1px;
                display: inline-block;
                color: var(--font_color);

                &:hover {
                    color: var(--hover_color);
                }
            }

        }


        .self {
            display: block;
            height: 20px;
            width: 100%;

            a {
                color: var(--hover_color);
                text-decoration: none;
            }

            font-size: 10px;
        }




    }
}

@media (max-width: 768px) {
    .body_tail {
        .tail_display_box {
            //多行
            overflow: hidden;
            text-overflow: ellipsis;
            border-radius: 0px;
            align-items: flex-start;

            .view {
                margin-left: 0px;
                width: 200*@reSizeW;
                min-width: 200px;

                div {
                    width: 100*@reSizeW;
                    min-width: 100px;
                }
            }

            .self {
                height: auto;
                width: 100%;
                font-size: 12px;

            }
        }

    }
}
</style>