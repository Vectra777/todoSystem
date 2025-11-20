<template>
  <div class="bg-body rounded-4 p-4 shadow-sm">
    <h2 class="mb-3 text-center fs-5">Add Team</h2>
    
    <form @submit.prevent="handleSubmit">
      <!-- Team Name -->
      <div class="mb-3">
        <label class="form-label fw-semibold">Team Name</label>
        <input 
          type="text" 
          v-model="teamName"
          class="form-control" 
          placeholder="Enter team name" 
          required
        />
      </div>

      <!-- Leader Selection -->
      <div class="mb-3">
        <label class="form-label fw-semibold">Team Leader (Optional)</label>
        <div class="position-relative">
          <input
            type="text"
            v-model="leaderSearchQuery"
            @focus="showLeaderDropdown = true"
            @blur="hideLeaderDropdownDelayed"
            class="form-control"
            placeholder="Search for a leader..."
            :disabled="loadingEmployees"
          />
          <div
            v-if="showLeaderDropdown && (loadingEmployees || filteredEmployees.length > 0)"
            class="position-absolute w-100 mt-1 bg-white border rounded shadow-sm"
            style="max-height: 200px; overflow-y: auto; z-index: 1000"
          >
            <div v-if="loadingEmployees" class="p-2 text-center text-muted">
              <span class="spinner-border spinner-border-sm me-2"></span>
              Loading employees...
            </div>
            <div
              v-else
              v-for="employee in filteredEmployees"
              :key="employee.id"
              class="p-2 hover-bg-light"
              style="cursor: pointer"
              @mousedown.prevent="selectLeader(employee)"
            >
              <i class="bi bi-person-fill me-2"></i>{{ employee.firstname }} {{ employee.lastname }}
            </div>
          </div>
        </div>
        <div v-if="selectedLeader" class="mt-2">
          <span class="badge bg-primary">
            {{ selectedLeader.firstname }} {{ selectedLeader.lastname }}
            <button
              type="button"
              class="btn-close btn-close-white ms-2"
              style="font-size: 0.6rem"
              @click="clearLeader"
              aria-label="Clear"
            ></button>
          </span>
        </div>
      </div>

      <!-- Description -->
      <div class="mb-3">
        <label class="form-label fw-semibold">Description</label>
        <textarea 
          v-model="description"
          class="form-control" 
          placeholder="Enter team description"
          rows="3"
        ></textarea>
      </div>

      <!-- Error/Success Messages -->
      <div v-if="errorMessage" class="alert alert-danger" role="alert">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="alert alert-success" role="alert">
        {{ successMessage }}
      </div>

      <!-- Submit Button -->
      <div class="text-center">
        <button 
          type="submit"
          class="btn btn-success px-4"
          :disabled="!teamName || submitting"
        >
          <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
          {{ submitting ? 'Creating...' : 'Add Team' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApiStore } from '../../../stores/api'

const apiStore = useApiStore()
const emit = defineEmits(['team-created'])

// Form data
const teamName = ref('')
const description = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Employee/Leader data
const employees = ref([])
const loadingEmployees = ref(false)
const leaderSearchQuery = ref('')
const showLeaderDropdown = ref(false)
const selectedLeader = ref(null)

// Load employees on mount
onMounted(async () => {
  await loadEmployees()
})

async function loadEmployees() {
  loadingEmployees.value = true
  try {
    const response = await apiStore.getEmployees()
    employees.value = response
  } catch (error) {
    console.error('Failed to load employees:', error)
    employees.value = []
  } finally {
    loadingEmployees.value = false
  }
}

// Filtered employees based on search query
const filteredEmployees = computed(() => {
  if (!leaderSearchQuery.value.trim()) {
    return employees.value
  }
  const query = leaderSearchQuery.value.toLowerCase()
  return employees.value.filter(emp => {
    const fullName = `${emp.firstname} ${emp.lastname}`.toLowerCase()
    return fullName.includes(query)
  })
})

function selectLeader(employee) {
  selectedLeader.value = employee
  leaderSearchQuery.value = `${employee.firstname} ${employee.lastname}`
  showLeaderDropdown.value = false
}

function clearLeader() {
  selectedLeader.value = null
  leaderSearchQuery.value = ''
}

function hideLeaderDropdownDelayed() {
  setTimeout(() => {
    showLeaderDropdown.value = false
  }, 200)
}

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''
  submitting.value = true

  try {
    // Create team data
    const teamData = {
      team_name: teamName.value,
      description: description.value
    }

    // Create the team via API
    const createdTeam = await apiStore.createTeam(teamData)
    
    // Emit event to parent
    emit('team-created', createdTeam)
    
    // If a leader was selected, add them to the team with 'lead' role
    if (selectedLeader.value && createdTeam.id) {
      try {
        await apiStore.createTeamMember({
          team_id: createdTeam.id,
          employee_id: selectedLeader.value.id,
          role: 'lead'
        })
        successMessage.value = `Team created successfully with ${selectedLeader.value.firstname} ${selectedLeader.value.lastname} as leader!`
      } catch (leaderError) {
        console.error('Failed to add leader:', leaderError)
        successMessage.value = 'Team created successfully, but failed to add leader.'
      }
    } else {
      successMessage.value = 'Team created successfully!'
    }
    
    // Reload employees list in case leader was added
    await loadEmployees()
    
    // Reset form
    teamName.value = ''
    description.value = ''
    selectedLeader.value = null
    leaderSearchQuery.value = ''
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
    
  } catch (error) {
    console.error('Failed to create team:', error)
    errorMessage.value = error.message || 'Failed to create team. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.hover-bg-light:hover {
  background-color: #f8f9fa;
}
</style>
