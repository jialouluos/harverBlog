export default () => {
    //自定义注释颜色

    const commentArray = document.querySelectorAll(".hljs-comment") as NodeListOf<HTMLSpanElement>;
    commentArray.length !== 0 && commentArray.forEach(item => {
        const prefixStr = item.innerText.slice(0, 2).trim();
        const checkStr = item.innerText.slice(2).trim();
        const check = checkStr[0];
        if (prefixStr === '//' && checkStr) {
            check === "?" && (item.style.color = "#3498DB");
            check === "!" && (item.style.color = "#e82e2e");
            check === "*" && (item.style.color = "#98C379");
            check === "@" && (item.style.color = "#06f5e2");
        }
    });
};