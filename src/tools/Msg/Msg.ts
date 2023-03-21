
import { createVNode, render } from 'vue';
import XtxMessage from './Msg.vue';
const Container = createVNode('div', { class: 'msg_container' });
render(Container, document.body);
const MsgDom = Container.el as Element;
export interface I_Msg {
    duration?: number;
}
let msgOptions: I_Msg = {
    duration: 3000
};
interface I_SingleMsg {
    stay?: boolean;
    needClose?:boolean
}
let isComplete = true;
type T_CreateN = (message: string, type: 'success' | 'error' | 'warning' | 'info', op: I_SingleMsg & I_Msg ) => void;
const createN:T_CreateN = (message, type, op) => {
    if (!isComplete) return;
    isComplete = false;
    const { stay = false } = op;
    msgOptions = { ...msgOptions, ...op };
    const vnode = createVNode(XtxMessage, { message, type,...op });
    const realNode = document.createElement('div');
    render(vnode, realNode);
    let isDispose = false;
    MsgDom.appendChild(vnode.el as Element);
    const destory = () => {
        !isDispose && (vnode.el as Element).classList.remove('add');
        !isDispose && (vnode.el as Element).classList.add('remove');
        !isDispose && setTimeout(() => {
            MsgDom.removeChild(vnode.el as Element);
        }, 500);
        isDispose = true;
    };
    (vnode.el as any).selfDestory = destory;
    isComplete = true;
    if (!stay) {
        const timer = setTimeout(() => {
            destory();
            timer && clearTimeout(timer);
        }, msgOptions.duration);
    }
};
export const setOption = (option: I_Msg) => {
    msgOptions = { ...msgOptions, ...option };
};
export type T_N = (message: string, op?: I_SingleMsg & I_Msg) => void;
const msgObject: {
    [U in 'success' | 'warning' | 'info' | 'error']: T_N;
 } = {
    success(message, op) {
         createN(message, 'success', op ? op : {});
    },
    error(message, op) {
        createN(message, 'error',op ? op : {});
    },
    warning(message, op) {
        createN(message, 'warning',op ? op : {});
    },
    info(message,op) {
        createN(message, 'info',op ? op : {});
    }
};
export default msgObject;
