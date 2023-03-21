import { ComponentInternalInstance } from "vue";
import useClipboard from 'vue-clipboard3';
export default (Instance: ComponentInternalInstance) => {
    //监听复制按钮点击事件
    const copyArray = document.querySelectorAll(".code-copy");
    const { proxy } = Instance;
    const { toClipboard } = useClipboard();
    copyArray.length !== 0 && copyArray.forEach(item => {
        item.addEventListener("click", e => {
            const text = (e.target as HTMLDivElement)!.parentNode!.parentNode!.childNodes[0].textContent!;
            toClipboard(text + `\n作者: harver\n原文链接: ${window.location.href}\n本文版权归作者所有！未经作者同意必须保留此段声明，且在文章页面明显位置给出！`).then(() => {
             
                proxy!.$mymsg.success('复制成功');
            }, () => {
                proxy!.$mymsg.error('复制失败');
            });;
        });
    });
};
