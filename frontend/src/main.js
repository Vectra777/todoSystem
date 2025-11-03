import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import { useThemeStore } from './stores/theme'
import { useUserStore } from './stores/user'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

const app = createApp(App)
const pinia = createPinia()

// Initialize stores with side effects before mounting
const themeStore = useThemeStore(pinia)
themeStore.initialize()

const userStore = useUserStore(pinia)
userStore.initialize()

app
  .use(pinia)
  .use(router)
  .mount('#app')
