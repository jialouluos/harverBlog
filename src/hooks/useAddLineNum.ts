export default (type: "back" | "front") => {
    //markdown代码存放在pre code 标签对中
    let codeArray: NodeListOf<HTMLPreElement>;
    if (type === "back") codeArray = document.querySelectorAll(".v-show-content pre");
    else codeArray = document.querySelectorAll("pre");
    codeArray.length !== 0 && codeArray.forEach((item: HTMLPreElement) => {
        item.className = "code";
        const lines = item.textContent ? item.textContent.split('\n').length - 1 : 0;
        const numbering = document.createElement('ol');
        numbering.className = "pre-numbering";
        for (let i = 1; i <= lines; i++) {
            const li = document.createElement('li');
            numbering.appendChild(li);
        }
        const extension = document.createElement('div');
        extension.className = "code-extension";
        extension.style.userSelect = 'none';
        extension.innerHTML =/* html*/ `
      <i class="ic i-down_arrow code-shrink"  title="收缩"></i>
      <i class ="code-introduce" >${item.children[0]?.classList[0]?.slice(type === "back" ? 5 : 9)}</i>
      <i class="ic i-copy code-copy">复制代码</i>`;
        for (let i = item.childNodes.length - 1; i > 0; i--) {
            item.childNodes[i].parentNode!.removeChild(item.childNodes[i]);
        }
        item.appendChild(numbering);
        item.appendChild(extension);
    });
};