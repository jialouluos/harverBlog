<script lang="ts">
import { getCategoryList } from '@/api';
import { useLoading } from '@/hooks';
import { useAccessory } from '@/store';
import { I_Article, I_SignArticle } from '@/types';
export default defineComponent({
    components: {
        'Article': defineAsyncComponent(() => import("@/components/Article.vue")),
        'Page': defineAsyncComponent(() => import("@/components/Page.vue")),
    },
    setup() {
        const AccessoryStore = useAccessory();
        const { proxy } = getCurrentInstance()!;
        let articleData = ref<I_SignArticle[]>([]);//文章数据
        const CategoryRef = ref<HTMLDivElement>();
        const { pages, only_public } = storeToRefs(AccessoryStore);
        const route = useRoute();
        const isLoading = ref(true);
        const prefixImageURL = ["https://api.r10086.com/img-api.php?type=动漫综合1", "https://api.r10086.com/img-api.php?type=动漫综合2", "https://api.r10086.com/img-api.php?type=动漫综合3", "https://api.r10086.com/img-api.php?type=动漫综合4", "https://api.r10086.com/img-api.php?type=动漫综合5", "https://api.r10086.com/img-api.php?type=动漫综合6", "https://api.r10086.com/img-api.php?type=动漫综合7"];//随机图片URL
        onMounted(() => {
            watch([() => route.query, () => pages.value.page_state, () => only_public.value], (next, last) => {
                const { type, key } = next[0] as { type: "label" | "classify", key: string; };
                let isUpdate = true;
                if ((!last[0] || next[0].key !== last[0].key) && pages.value.page_state !== 1) {
                    pages.value.page_state = 1;
                    isUpdate = false;
                }
                if (route.name === "v_category" && isUpdate) {
                    const [startLoading, endLoading] = useLoading(CategoryRef.value!);//加载动画
                    isLoading.value = true;
                    startLoading();
                    getCategoryList<I_Article>(type, key, 2, pages.value.page_state, pages.value.page_number_state, only_public.value).then(data => {
                        articleData.value = data.data ? data.data.map((item, index) => {
                            return {
                                ...item,
                                previewImage: item.previewImage || prefixImageURL[(Math.floor(Math.random() * prefixImageURL.length))]
                            };
                        }) : [];
                        endLoading();
                        isLoading.value = false;
                        pages.value.article_count = data.count;
                    }).catch(err => {
                        endLoading();
                        isLoading.value = false;
                        articleData.value = [];
                        proxy?.$mymsg.error("文章可能被隐藏了~试试显示隐藏的文章吧！");
                        pages.value.article_count = 0;
                    });
                }

            }, { immediate: true, deep: true });
        });
        return {
            articleData,
            CategoryRef,
            isLoading,
        };
    },
});
</script>
<template>
    <div class="category_display" ref="CategoryRef">
        <Side></Side>
        <Article :articleData="articleData" v-if="!isLoading"></Article>
    </div>
    <Page></Page>
</template>
<style lang = "less" scoped>
.category_display {
    position: relative;
    width: 85%;
    height: auto;
    overflow: visible;
    margin: 0 auto;
    box-sizing: border-box;
    display: flex;
    margin-bottom: 10px;
    justify-content: flex-start;

}

@media (max-width: 1200px) {
    .category_display {
        width: 95%;
        transition: width 0.5s;
    }
}

@media (max-width: 1000px) {
    .category_display {
        width: 100%;
        transition: width 0.5s;

    }
}

@media (max-width: 768px) {
    .category_display {
        margin: 0 auto;
        width: 95%;
    }
}
</style>