<script lang="ts">
import { I_SignArticle } from "@/types";
import { Comment, PropType } from "vue-demi";
import { marked } from "marked";

import {
  useAddCodeDrag,
  useAddCodeShrink,
  useAddcommentColor,
  useAddCopyBtn,
  useAddDirectory,
  useAddLineNum,
  useThrottle,
  useCheckClient,
  useMatchMedia,
} from "@/hooks";
interface I_State {
  SingleArticleData: I_SignArticle;
  markDownContent: string;
  isOpenDirectory: boolean;
  IsHaveCode: boolean;
  isOpenUpdate: boolean;
  code: string;
  visits: number;
  updateMessage: string[][];
  articleId: string;
}
export default defineComponent({
  components: { "Comment": defineAsyncComponent(() => import("@/components/Comment.vue")) },
  props: {
    SingleArticleData: {
      type: Object as PropType<I_SignArticle>,
      required: true,
    },
    articleId: {
      type: String,
      required: true,
    }
  },
  setup(props) {
    const Instance = getCurrentInstance()!;
    const state = reactive<I_State>({
      SingleArticleData: props.SingleArticleData,
      markDownContent: "",
      IsHaveCode: false,
      isOpenDirectory: false,
      isOpenUpdate: false,
      code: "",
      visits: 0,
      updateMessage: [],
      articleId: props.articleId
    });
    const isMatch = ref(false);
    const directoryRef = ref<HTMLDivElement>();
    const markdownRef = ref<HTMLDivElement>();
    const currentTitleRef = ref<HTMLHeadingElement>()!;
    const cacheTitleRef = ref<HTMLHeadingElement>()!;
    let cacheGsap: any = null;
    onMounted(() => {
      useMatchMedia(isMatch, 997, "max", true);
    });
    const showDirectory = () => {
      state.isOpenDirectory = !state.isOpenDirectory;
      Instance.proxy!.$gsap.to(".directory_box", {
        duration: 0.5,
        overflow: state.isOpenDirectory ? "auto" : "hidden",
        width: state.isOpenDirectory ? (isMatch.value ? "200px" : "15%") : 40,
        height: state.isOpenDirectory ? "auto" : 40,
        ease: "power4.out",
      });
    };
    const showUpdate = () => {
      state.isOpenUpdate = !state.isOpenUpdate;
      Instance.proxy!.$gsap.to(".update_log_box", {
        duration: 0.5,
        overflow: state.isOpenUpdate ? "auto" : "hidden",
        width: state.isOpenUpdate ? (isMatch.value ? "200px" : "15%") : 40,
        height: state.isOpenUpdate ? "80px" : 40,
        ease: "power4.out",
      });
    };
    const doSomeThing = () => {
      if (!markdownRef.value || !directoryRef.value)
        return;
      const h = [...markdownRef!.value.childNodes as unknown as HTMLElement[]].filter((item: HTMLElement) => /H[2-4]/.test(item.tagName)) as HTMLHeadingElement[];
      let flag = false;
      for (let item of h.values()) {
        if (!flag) {
          flag = useCheckClient(item, { top: true }, { top: 0.18 }, { top: true });
        }
        if (flag) {
          currentTitleRef.value = item;
          break;
        }
      } //找到了满足条件的dom
      if (flag) {
        if (cacheTitleRef.value !== currentTitleRef.value) {
          //现在和原来不是同一个h
          if (cacheTitleRef.value) {
            const cacheh_ = directoryRef.value.querySelector(`#${cacheTitleRef.value!.id.replace(/[1-9]/g, "")}_`) as HTMLHeadElement; //找到目录上对应的h
            cacheh_.style.color = "var(--font_second_color)";
          }
          cacheTitleRef.value = currentTitleRef.value;
          const h_ = directoryRef.value.querySelector(`#${currentTitleRef.value!.id.replace(/[1-9]/g, "")}_`) as HTMLHeadElement; //找到目录上对应的h
          cacheGsap && cacheGsap.kill();
          cacheGsap = null;
          cacheGsap = Instance.proxy!.$gsap.to(h_, {
            duration: 0.1,
            color: "var(--hover_color)",
            ease: "power4.out",
          });
          h_ &&
            Instance.proxy!.$gsap.to(directoryRef.value, {
              scrollTop: h_.offsetTop,
              duration: 0.1,
            });
        }
        else {
          return;
        }
      }
    };
    useThrottle(() => {
      doSomeThing();
    }, 10, document, "scroll", true);
    onMounted(() => {
      nextTick(() => {
        //添加代码行号
        useAddLineNum("front");
        //添加代码折叠
        useAddCodeShrink(Instance);
        //添加代码拖拽
        useAddCodeDrag();
        //添加复制按钮
        useAddCopyBtn(Instance);
        //添加目录
        useAddDirectory();
        //添加评论区颜色
        useAddcommentColor();
        const tables = document.querySelectorAll(".mark_down_content table");
        tables.length !== 0 &&
          tables.forEach((item) => {
            const par = item.parentNode;
            const sibling = item.nextElementSibling;
            item.parentNode?.removeChild(item);
            const div = document.createElement("div");
            div.style.display = "flex";
            div.style.justifyContent = "center";
            div.appendChild(item);
            par?.insertBefore(div, sibling);
          });
      });
    });
    watch(props.SingleArticleData, (next) => {
      state.SingleArticleData = next;
      state.markDownContent = marked(next.content);
      state.IsHaveCode = next.isHaveCode;
      state.code = next.code;
      state.visits = next.visits;
      state.updateMessage = next.updateMessage.map(item => {
        return item.split(" -- ");
      });
    }, { immediate: true });
    return {
      ...toRefs(state),
      markdownRef,
      directoryRef,
      showDirectory,
      showUpdate
    };
  }
});
</script>
<template>
  <div class="article_sanbox">
    <div class="display_code" v-if="IsHaveCode">
      <iframe class="run" :srcdoc="code"></iframe>
    </div>
    <div class="display_md article_show">
      <div class="markdown-body mark_down_content" v-html="markDownContent" v-highlight ref="markdownRef"></div>
    </div>
    <Comment :articleId="articleId"></Comment>
    <div class="directory_box" ref="directoryRef">
      <div class="clo">
        <i :class="isOpenDirectory ? 'ic i-shouqi' : 'ic i-expend'" @click="showDirectory"></i>
      </div>
      <div :style="{ display: isOpenDirectory ? 'flex' : 'none', overflow: isOpenDirectory ? 'auto' : 'hidden' }"></div>
    </div>

    <div class="update_log_box">
      <div class="clo">
        <i :class="isOpenUpdate ? 'ic i-shouqi' : 'ic i-expend'" @click="showUpdate"></i>
      </div>
      <div
        :style="{ display: isOpenUpdate ? 'block' : 'none', overflow: isOpenUpdate ? 'auto' : 'hidden', textAlign: 'center', width: '100%' }">
        <h4>本篇阅读量：<span>{{ visits }}</span></h4>
        <div v-for="item in updateMessage" :key="item[0] + item[1]" class="update_display">
          <h4>{{ item[0] }}</h4>
          <div>{{ item[1] }}</div>
        </div>
      </div>
    </div>
  </div>

</template>
<style lang = "less" >
.article_sanbox {
  width: 100%;
  margin: 0px 0px 10px 0px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .display_code {
    width: 80%;
    height: 600px;
    margin: 0px 0px 10px 0px;
    .run {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      border: var(--border_color) solid 1px;
    }
  }
  .display_md {
    width: 80%;
  }
  .directory_box {
    //导航栏
    display: flex;
    position: fixed;
    top: 190px;
    right: 10px;
    width: 40px;
    height: 40px;
    max-height: 50vh;
    overflow: hidden;
    background-color: var(--main_opacity_color);
    backdrop-filter: blur(4px);
    border-radius: 5px;
    padding: 0px 10px;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;
    &::-webkit-scrollbar {
      height: 5px;
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: var(--font_main_color);
    }

    &::-webkit-scrollbar-track {
      border-radius: 10px;
      background-color: rgba(117, 117, 117, 0.6);
    }

    .clo {
      width: 100%;
      display: flex;
      justify-content: center;
      font-size: 20px;
      margin: 10px 0px;
      color: var(--font_main_color);

      i:hover {
        cursor: pointer;
        color: var(--hover_color);
      }
    }

    div {
      width: 100%;
      height: auto;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      flex-wrap: wrap;

      div {
        width: 100%;
        height: auto;
        margin: 5px 0px;

        a {
          text-decoration: none;
          color: inherit;

          &:active {
            color: inherit;
          }
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          display: inline;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          &:hover {
            color: var(--hover_color);
          }
        }

        h1 {
          cursor: default;
          width: 100%;
          font-family: sans-serif;
          font-size: 20px;
          text-align: center;
          min-height: 30px;
          color: var(--font_main_color);
          overflow: hidden;
        }

        h2 {
          position: relative;
          font-size: 18px;
          color: var(--font_second_color);
          border-bottom: 1px solid var(--border_color);
        }

        h3 {
          text-indent: 2em;
          font-size: 15px;
          color: var(--font_third_color);
        }

        h4 {
          text-indent: 3em;
          font-size: 14px;
          color: var(--font_third_color);
        }

        h5 {
          text-indent: 4em;
          font-size: 13px;
          color: var(--font_third_color);
        }

        h6 {
          text-indent: 5em;
          font-size: 12px;
          color: var(--font_third_color);
        }
      }
    }
  }

  .update_log_box {
    //导航栏
    display: flex;
    position: fixed;
    bottom: 40px;
    right: 10px;
    width: 40px;
    height: 40px;
    max-height: 50vh;
    overflow: hidden;
    background-color: var(--main_opacity_color);
    border-radius: 5px;
    padding: 0px;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;

    &::-webkit-scrollbar {
      height: 5px;
      width: 5px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: var(--font_main_color);
    }

    &::-webkit-scrollbar-track {
      border-radius: 10px;
      background-color: rgba(117, 117, 117, 0.6);
    }

    h4 {
      color: var(--font_third_color);
    }

    .clo {
      width: 100%;
      display: flex;
      justify-content: center;
      font-size: 20px;
      margin: 10px 0px;
      color: var(--font_main_color);

      &:hover {
        cursor: pointer;
        color: var(--hover_color);
      }

    }

    .update_display {
      width: 100%;
      text-align: center;
      // height: auto;

      h4 {
        margin: 5px 0px;
        font-size: 14px;
        color: var(--font_third_color);
      }

      div {
        // height: auto;
        background-color: var(--main_color);
        font-size: 12px;
      }
    }
  }
}

@media (max-width: 997px) {
  .article_sanbox {
    .display_code {
      height: calc(200 * var(--reSizeW));
    }

    .article_show {
      width: 90%;
    }
  }
}

@media (max-width:600px) {
  .article_sanbox {
    .article_show {
      width: 100%;
    }
  }
}
</style>