<script lang="ts">
export default defineComponent({
    setup() {
        return {
        };
    },
});
</script>
<template>
    <div class="no_found" style="width: 100%; height: 100%">
        <img src="@/assets/images/404.png" alt="404" style="width: 100%; height: 100%" draggable="false" />
        <router-link class="return_main" to="/warpper">返回博客</router-link>
    </div>
</template>
<style lang = "less" scoped>
.no_found {
    display: flex;
    justify-content: center;
    text-align: center;
}

.return_main {
    width: 200px;
    height: 50px;
    font-size: 30px;
    user-select: none;
    cursor: pointer;
    color: azure;
    position: absolute;
    line-height: 50px;
    text-decoration: none;
    border-radius: 10px;
    bottom: 10vh;
    background-color: #332dab;
}

.return_main:hover {
    color: rgb(183, 243, 243);
}
</style>