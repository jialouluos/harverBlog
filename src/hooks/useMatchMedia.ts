import { ref, Ref } from "vue";
export default (ref: Ref<any> | null = null, width: number, type: 'min' | 'max',fristRun:boolean, onChange?: (ismatch: boolean) => void) => {
    const mQuery = window.matchMedia(`(${type}-width: ${width}px)`);
    ref && (ref.value = mQuery.matches);
    fristRun && mQuery.matches && onChange && onChange(mQuery.matches);
    mQuery.onchange = () => {
        ref && (ref.value = mQuery.matches);
        onChange && onChange(mQuery.matches);
    };
};