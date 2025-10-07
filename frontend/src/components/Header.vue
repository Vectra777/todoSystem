<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-body shadow-sm sticky-top" aria-label="Main navigation">
    <div class="container-fluid px-4">
      <!-- Logo -->
      <router-link to="/" class="navbar-brand d-flex align-items-center">
        <img :src="logo" alt="Todo System logo" class="logo-image me-2" />
      </router-link>

      <!-- Toggler for mobile -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarContent"
        aria-controls="navbarContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Nav links -->
      <div class="collapse navbar-collapse" id="navbarContent">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
          <li v-for="view in views" :key="view.name" class="nav-item">
            <router-link
              :to="view.path"
              class="nav-link px-3"
              active-class="active"
            >
              {{ view.name }}
            </router-link>
          </li>

          <!-- Divider for large screens -->
          <li class="nav-item d-none d-lg-block">
            <span class="vr mx-2"></span>
          </li>

          <li class="nav-item ms-lg-3">
            <router-link 
              to="/login" 
              class="btn btn-outline-primary d-flex align-items-center px-3 py-1"
              active-class="active"
            >
              <i class="bi bi-person-circle me-1"></i> My Account
            </router-link>
          </li>
          <li class="nav-item ms-lg-3">
            <button
              :class="buttonClass"
              :aria-pressed="isDark"
              :aria-label="isDark ? 'Disable dark mode' : 'Enable dark mode'"
              @click="toggleDarkMode"
              ref="darkBtn"
              title="Toggle dark mode"
            >
              <i :class="iconClass"></i>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import logo from '../assets/logo.png';

export default {
  name: 'Header',
  data() {
    return {
      logo,
      views: [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        { name: "HR Dashboard", path: "/hr" },
        { name: "My Dashboard", path: "/dashboard" },
      ]
      ,
      // track dark mode state
      isDark: false
    };
  }
  ,
  computed: {
    buttonClass() {
      return ['btn', this.isDark ? 'btn-light' : 'btn-dark', 'px-2', 'py-1', 'd-flex', 'align-items-center'];
    },
    iconClass() {
      // show sun when dark mode is active (to indicate turning it off), moon when light
      return this.isDark ? 'bi bi-sun-fill text-dark' : 'bi bi-moon-stars-fill text-white';
    }
  },
  methods: {
    toggleDarkMode() {
      this.isDark = !this.isDark;
      // Set Bootstrap 5.3 data-bs-theme attribute on the root element
      const theme = this.isDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-bs-theme', theme);

      // Also toggle the local .dark-mode class so our custom CSS still applies
      if (this.isDark) document.documentElement.classList.add('dark-mode');
      else document.documentElement.classList.remove('dark-mode');

      // persist preference (use 'todo-bs-theme' with values 'dark'|'light')
      try {
        localStorage.setItem('todo-bs-theme', theme);
      } catch (e) {
        // ignore
      }
    }
  },
  mounted() {
    // Initialize theme from localStorage -> existing data-bs-theme attribute -> system preference
    try {
      const storedBs = localStorage.getItem('todo-bs-theme');
      if (storedBs === 'dark') this.isDark = true;
      else if (storedBs === 'light') this.isDark = false;
      else {
        // fallback to previous key used earlier implementations
        const oldStored = localStorage.getItem('todo-dark-mode');
        if (oldStored === '1') this.isDark = true;
        else if (oldStored === '0') this.isDark = false;
        else {
          const attr = document.documentElement.getAttribute('data-bs-theme');
          if (attr === 'dark') this.isDark = true;
          else if (attr === 'light') this.isDark = false;
          else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) this.isDark = true;
          else this.isDark = false;
        }
      }
    } catch (e) {
      this.isDark = false;
    }

    // apply theme to document
    const theme = this.isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', theme);
    if (this.isDark) document.documentElement.classList.add('dark-mode');
    else document.documentElement.classList.remove('dark-mode');
  }
};
</script>

<style scoped>
.logo-image {
  height: 2rem;
}

/* Nav link styling */
.nav-link {
  font-weight: 500;
  position: relative;
  transition: color 0.3s, transform 0.2s;
}

.nav-link:hover {
  color: var(--bs-primary);
}

.nav-link.active {
  color: var(--bs-primary);
}

.nav-link.active::after,
.nav-link:hover::after {
  content: '';
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: 0;
  height: 2px;
  border-radius: 2px;
  background-color: currentColor;
  transition: all 0.3s ease;
}

/* Vertical divider for large screens */
.vr {
  border-left: 1px solid #dee2e6;
  height: 24px;
}
</style>
