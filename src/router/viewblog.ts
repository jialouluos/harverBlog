import { RouteRecordRaw } from "vue-router";

const router: Array<RouteRecordRaw> = [

    {
        path: '/warpper',
        name: "v_warpper",
        component: () => import("@/pages/Warpper.vue"),
        children: [
            {
                path: '',
                name: "r2",
                redirect: '/warpper/home',
            },
            {
                path: 'home',
                name: "v_home",
                component: () => import("@/pages/Home.vue"),
            },
            {
                path: 'category',
                name: "v_category",
                component: () => import("@/pages/Category.vue")
            },
            {
                path: 'about',
                name: "v_about",
                component: () => import("@/pages/About.vue"),
                meta: {
                    keepAlive: true //需要被缓存
                }
            },
            {
                path: 'seek',
                name: "v_seek",
                component: () => import("@/pages/Seek.vue"),
                meta: {
                    keepAlive: true //需要被缓存
                }
            },
            {
                path: 'display',
                name: "v_display",
                component: () => import("@/pages/Display.vue")
            },
            {
                path: 'timeline',
                component: () => import("@/pages/Timeline.vue"),
                name: "v_timeline",
                meta: {
                    keepAlive: true //需要被缓存
                }
            },
            {
                path: 'project',
                component: () => import("@/pages/Project.vue"),
                name: "v_project",
                meta: {
                    keepAlive: true //需要被缓存
                }
            },
            {
                path: 'friend',
                component: () => import("@/pages/Friend.vue"),
                name: "v_friend",
                meta: {
                    keepAlive: true //需要被缓存
                }
            },
            {
                path: 'demo',
                component: () => import("@/pages/Demo.vue"),
                name: "v_demo",
                meta: {
                    keepAlive: true //需要被缓存
                }
            },
            {
                path: 'person',
                component: () => import("@/pages/Person.vue"),
                name: "v_person",
                meta: {
                    keepAlive: true //需要被缓存
                }
            },
            {
                path: '*',
                component: () => import("@/pages/Warpper.vue")
            },
        ],
    },
];
export default router;
