<script lang="ts">
import { getFriendData } from "@/api";
import { I_Friend } from "@/types";
interface I_State {
    FriendList: (I_Friend & { color?: string; })[];
}
export default defineComponent({
    setup() {
        const openUrl = (url: string) => {
            if (/[1-9]+.top/.test(url)) return;
            if (/^(https)|(http)/.test(url)) {
                window.open(url);
            } else {
                window.open('http://' + url);
            }
        };
        const state = reactive<I_State>({
            FriendList: []
        });
        const getrandomColor = () => {
            return `rgba(${(Math.random() * 125) + 125},${(Math.random() * 125) + 125
                },${(Math.random() * 125) + 125},${(Math.random() * 0.4) + 0.6
                })`;
        };
        onMounted(() => {
            getFriendData<I_Friend[]>().then(data => {
                state.FriendList = data.map((item) => {
                    return { color: getrandomColor(), ...item };
                });;
            });
        });
        return {
            openUrl,
            ...toRefs(state)
        };
    },
});
</script>
<template>
    <div class="friend_box">
        <div class="friend">
            <span v-for="item in FriendList" :style="{ backgroundColor: `${item.color}` }" :key="item.url"
                @click="openUrl(item.url)" class="single_link">{{ item.name }}</span>
        </div>

    </div>
</template>
<style lang = "less" scoped>
.friend_box {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;

    .friend {
        width: 80%;
        min-height: calc(100vh - 160px);
        max-height: calc(100vh - 160px);
        overflow: auto;
        background-color: var(--main_opacity_color);
        backdrop-filter: blur(4px);
        box-shadow: 1px 1px 7px var(--shadow_color);
        border-radius: 10px;

        .single_link {
            display: inline-block;
            padding: 5px;
            border-radius: 10px;
            position: relative;
            backdrop-filter: blur(4px);
            z-index: 1000;

            &:hover {
                color: var(--hover_color);
            }

            color:var(--font_main_color);
            text-align: center;
            font-size: 16px;
            cursor: pointer;
            margin: 10px;
        }
    }
}

@media (max-width: 768px) {
    .friend_box {
        .friend {
            width: 90%;

            .single_link {

                // width:100px;
                &::after {
                    font-size: 14px;
                }
            }
        }
    }
}
</style>