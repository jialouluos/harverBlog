import hljs from 'highlight.js';
import 'highlight.js/styles/googlecode.css'; // 样式文件
import { App } from 'vue';
export default {
    // 需要拿到 main.js 中由 createApp 方法产出的 app 实例对象
    install(app: App<Element>) {
        // app 实例身上有我们想要的全局注册指令方法  调用即可
        app.directive('highlight', {
            mounted(el: HTMLImageElement) {
                let blocks = el.querySelectorAll('pre code') as NodeListOf<HTMLElement>;
                blocks.length !== 0 && blocks.forEach((block) => {
                    hljs.highlightElement(block);
                });
            }
        });
    }
};