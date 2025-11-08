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

    <!-- Password Reset Modal -->
    <div v-if="showPasswordModal" class="modal-overlay" @click.self="closePasswordModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reset Password</h5>
            <button type="button" class="btn-close" @click="closePasswordModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Alert for errors/success -->
            <div v-if="passwordMessage" :class="['alert', passwordMessageType === 'success' ? 'alert-success' : 'alert-danger', 'alert-dismissible', 'fade', 'show']" role="alert">
              {{ passwordMessage }}
              <button type="button" class="btn-close" @click="passwordMessage = ''" aria-label="Close"></button>
            </div>

            <form @submit.prevent="handlePasswordReset">
              <!-- Current Password -->
              <div class="mb-3">
                <label for="currentPassword" class="form-label">Current Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="currentPassword"
                  v-model.trim="passwordForm.currentPassword"
                  required
                  placeholder="Enter your current password"
                />
              </div>

              <!-- New Password -->
              <div class="mb-3">
                <label for="newPassword" class="form-label">New Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="newPassword"
                  v-model.trim="passwordForm.newPassword"
                  required
                  minlength="6"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <!-- Confirm New Password -->
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm New Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="confirmPassword"
                  v-model.trim="passwordForm.confirmPassword"
                  required
                  minlength="6"
                  placeholder="Confirm new password"
                />
              </div>

              <div class="d-flex gap-2 justify-content-end">
                <button type="button" class="btn btn-secondary" @click="closePasswordModal">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="passwordLoading">
                  <span v-if="passwordLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ passwordLoading ? 'Updating...' : 'Update Password' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { mapStores } from 'pinia'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { useThemeStore } from '../../stores/theme'
import { useUserStore } from '../../stores/user'
import { useApiStore } from '../../stores/api'
import router from '../../router'

// stores
const themeStore = useThemeStore()
const userStore = useUserStore()
const apiStore = useApiStore()

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

// Password reset modal
const showPasswordModal = ref(false)
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordLoading = ref(false)
const passwordMessage = ref('')
const passwordMessageType = ref('success')

// actions
function onResetPassword() {
  showPasswordModal.value = true
  passwordMessage.value = ''
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

function closePasswordModal() {
  showPasswordModal.value = false
  passwordMessage.value = ''
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

async function handlePasswordReset() {
  passwordMessage.value = ''

  // Validation
  if (!passwordForm.value.currentPassword) {
    passwordMessage.value = 'Please enter your current password'
    passwordMessageType.value = 'error'
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    passwordMessage.value = 'New password must be at least 6 characters'
    passwordMessageType.value = 'error'
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordMessage.value = 'New passwords do not match'
    passwordMessageType.value = 'error'
    return
  }

  if (passwordForm.value.currentPassword === passwordForm.value.newPassword) {
    passwordMessage.value = 'New password must be different from current password'
    passwordMessageType.value = 'error'
    return
  }

  passwordLoading.value = true

  try {
    await apiStore.changePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    )
    
    passwordMessage.value = 'Password updated successfully!'
    passwordMessageType.value = 'success'
    
    // Close modal after 2 seconds
    setTimeout(() => {
      closePasswordModal()
    }, 2000)
  } catch (error) {
    console.error('Password reset error:', error)
    passwordMessage.value = error.message || 'Failed to update password'
    passwordMessageType.value = 'error'
  } finally {
    passwordLoading.value = false
  }
}

async function onLogout() {
  try {
    await apiStore.logout()
  } catch (error) {
    console.error('Logout error:', error)
    userStore.clearUser()
  } finally {
    // Always redirect to home page after logout
    router.push('/')
  }
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

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  backdrop-filter: blur(4px);
}

.modal-dialog {
  max-width: 500px;
  width: 90%;
  margin: 1.75rem auto;
}

.modal-content {
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dark-mode .modal-content {
  background-color: #2b2b2b;
  color: #eaeaea;
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dark-mode .modal-header {
  border-bottom-color: #444;
}

.modal-title {
  margin: 0;
  font-weight: 600;
}

.modal-body {
  padding: 1.5rem;
}

.btn-close {
  background: transparent url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23000'%3e%3cpath d='M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z'/%3e%3c/svg%3e") center/1em auto no-repeat;
  border: 0;
  padding: 0.25rem;
  width: 1em;
  height: 1em;
  opacity: 0.5;
  cursor: pointer;
}

.btn-close:hover {
  opacity: 0.75;
}

.dark-mode .btn-close {
  filter: invert(1);
}
</style>