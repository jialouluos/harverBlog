import { ComponentInternalInstance } from "vue";
export default (Instance: ComponentInternalInstance, onCompleteCB?: () => void) => {
    const { proxy } = Instance;
    if (document.documentElement && document.documentElement.scrollTop) {

        proxy?.$gsap.to(document.documentElement, {
            scrollTop: window.innerHeight,
            duration: 0.5,
            onComplete: () => {
                onCompleteCB && onCompleteCB();
            },

        });
    } else if (document.body) {
        proxy?.$gsap.to(document.body, {
            scrollTop:window.innerHeight,
            duration: 0.5,
            onComplete: () => {
                onCompleteCB && onCompleteCB();
            },
        });
    }
};