import { createRouter, createWebHistory } from "vue-router";
import Login from "@/pages/Login.vue";
import Dashboard from "@/pages/Dashboard.vue";
import Project from "@/pages/Project.vue";
import UserManagementPage from "@/pages/UserManagementPage.vue";
import { useAuthStore } from "../store/auth.store";
import { useAccessToken } from "../utils/useAuthStorage";

const routes = [
  { path: "/", component: Login },
  { path: "/dashboard", component: Dashboard },
  { path: "/project", component: Project },
  { path: '/users', component: UserManagementPage }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  const token = useAccessToken();

  const isAuthenticated = auth.isAuthenticated || !!token;

  if (!isAuthenticated && to.path !== "/") {
    return next("/");
  }

  if (isAuthenticated && to.path === "/") {
    return next("/dashboard");
  }

  next();
});

export default router;
