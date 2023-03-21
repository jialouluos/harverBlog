import { ComponentInternalInstance } from 'vue';
export default (Instance: ComponentInternalInstance) => {
    //代码收缩
    const shrinkArray = document.querySelectorAll(".code-shrink") as NodeListOf<HTMLDivElement>;
    let tween: gsap.core.Tween | null = null;
    let tweenLock = false;
    const { proxy } = Instance;
    shrinkArray.length !== 0 && shrinkArray.forEach(item => {
        item.addEventListener("click", e => {
            const spiltArray = (e.target as HTMLDivElement)!.classList[1]!.split('-');
            const spiltStr = spiltArray[1];
            if (tweenLock) return;
            if (spiltStr === "down_arrow") {
                //当前为展开，需要收拢
                (e.target as HTMLDivElement)!.className = "ic i-right_arrow code-shrink";
                ((e.target as HTMLDivElement)!.parentNode!.parentNode as HTMLDivElement)!.className = "code code-shrink-close";
                if (tween) {
                    tween.kill();
                    tween = null;

                }
                tweenLock = true;
                tween = proxy!.$gsap.to(((e.target as HTMLDivElement)!.parentNode!.parentNode as HTMLDivElement), {
                    height: 30,
                    duration: 0.5,
                    overflow: 'hidden',
                    ease: "power4.out",
                    onStart: () => {
                        ((e.target as HTMLDivElement)!.parentNode!.parentNode!.childNodes[0] as HTMLDivElement).style.overflow = "hidden";
                    },
                    onUpdate: () => {
                        ((e.target as HTMLDivElement)!.parentNode!.parentNode!.childNodes[0] as HTMLDivElement).style.overflow = "hidden";
                    },
                    onComplete: () => {
                        tween = null;
                        tweenLock = false;
                        ((e.target as HTMLDivElement)!.parentNode!.parentNode!.childNodes[0] as HTMLDivElement).style.overflow = "hidden";
                    }
                });
            } else {
                (e.target as HTMLDivElement)!.className = "ic i-down_arrow code-shrink";
                ((e.target as HTMLDivElement)!.parentNode!.parentNode as HTMLDivElement)!.className = "code";
                if (tween) {
                    tween.kill();
                    tween = null;

                }
                tweenLock = true;
                tween = proxy!.$gsap.to(((e.target as HTMLDivElement)!.parentNode!.parentNode as HTMLDivElement), {
                    height: 'auto',
                    duration: 0.3,
                    onComplete: () => {
                        tween = null;
                        tweenLock = false;
                        ((e.target as HTMLDivElement)!.parentNode!.parentNode!.childNodes[0] as HTMLDivElement).style.overflow = "auto";
                    }
                });
            }
        });
    });
};