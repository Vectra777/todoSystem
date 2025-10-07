import { createRouter, createWebHistory } from "vue-router";
import Home from "./pages/HomeView/Home.vue";
import Login from "./pages/LoginView/Login.vue";
import About from "./pages/AboutView/About.vue";
import Dashboard from "./pages/DashboardView/Dashboard.vue";


const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/about", component: About },
  {path: "/dashboard", component: Dashboard }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
