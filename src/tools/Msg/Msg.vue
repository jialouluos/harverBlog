<template>
    <div class="msg add" :class="[type]" ref="MsgRef">
        <i class="iconfont"></i>
        <span>{{message}}</span>
        <button @click="closeMsg()" v-if="needClose"><span>关闭</span></button>
    </div>
</template>

<script lang="ts">
import { PropType } from 'vue-demi';
export default defineComponent({
    props: {
        message: {
            type: String,
            default: ''
        },
        type: {
            type: String as PropType<'success' | 'error' | 'warning' | 'info'>,
            default: 'success'
        },
        needClose: {
            type: Boolean,
            default: true
        },
    },
    setup(props) {

        const { type, message, needClose } = (props);
        const MsgRef = ref<HTMLDivElement>();

        const closeMsg = () => {
            (MsgRef.value as any)?.selfDestory();
        };
        return {
            message,
            type,
            MsgRef,
            needClose,
            closeMsg,
        };
    },
});
</script>

<style scoped lang="less">

</style>
  