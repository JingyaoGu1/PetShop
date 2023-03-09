import { createWebHistory, createRouter } from "vue-router";

const routes =  [
    {
        path: "/",
        name: "main",
        component: () => import("./components/HelloWorld.vue")
    },
    {
        path: "/breed",
        name: "pick a breed",
        component: () => import("./components/PickaBreed.vue")
    },
    {
        path: "/login",
        name: "login",
        component: () => import("./components/Login.vue")
    },
    {
        path: "/search",
        name: "search",
        component: () => import("./components/search/Search.vue")
    },
    {
        path: "/pets/:id",
        name: "pet profile page",
        component: () => import("./components/PetProfile.vue")
    },
    {
        path: "/admin",
        name: "admin",
        component: () => import("./components/admin_page/AdminPage.vue")
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes: routes,
});

export default router;
