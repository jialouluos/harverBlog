export default () => {
    //文章目录
    const directory = document.querySelector(".directory_box")!;

    if (!directory) return;
    const mdBox = document.querySelector(".mark_down_content");
    if (!mdBox) return;
    const h = Array.from(mdBox.children).filter((item) => {

        return /H[1-6]/.test(item.nodeName);
    }) as HTMLHeadElement[];
    for (let i = directory.childNodes[1].childNodes.length - 1; i > 0; i--) {
        directory.childNodes[1].childNodes[i].parentNode!.removeChild(directory.childNodes[i]);
    }

    h.length && h.forEach((item: HTMLHeadElement, index) => {

        const div = document.createElement('div');
        const h = document.createElement(item.nodeName);
        h.id = item.id.replace(/[1-9]/g, '') + "_";
        item.nodeName !== "H1" && h.addEventListener("click", () => {
            let high = item.offsetTop;
            // 通过滚轮高度跳转
            document.documentElement.scrollTop = high - 130;
        });
        h.innerHTML = `${item.innerText}`;
        div.appendChild(h);
        directory.childNodes[1].appendChild(div);

    });

};