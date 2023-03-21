import { createApp, ComponentCustomProperties } from "vue";
import App from "./App.vue";
import Store from "./store";
import Router from "./router";
import Msg from "@/tools/Msg";
import imgPlugin from "@/directives/lazyImg";
import "@/index.less";
import "@/assets/font/font.css";
import "element-plus/dist/index.css";
import "mavon-editor/dist/css/index.css"; //工具栏样式
import "mavon-editor/dist/markdown/github-markdown.min.css";
import "element-plus/es/components/icon/style/css";
import hightLight from "@/directives/highLight";
import "highlight.js/styles/googlecode.css";
import gsap from "gsap";
import { useArticle, useAccessory } from "@/store";
import { T_N } from "./tools/Msg/Msg";
type T_Msg = "success" | "warning" | "info" | "error";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $gsap: typeof gsap;
    $mymsg: {
      [U in T_Msg]: T_N;
    };
  }
}

const rawData = toRaw(Store.state.value);
/**
 * 在刷新页面之前将Store存储的信息放入sessionStorage
 */

window.onbeforeunload = () => {
  for (let [item, value] of Object.entries(rawData)) {
    sessionStorage.setItem(`${item}Store`, JSON.stringify(value));
  }
  sessionStorage.setItem(`itemKeys`, JSON.stringify(Object.keys(rawData)));
};
const app = createApp(App);
app.config.globalProperties.$gsap = gsap;
app
  .use(Store)
  .use(Router)
  .use(imgPlugin)
  .use(hightLight)
  .use(Msg, {
    // 传入配置
    duration: 2000,
  })
  .mount("#app");
/**
 * 在刷新页面之后将数据存储的信息放入Store
 */

const keys = JSON.parse(sessionStorage.getItem("itemKeys") || "[]");
for (let item of keys) {
  const rawData = JSON.parse(sessionStorage.getItem(`${item}Store`) || "{}");
  if (item === "accessories") {
    useAccessory().$patch(state => {
      for (let [key, value] of Object.entries(rawData)) {
        (state as any)[key] = value;
      }
    });
  } else if (item === "articles") {
    useArticle().$patch(state => {
      for (let [key, value] of Object.entries(rawData)) {
        (state as any)[key] = value;
      }
    });
  }
  sessionStorage.removeItem(`${item}Store`);
}
sessionStorage.removeItem("itemKeys");
