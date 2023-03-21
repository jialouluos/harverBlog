
export default () => {
    const codeArray = document.querySelectorAll("pre code");
    let dragflag = false;

    const openDragFlag = (e: Event) => {
        if ((e as MouseEvent).buttons === 2) {
            (e.target as HTMLDivElement)!.oncontextmenu = (e2) => {
                e2.preventDefault();
            };
            dragflag = true;
       
        }
    };
    const closeDrag = () => {
        dragflag = false;
    };
    const onMouseMove = (event: Event) => {
        if (!dragflag) return;
        moveAt((event as MouseEvent).movementX, event.target!);
    };
    const moveAt = (clientX: number, target: EventTarget | null) => {
        (target as HTMLDivElement).scrollLeft -= clientX
    };
    codeArray.length !== 0 && codeArray.forEach(item => {
        item.addEventListener("mousedown", openDragFlag);
        item.addEventListener("mousemove", onMouseMove);
        item.addEventListener("mouseup", closeDrag);
        // item.addEventListener("mouseout", closeDrag);
    });
};