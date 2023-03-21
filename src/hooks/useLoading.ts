import { Ref } from 'vue';

export default (dom: HTMLDivElement, backgroundImage?: string): [() => void, () => void, Ref<boolean>] => {
    let loadHTMl: HTMLDivElement;
    const target = dom || document.body;

    let isLoad = ref(false);
    const handlerHTML = () => {
        loadHTMl = document.createElement("div");
        const createChildrenNode = (): HTMLDivElement => {
            const children = document.createElement("div");
            children.classList.add("load");
            return children;
        };
        loadHTMl.style.position = "absolute";
        loadHTMl.style.top = "0";
        loadHTMl.style.width = "100%";
        loadHTMl.style.height = "100%";
        // loadHTMl.style.background = "rgba(255,255,255,0.6)";
        loadHTMl.style.zIndex = "9999";
        loadHTMl.style.display = "flex";
        loadHTMl.style.justifyContent = "center";
        loadHTMl.style.alignItems = "center";
        loadHTMl.appendChild(createChildrenNode());
    };
    const startLoading = () => {
        handlerHTML();
        isLoad.value = true;
        target.appendChild(loadHTMl);
    };
    const endLoading = () => {
        isLoad.value = false;
        target.removeChild(loadHTMl);
    };
    return [startLoading, endLoading, isLoad];
};
