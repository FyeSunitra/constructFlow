import { createRouter, createWebHistory } from "vue-router";
import Login from "@/pages/Login.vue";
import Dashboard from "@/pages/Dashboard.vue";
import ProjectDetailPage from "@/pages/ProjectDetailPage.vue";
import UserManagementPage from "@/pages/UserManagementPage.vue";
import DailyUpdatePage from "@/pages/DailyUpdatePage.vue";
import BudgetPage from "@/pages/BudgetPage.vue";
import PhasePage from "@/pages/PhasePage.vue";
import { useAuthStore } from "../store/auth.store";
import { useAccessToken } from "../utils/useAuthStorage";
import { storeToRefs } from "pinia";
import TemplatePage from "@/pages/TemplatePage.vue";


const routes = [
  { path: "/login", component: Login },
  { path: "/", redirect: "/dashboard" },
  { path: "/dashboard", component: Dashboard },
  { path: "/project/:id", component: ProjectDetailPage },
  { path: "/project/:id/phase", component: PhasePage },
  { path: "/project/:id/daily", component: DailyUpdatePage },
  { path: "/project/:id/budget", component: BudgetPage },
  { path: "/template", component: TemplatePage },
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
