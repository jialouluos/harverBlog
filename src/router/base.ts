import { createRouter, createWebHistory } from "vue-router";
import { RouteRecordRaw } from "vue-router";
import viewRouters from "./viewblog";
const routes: Array<RouteRecordRaw> = [
    {
        path: '/',//进入页面
        redirect: '/welcome',
    },
    {
        path: '/welcome',
        name: "v_welcome",
        component: () => import("@/pages/Welcome.vue")
    },
    ...viewRouters,
    {
        path: '/:pathMatch(.*)*',//匹配所有路径
        component: () => import("@/pages/NoFound.vue")
    },
    {
        path: '/no-found',
        component: () => import("@/pages/NoFound.vue"),//404
        name: "404"
    },

];
const Router = createRouter({
    history: createWebHistory('/'),
    routes
});
// Router.beforeEach((to, from, next) => {
//     console.log(to, from);
//     next();
// });
export { Router };