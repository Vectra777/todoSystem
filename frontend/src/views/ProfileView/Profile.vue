<template>
  <div class="profile-root d-flex flex-column min-vh-100" :class="{ 'dark-mode': isDark }">
    <Header />

    <main class="flex-grow-1 py-4">
      <div class="container">
        <!-- Profile Card -->
        <div class="card shadow-sm mb-4">
          <div class="card-header text-center fw-semibold">Profile</div>
          <div class="card-body">
            <div class="row align-items-center g-3">
              <div class="col-md">
                <div class="p-3 bg-body-secondary rounded">
                  <div class="mb-2"><span class="fw-semibold">Last name:</span> {{ lastName }}</div>
                  <div class="mb-2"><span class="fw-semibold">First Name:</span> {{ firstName }}</div>
                  <div class="mb-0"><span class="fw-semibold">Role:</span> {{ roleLabel }}</div>
                </div>
              </div>
              <div class="col-auto">
                <div class="avatar-circle d-flex align-items-center justify-content-center" :style="{ backgroundColor: avatarBg }">
                  <span class="avatar-initials">{{ initials }}</span>
                </div>
              </div>
            </div>

            <div class="d-flex gap-2 mt-3 justify-content-center justify-content-md-start flex-wrap">
              <button type="button" class="btn btn-outline-secondary" @click="onResetPassword">
                Reset password
              </button>
              <button type="button" class="btn btn-danger" @click="onLogout">
                Log out
              </button>
            </div>
          </div>
        </div>

        <!-- Teams Card -->
        <div class="card shadow-sm">
          <div class="card-header text-center fw-semibold">My Teams</div>
          <div class="list-group list-group-flush">
            <div v-if="teams.length === 0" class="list-group-item text-muted text-center">
              No teams yet
            </div>
            <div v-for="team in teams" :key="team.id" class="list-group-item">
              <div class="row align-items-center">
                <div class="col-6 col-md-4 fw-medium">{{ team.name }}</div>
                <div class="col-3 col-md-4 text-md-center text-muted">
                  {{ team.employees }} employees
                </div>
                <div class="col-3 col-md-4 text-md-end text-muted">
                  {{ team.competences }} competences
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer class= "bg-body"/>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { mapStores } from 'pinia'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { useThemeStore } from '../../stores/theme'
import { useUserStore } from '../../stores/user'

// stores
const themeStore = useThemeStore()
const userStore = useUserStore()

// reactive/computed user data
const fullName = computed(() => userStore.displayName || 'Guest User')
const [firstName, lastName] = (() => {
  const parts = (userStore.displayName || '').trim().split(/\s+/)
  return [parts[0] || 'First', parts.slice(1).join(' ') || 'Last']
})()
const roleLabel = computed(() => (userStore.role ? userStore.role[0].toUpperCase() + userStore.role.slice(1) : 'Admin'))

const initials = computed(() => {
  const names = (userStore.displayName || 'Guest User').trim().split(/\s+/)
  const first = names[0]?.[0] || 'G'
  const second = names[1]?.[0] || 'U'
  return (first + second).toUpperCase()
})

const avatarBg = computed(() => '#59c4ad') // pleasant teal similar to screenshot

// teams come from the user store
const teams = computed(() => userStore.teams || [])

// actions
function onResetPassword() {
  // Placeholder: wire to real flow
  alert('Password reset flow coming soon.')
}

function onLogout() {
  userStore.clearUser()
}

// theme helper
const isDark = computed(() => themeStore.isDark)
</script>

<style scoped>
.profile-root {
  background: radial-gradient(circle at 70% 15%, rgba(0, 180, 255, 0.6), transparent 60%),
              radial-gradient(circle at 30% 65%, rgba(255, 0, 120, 0.5), transparent 60%),
              #000;
}

.dark-mode .card {
  background-color: #2b2b2b;
  color: #eaeaea;
}

.avatar-circle {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  color: #fff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.avatar-initials {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 1px;
}
</style>