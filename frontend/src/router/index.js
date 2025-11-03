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
  { path: "/login", component: Login },
  { path: "/about", component: About },
  { path: "/dashboard", component: Dashboard },
  { path: "/hr", component: RHDashboard, meta: { requiresAdmin: true } },
  { path: "/profile", component: Profile },
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
