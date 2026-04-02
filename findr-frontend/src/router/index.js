import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AppLayout from "@/components/layout/AppLayout.vue";

const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/LoginView.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/RegisterView.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "home",
        name: "Home",
        component: () => import("@/views/HomeView.vue"),
      },
      {
        path: "search",
        name: "Search",
        component: () => import("@/views/SearchView.vue"),
      },
      {
        path: "saved",
        name: "Saved",
        component: () => import("@/views/SavedView.vue"),
      },
      {
        path: "agent",
        name: "Agent",
        component: () => import("@/views/AgentView.vue"),
      },
      {
        path: "profile",
        name: "Profile",
        component: () => import("@/views/ProfileView.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next("/login");
  } else if (to.meta.guestOnly && auth.isLoggedIn) {
    next("/home");
  } else {
    next();
  }
});

export default router;
