import errorImg from '@/assets/images/loaderror.png';
import loadingImg from '@/assets/images/loading.gif';
import { useIntersectionObserver } from '@vueuse/core';
import { App } from 'vue';
export default {
    // 需要拿到 main.js 中由 createApp 方法产出的 app 实例对象
    install(app: App<Element>) {
        // app 实例身上有我们想要的全局注册指令方法  调用即可
        app.directive('lazyImg', {
            mounted(el: HTMLImageElement, binding: any) {
                // el:img dom对象
                // binding.value  图片url地址
                // 使用 vueuse/core 提供的监听 api 对图片 dom 进行监听 正式进入视口才加载
                // img.src = url
                el.src = loadingImg;
                const { stop } = useIntersectionObserver(
                    // 监听目标元素
                    el,
                    ([{ isIntersecting }]) => {
                        if (isIntersecting) {
                            // ◆图片加载失败显示默认图片
                            el.onerror = () => {
                                el.src = errorImg;
                            };
                            // ◆这里显示传过来的图片数据
                            el.src = binding.value;
                            stop();// 中止监听
                        }
                    });
            }
        });
    }
};