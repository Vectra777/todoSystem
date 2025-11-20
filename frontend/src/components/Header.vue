<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-body shadow-sm sticky-top" aria-label="Main navigation">
    <div class="container-fluid px-4">
      <!-- Logo -->
      <router-link to="/" class="navbar-brand d-flex align-items-center">
        <img :src="logo" alt="Todo System logo" class="logo-image me-2" />
      </router-link>

      <!-- Toggler for mobile -->
      <button
        class="navbar-toggler border-0 p-1"
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
      <div class="collapse navbar-collapse mt-3 mt-lg-0" id="navbarContent">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center text-center text-lg-start">
          <li
            v-for="view in navLinks"
            :key="view.name"
            class="nav-item"
          >
            <router-link
              :to="view.path"
              class="nav-link px-3 py-2"
              active-class="active"
            >
              {{ view.name }}
            </router-link>
          </li>

          <!-- Divider (large screens only) -->
          <li class="nav-item d-none d-lg-block">
            <span
              class="vr mx-2"
              :style="{ backgroundColor: isDark ? 'white' : '#424242' }"
            ></span>
          </li>

          <!-- Account/Logout button -->
          <li class="nav-item ms-lg-3 justify-content-center d-flex">
            <router-link 
              v-if="!userStore.isAuthenticated"
              to="/login" 
              class="btn btn-outline-primary align-items-center px-3 py-1 w-100 w-lg-auto mt-2 mt-lg-0"
              active-class="active"
            >
              <i class="bi bi-person-circle me-1"></i> My Account
            </router-link>
            <div v-else class="d-flex gap-2 w-100 w-lg-auto mt-2 mt-lg-0">
              <router-link 
                to="/profile" 
                class="btn btn-outline-primary align-items-center px-3 py-1 flex-grow-1 flex-lg-grow-0"
              >
                <i class="bi bi-person-circle me-1"></i> {{ userStore.displayName }}
              </router-link>
              <button
                @click="handleLogout"
                class="btn btn-outline-danger align-items-center px-3 py-1"
                title="Logout"
              >
                <i class="bi bi-box-arrow-right"></i>
              </button>
            </div>
          </li>

          <!-- Dark mode toggle -->
          <li class="nav-item ms-lg-3 justify-content-center d-flex mt-2 mt-lg-0">
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
import { mapStores } from 'pinia';
import logo from '../assets/logo.png';
import { useThemeStore } from '../stores/theme';
import { useUserStore } from '../stores/user';
import { useApiStore } from '../stores/api';

export default {
  name: 'Header',
  data() {
    return {
      logo,
      staticLinks: [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
      ],
      authLinks: [
        { name: "My Dashboard", path: "/dashboard" },
      ],
      hrLinks: [
        { name: "HR Dashboard", path: "/hr" }
      ]
    };
  },
  computed: {
    ...mapStores(useThemeStore, useUserStore),
    navLinks() {
      if (!this.userStore.isAuthenticated) {
        return this.staticLinks;
      }
      
      const links = [...this.staticLinks, ...this.authLinks];
      const isHR = ['hr', 'rh', 'admin'].includes((this.userStore.role || '').toLowerCase());
      
      if (isHR) {
        return [...links, ...this.hrLinks];
      }
      
      return links;
    },
    isDark() {
      return this.themeStore.isDark;
    },
    buttonClass() {
      return ['btn', this.isDark ? 'btn-light' : 'btn-dark', 'px-2', 'py-1', 'd-flex', 'align-items-center'];
    },
    iconClass() {
      return this.isDark ? 'bi bi-sun-fill text-dark' : 'bi bi-moon-stars-fill text-white';
    }
  },
  methods: {
    toggleDarkMode() {
      this.themeStore.toggleTheme();
    },
    async handleLogout() {
      const apiStore = useApiStore();
      try {
        await apiStore.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Always redirect to home page after logout
        this.$router.push('/');
      }
    }
  }
};
</script>

<style scoped>
.logo-image {
  height: 2rem;
}

/* Nav link styling */
.nav-link {
  display: flex;
  justify-content: center;
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
  width: 1px;
  height: 24px;
  display: inline-block;
  vertical-align: middle;
}

/* Responsive adjustments */
@media (max-width: 991.98px) {
  .navbar-collapse {
    padding: 1rem 0.75rem;
    background-color: var(--bs-body-bg);
    border-radius: 0.75rem;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  }

  .nav-link {
    padding: 0.75rem 0;
    font-size: 1rem;
  }

  .btn-outline-primary {
    width: 100%;
    font-weight: 500;
  }

  .navbar-toggler {
    outline: none;
  }

  .navbar-toggler:focus {
    box-shadow: none;
  }
}

/* Dark mode adaptation */
:deep(body.dark-mode) .navbar {
  background-color: #222 !important;
}

:deep(body.dark-mode) .navbar-collapse {
  background-color: #2a2a2a;
  box-shadow: 0 6px 18px rgba(255, 255, 255, 0.05);
}

:deep(body.dark-mode) .nav-link {
  color: #e6e6e6;
}

:deep(body.dark-mode) .nav-link.active {
  color: #4f8cff;
}
</style>
