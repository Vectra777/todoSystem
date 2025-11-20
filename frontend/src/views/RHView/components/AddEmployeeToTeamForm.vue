<template>
  <div class="bg-body rounded-4 p-4 shadow-sm">
    <h2 class="text-center fs-5 mb-3">Assign Employee to Team</h2>

    <form @submit.prevent="handleSubmit">
      <!-- Employee Selection -->
      <div class="mb-3">
        <label class="form-label fw-semibold">Select Employee</label>
        <div class="position-relative">
          <input
            type="text"
            v-model="employeeSearchQuery"
            @focus="showEmployeeDropdown = true"
            @blur="hideEmployeeDropdownDelayed"
            class="form-control"
            placeholder="Search for an employee..."
            :disabled="loadingEmployees"
          />
          <div
            v-if="showEmployeeDropdown && (loadingEmployees || filteredEmployees.length > 0)"
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
              @mousedown.prevent="selectEmployee(employee)"
            >
              <i class="bi bi-person-fill me-2"></i>{{ employee.firstname }} {{ employee.lastname }}
            </div>
          </div>
        </div>
        <div v-if="selectedEmployee" class="mt-2">
          <span class="badge bg-primary">
            {{ selectedEmployee.firstname }} {{ selectedEmployee.lastname }}
            <button
              type="button"
              class="btn-close btn-close-white ms-2"
              style="font-size: 0.6rem"
              @click="clearEmployee"
              aria-label="Clear"
            ></button>
          </span>
        </div>
      </div>

      <!-- Team Selection -->
      <div class="mb-3">
        <label class="form-label fw-semibold">Select Team</label>
        <div class="position-relative">
          <input
            type="text"
            v-model="teamSearchQuery"
            @focus="showTeamDropdown = true"
            @blur="hideTeamDropdownDelayed"
            class="form-control"
            placeholder="Search for a team..."
            :disabled="loadingTeams"
          />
          <div
            v-if="showTeamDropdown && (loadingTeams || filteredTeams.length > 0)"
            class="position-absolute w-100 mt-1 bg-white border rounded shadow-sm"
            style="max-height: 200px; overflow-y: auto; z-index: 1000"
          >
            <div v-if="loadingTeams" class="p-2 text-center text-muted">
              <span class="spinner-border spinner-border-sm me-2"></span>
              Loading teams...
            </div>
            <div
              v-else
              v-for="team in filteredTeams"
              :key="team.id"
              class="p-2 hover-bg-light"
              style="cursor: pointer"
              @mousedown.prevent="selectTeam(team)"
            >
              <i class="bi bi-people-fill me-2"></i>{{ team.team_name }}
            </div>
          </div>
        </div>
        <div v-if="selectedTeam" class="mt-2">
          <span class="badge bg-info">
            {{ selectedTeam.team_name }}
            <button
              type="button"
              class="btn-close btn-close-white ms-2"
              style="font-size: 0.6rem"
              @click="clearTeam"
              aria-label="Clear"
            ></button>
          </span>
        </div>
      </div>

      <!-- Role Selection -->
      <div class="mb-3">
        <label class="form-label fw-semibold">Role in Team</label>
        <select v-model="role" class="form-select" required>
          <option value="">Select a role</option>
          <option value="member">Member</option>
          <option value="lead">Team Lead</option>
          <option value="manager">Manager</option>
        </select>
      </div>

      <!-- Error/Success Messages -->
      <div v-if="errorMessage" class="alert alert-danger" role="alert">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="alert alert-success" role="alert">
        {{ successMessage }}
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="btn btn-primary w-100"
        :disabled="!selectedEmployee || !selectedTeam || !role || submitting"
      >
        <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
        {{ submitting ? 'Adding...' : 'Add to Team' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApiStore } from '../../../stores/api'

const apiStore = useApiStore()
const emit = defineEmits(['member-added'])

// Employee data
const employees = ref([])
const loadingEmployees = ref(false)
const employeeSearchQuery = ref('')
const showEmployeeDropdown = ref(false)
const selectedEmployee = ref(null)

// Team data
const teams = ref([])
const loadingTeams = ref(false)
const teamSearchQuery = ref('')
const showTeamDropdown = ref(false)
const selectedTeam = ref(null)

// Form data
const role = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Computed
const filteredEmployees = computed(() => {
  if (!employeeSearchQuery.value.trim()) return employees.value
  const query = employeeSearchQuery.value.toLowerCase()
  return employees.value.filter(
    (emp) =>
      emp.firstname.toLowerCase().includes(query) ||
      emp.lastname.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query)
  )
})

const filteredTeams = computed(() => {
  if (!teamSearchQuery.value.trim()) return teams.value
  const query = teamSearchQuery.value.toLowerCase()
  return teams.value.filter((team) => team.team_name.toLowerCase().includes(query))
})

// Methods
async function loadEmployees() {
  loadingEmployees.value = true
  try {
    employees.value = await apiStore.getEmployees()
  } catch (error) {
    console.error('Failed to load employees:', error)
    errorMessage.value = 'Failed to load employees'
  } finally {
    loadingEmployees.value = false
  }
}

async function loadTeams() {
  loadingTeams.value = true
  try {
    teams.value = await apiStore.getTeams()
  } catch (error) {
    console.error('Failed to load teams:', error)
    errorMessage.value = 'Failed to load teams'
  } finally {
    loadingTeams.value = false
  }
}

function selectEmployee(employee) {
  selectedEmployee.value = employee
  employeeSearchQuery.value = `${employee.firstname} ${employee.lastname}`
  showEmployeeDropdown.value = false
}

function clearEmployee() {
  selectedEmployee.value = null
  employeeSearchQuery.value = ''
}

function selectTeam(team) {
  selectedTeam.value = team
  teamSearchQuery.value = team.team_name
  showTeamDropdown.value = false
}

function clearTeam() {
  selectedTeam.value = null
  teamSearchQuery.value = ''
}

function hideEmployeeDropdownDelayed() {
  setTimeout(() => {
    showEmployeeDropdown.value = false
  }, 200)
}

function hideTeamDropdownDelayed() {
  setTimeout(() => {
    showTeamDropdown.value = false
  }, 200)
}

async function handleSubmit() {
  if (!selectedEmployee.value || !selectedTeam.value || !role.value) {
    return
  }

  submitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const memberData = {
      employee_id: selectedEmployee.value.id,
      team_id: selectedTeam.value.id,
      role: role.value
    }

    await apiStore.createTeamMember(memberData)
    
    successMessage.value = `Successfully added ${selectedEmployee.value.firstname} ${selectedEmployee.value.lastname} to ${selectedTeam.value.team_name}!`
    
    // Emit event to parent
    emit('member-added', { employee: selectedEmployee.value, team: selectedTeam.value, role: role.value })
    
    // Reload data to reflect changes
    await Promise.all([loadEmployees(), loadTeams()])
    
    // Reset form
    selectedEmployee.value = null
    employeeSearchQuery.value = ''
    selectedTeam.value = null
    teamSearchQuery.value = ''
    role.value = ''

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Failed to add employee to team:', error)
    errorMessage.value = error.message || 'Failed to add employee to team. They may already be in this team.'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadEmployees()
  loadTeams()
})
</script>

<style scoped>
.hover-bg-light:hover {
  background-color: #f8f9fa;
}
</style>
