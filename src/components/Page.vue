<script lang="ts">
import { useReturnTop } from '@/hooks';
import { useAccessory } from '@/store';
export default defineComponent({
    setup() {
        const route = useRoute();
        const AccessoryStore = useAccessory();
        const Instance = getCurrentInstance()!;
        const { pages, maxPage } = storeToRefs(AccessoryStore);
        const changePage = (value: number) => {
            useReturnTop(Instance, () => {
                route.name === "v_home" && changeHomePage(value);
                route.name === "v_category" && changeCategoryPage(value);
            });
        };
        const currentPage = ref(1);
        watchEffect(() => {
            route.name === "v_home" && (currentPage.value = pages.value.main_page_state);
            route.name === "v_category" && (currentPage.value = pages.value.page_state);
        });
        const changeHomePage = (value: number) => {
            AccessoryStore.pages.main_page_state = value;
        };
        const changeCategoryPage = (value: number) => {
            AccessoryStore.pages.page_state = value;
        };
        return {
            changePage,
            currentPage,
            maxPage
        };
    },
});
</script>
<template>
    <div class="paging_main">
        <ul>
            <li class="_page_show" v-show="currentPage > 1" @click="changePage(1)">
                <a>«</a>
            </li>
            <li class="_page_show" v-show="currentPage > 1" @click="changePage(currentPage - 1)">
                <a>&lt;</a>
            </li>
            <li v-show="
                currentPage + item <= maxPage &&
                currentPage + item >= 1
            " v-for=" (item, index) in [-2, -1, 0, 1, 2]" :key="index + item + currentPage" class="_page_show"
                @click="changePage(currentPage + item)">
                <a :class="[item === 0 ? 'active' : '']">{{ currentPage + item }}</a>
            </li>
            <li class="_page_show" v-show="currentPage < maxPage" @click="changePage(currentPage + 1)">
                <a>&gt;</a>
            </li>
            <li class="_page_show" v-show="currentPage < maxPage" @click="changePage(maxPage)">
                <a>»</a>
            </li>
        </ul>
    </div>
</template>
<style lang = "less" scoped>
.paging_main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    width: 100%;
    margin-bottom: 10px;

    ul,
    li {
        margin: 0px;
        padding: 0px;
        list-style-type: none;
    }

    ul {
        width: auto;
        height: auto;
    }

    li {
        display: inline-block;
        min-width: auto;
        height: auto;
        font-size: 16px;
        text-align: center;
        box-sizing: border-box;

        a {
            display: inline-block;
            text-decoration: none;
            min-width: 30px;
            padding: 5px 10px;
            border-radius: 5px;
            margin-left: 6px;
            box-shadow: 0 1px 2px rgb(0 0 0 / 10%);
            border: 0;
            line-height: 1.8;
            text-decoration: none;
            background-color: var(--main_opacity_color);
            color: var(--font_main_color);
        }

        a:hover {
            cursor: pointer;
            background-color: var(--hover_color);
        }
    }

    .active {
        background-color: var(--hover_color);
    }
}
</style>