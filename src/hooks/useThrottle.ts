export default (cb: (event?:Event) => void, time: number, dom?: Element | null | Document, bindType?: keyof WindowEventMap, immediate?: boolean): void => {
    const throttle = (cb: (event?:Event) => void, time: number) => {
        let oldTime = 0;
        let timer: NodeJS.Timeout;

        return (event: Event) => {
            let newTime = +Date.now();
            if (newTime - oldTime > time) {
                oldTime = newTime;
                if (timer) {
                    clearTimeout(timer);
                } else {
                    timer = setTimeout(() => {
                        cb(event);
                    }, time);
                }
                cb(event);
            } else {
                if (timer) {
                    clearTimeout(timer);
                } else {
                    timer = setTimeout(() => {
                        cb(event);
                    }, time);
                }
            }
        };
    };
    if (bindType) {
        const handlerEvent = throttle(cb, time);
        onMounted(() => {
            immediate && cb();
            if (dom)
                dom.addEventListener(bindType, handlerEvent);
            else
                window.addEventListener(bindType, handlerEvent);
        });
        onUnmounted(() => {
            if (dom)
                window.removeEventListener(bindType, handlerEvent);
            else
                window.removeEventListener(bindType, handlerEvent);
        });
    }
};