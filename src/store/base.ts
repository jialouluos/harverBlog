import { createPinia } from 'pinia';
import piniaPluginPersist from 'pinia-plugin-persist';
import useArticle from './article';
import useAccessory from './accessories';

const initState = () => {
    console.log("正在备份初始数据~");
    useArticle().initState();
    useAccessory().initState();
    console.log("备份完成~");
};
const resetState = () => {
    console.log("正在重设初始数据~");
    useArticle().resetState();
    useAccessory().resetState();
    console.log("重设完成~");
};
const store = createPinia();
store.use(piniaPluginPersist);//持久化存储


export { useArticle, useAccessory, initState, resetState, store };