import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/HomeView/Home.vue";
import Login from "../views/LoginView/Login.vue";
import About from "../views/AboutView/About.vue";
import Dashboard from "../views/DashboardView/Dashboard.vue";
import RHDashboard from "../views/RHView/Dashboard.vue";
import Profile from "../views/ProfileView/Profile.vue";
import NotFound from "../views/404View/NotFound.vue";
import { useUserStore } from "../stores/user";


const routes = [
  { path: "/", component: Home },
  { path: "/home", redirect: "/" },
  { path: "/login", component: Login },
  { path: "/about", component: About },
  { path: "/dashboard", component: Dashboard, meta: { requiresAuth: true } },
  { path: "/hr", component: RHDashboard, meta: { requiresAuth: true, requiresHR: true } },
  { path: "/profile", component: Profile, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', name: '404', component: NotFound }
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
  const userStore = useUserStore();
  userStore.initialize();

  // Check if route requires authentication
  if (to.meta?.requiresAuth) {
    if (!userStore.isAuthenticated) {
      // Redirect to login if not authenticated
      return next({ path: "/login", query: { redirect: to.fullPath } });
    }

    // Check if route requires HR role
    if (to.meta?.requiresHR) {
      const isHR = ['hr', 'rh', 'admin'].includes((userStore.role || '').toLowerCase());
      if (!isHR) {
        return next({ path: "/dashboard" });
      }
    }
  }

  // If authenticated user tries to access login, redirect to dashboard
  if (to.path === '/login' && userStore.isAuthenticated) {
    return next({ path: "/dashboard" });
  }

  next();
});

export default router;
