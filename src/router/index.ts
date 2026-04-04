import { createRouter, createWebHistory } from "vue-router";
import Login from "@/pages/Login.vue";
import Dashboard from "@/pages/Dashboard.vue";
import Project from "@/pages/Project.vue";
import UserManagementPage from "@/pages/UserManagementPage.vue";
import { useAuthStore } from "../store/auth.store";
import { useAccessToken } from "../utils/useAuthStorage";
import { storeToRefs } from "pinia";

const routes = [
  { path: "/login", component: Login },
  { path: "/", redirect: "/dashboard" },
  { path: "/dashboard", component: Dashboard },
  { path: "/project", component: Project },
  { path: '/users', component: UserManagementPage }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  const { isAuthenticated } = storeToRefs(auth);
  const token = useAccessToken();

  const isLogin = isAuthenticated.value || !!token;

  if (!isLogin && to.path !== "/login") return "/login";
  if (isLogin && to.path === "/login") return "/dashboard";

  return true;
});

export default router;
