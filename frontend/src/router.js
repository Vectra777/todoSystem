import { createRouter, createWebHistory } from "vue-router";
import Home from "./pages/HomeView/Home.vue";
import Login from "./pages/LoginView/Login.vue";
import About from "./pages/AboutView/About.vue";
import Dashboard from "./pages/DashboardView/Dashboard.vue";
import RHDashboard from "./pages/RHView/Dashboard.vue";
import { useUserStore } from "./stores/user";


const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/about", component: About },
  { path: "/dashboard", component: Dashboard },
  { path: "/hr", component: RHDashboard, meta: { requiresAdmin: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, left: 0, behavior: 'instant' }
    }
  }
});

router.beforeEach((to, from, next) => {
  if (!to.meta?.requiresAdmin) {
    return next();
  }

  const userStore = useUserStore();
  userStore.initialize();

  if (userStore.isAdmin) {
    return next();
  }

  next({ path: "/dashboard" });
});

export default router;
