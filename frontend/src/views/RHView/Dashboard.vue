<template>
  <div>
    <Header />
    <div class="dashboard-wrapper py-5">
      <div class="container">
        <SearchBar
          v-model="searchQuery"
          :suggestions="searchSuggestions"
          :loading="searchLoading"
          @item-selected="handleSearchSelection"
        />
        <TeamList
          :key="teamListKey"
          class="my-4"
          :selected-employee="selectedEmployee"
          :all-employees="employees"
          :all-competences="tasks"
          :focus-team-id="selectedTeamId"
          :visible-team-ids="visibleTeamIds"
        />

        <template v-if="!selectedEmployee">
          <AddTeamForm class="my-4" @team-created="handleTeamCreated" />
          <AddEmployeeForm class="my-4" @employee-created="handleEmployeeCreated" />
          <AddEmployeeToTeamForm class="my-4" @member-added="handleMemberAdded" />
        </template>
      </div>
    </div>

    <div class="container py-5">
      <h2 class="text-center mb-4">Competences</h2>
      <CompetenceFilters
        class="mb-4"
        @sort-change="handleSortChange"
        @status-change="handleStatusChange"
        @filter-label-change="handleLabelChange"
        @filter-title-change="handleTitleChange"
        @add-new="handleAddNewCompetence"
      />
      <div class="d-flex flex-wrap justify-content-center gap-4">
        <CompetenceCard
          v-for="skill in skillItems"
          :key="skill.id"
          :item="skill"
          style="flex: 1 1 calc(33.333% - 2rem); max-width: 400px"
          @open="openTaskDetails"
        />
      </div>
    </div>

    <TaskForm
      v-if="selectedTask"
      :task="selectedTask"
      :lookAsHR="true"
      :mainView="true"
      :isCreating="selectedTask.id === null"
      @close="selectedTask = null"
      @save="handleSaveTask"
      @delete="handleDeleteTask"
      :newTask="isNewTask"
    />
    <Footer />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'

import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import SearchBar from './components/SearchBar.vue'
import TeamList from './components/TeamList.vue'
import AddTeamForm from './components/AddTeamForm.vue'
import AddEmployeeForm from './components/AddEmployeeForm.vue'
import AddEmployeeToTeamForm from './components/AddEmployeeToTeamForm.vue'
import CompetenceFilters from './components/CompetenceFilters.vue'
import CompetenceCard from '../../components/CompetenceCard.vue'
import TaskForm from '../../components/TaskForm.vue'
import { useTasksStore } from '../../stores/tasks'
import { useUserStore } from '../../stores/user'
import { useApiStore } from '../../stores/api'

const tasksStore = useTasksStore()
const userStore = useUserStore()
const apiStore = useApiStore()
const tasks = ref([])
const tasksLoading = ref(false)
const teamListKey = ref(0) // Key to force TeamList refresh

const searchQuery = ref('')
const selectedEmployee = ref(null)
const selectedTeamId = ref(null)
const selectedTeamName = ref('')
const searchSuggestions = ref([])
const searchLoading = ref(false)
const employees = ref([])
const employeesLoading = ref(false)
const employeeTeamsCache = reactive({})
const selectedEmployeeTeams = ref([])
const isNewTask = ref(false)
let searchDebounceHandle = null
const visibleTeamIds = computed(() => {
  if (selectedTeamId.value) return [selectedTeamId.value]
  if (selectedEmployee.value && selectedEmployeeTeams.value.length > 0) {
    return selectedEmployeeTeams.value.map(team => team.id)
  }
  return []
})

function formatEmployeeName(employee) {
  if (!employee) return ''
  const first = (employee.firstname || '').trim()
  const last = (employee.lastname || '').trim()
  const fullName = `${first} ${last}`.trim()
  return fullName || employee.email || 'Unknown employee'
}

function formatTeamName(team) {
  if (!team) return ''
  return (
    (team.team_name || team.teamName || team.name || '').trim() ||
    `Team ${team.id}`
  )
}

async function loadEmployees() {
  employeesLoading.value = true
  try {
    const response = await apiStore.getEmployees()
    employees.value = response || []

    const currentId = selectedEmployee.value?.id
    if (currentId) {
      const refreshed = employees.value.find(emp => emp.id === currentId)
      if (refreshed) {
        selectedEmployee.value = refreshed
      } else {
        selectedEmployee.value = null
        selectedEmployeeTeams.value = []
      }
    }
  } catch (error) {
    console.error('Failed to load employees:', error)
  } finally {
    employeesLoading.value = false
  }
}

async function ensureEmployeeTeams(employeeId, { forceRefresh = false } = {}) {
  if (!employeeId) return []
  if (!employeeTeamsCache[employeeId] || forceRefresh) {
    try {
      const teams = await apiStore.getTeamsByEmployee(employeeId)
      employeeTeamsCache[employeeId] = (teams || []).map(team => ({
        id: team.id,
        name: team.name || team.team_name || team.teamName || team.id,
        description: team.description,
        role: team.role
      }))
    } catch (error) {
      console.error('Failed to load teams for employee:', error)
      employeeTeamsCache[employeeId] = []
    }
  }
  return employeeTeamsCache[employeeId]
}

function invalidateEmployeeTeams(employeeId) {
  if (employeeId && employeeTeamsCache[employeeId]) {
    delete employeeTeamsCache[employeeId]
  }
}

async function fetchSearchSuggestions(input) {
  const term = input?.trim()
  if (!term) {
    searchSuggestions.value = []
    return
  }

  searchLoading.value = true
  try {
    const response = await apiStore.search(term)
    const results = Array.isArray(response)
      ? response
      : Array.isArray(response?.results) ? response.results : []

    searchSuggestions.value = results.map(result => {
      if (result.type === 'team') {
        return {
          ...result,
          name: formatTeamName(result)
        }
      }
      return result
    })
  } catch (error) {
    console.error('Failed to search employees/teams:', error)
    searchSuggestions.value = []
  } finally {
    searchLoading.value = false
  }
}

async function handleSearchSelection(item) {
  if (!item) return
  if (item.type === 'team') {
    await handleTeamSelected(item)
  } else {
    await handleEmployeeSelected(item)
  }
}

async function handleEmployeeSelected(employee) {
  if (!employee) return
  selectedEmployee.value = employee
  selectedTeamId.value = null
  selectedTeamName.value = ''
  searchQuery.value = formatEmployeeName(employee)
  selectedEmployeeTeams.value = []
  selectedEmployeeTeams.value = await ensureEmployeeTeams(employee.id)
  searchSuggestions.value = []
}

async function handleTeamSelected(team) {
  if (!team) return
  selectedTeamId.value = team.id
  selectedTeamName.value = formatTeamName(team)
  selectedEmployee.value = null
  selectedEmployeeTeams.value = []
  searchQuery.value = selectedTeamName.value
  searchSuggestions.value = []
}

watch(searchQuery, (newQuery) => {
  const normalized = (newQuery || '').trim()

  if (searchDebounceHandle) {
    clearTimeout(searchDebounceHandle)
    searchDebounceHandle = null
  }

  if (!normalized) {
    selectedEmployee.value = null
    selectedEmployeeTeams.value = []
    selectedTeamId.value = null
    selectedTeamName.value = ''
    searchSuggestions.value = []
    return
  }

  if (
    selectedEmployee.value &&
    normalized !== formatEmployeeName(selectedEmployee.value)
  ) {
    selectedEmployee.value = null
    selectedEmployeeTeams.value = []
  }

  if (
    selectedTeamId.value &&
    normalized !== (selectedTeamName.value || '').trim()
  ) {
    selectedTeamId.value = null
    selectedTeamName.value = ''
  }

  const matchesCurrentSelection =
    (selectedEmployee.value && normalized === formatEmployeeName(selectedEmployee.value)) ||
    (selectedTeamId.value && normalized === (selectedTeamName.value || '').trim())

  if (matchesCurrentSelection) {
    searchSuggestions.value = []
    return
  }

  if (normalized.length < 2) {
    searchSuggestions.value = []
    return
  }

  searchDebounceHandle = setTimeout(() => {
    fetchSearchSuggestions(normalized)
  }, 300)
})

const currentSort = ref('')
const currentStatusFilters = ref([])
const currentLabelFilter = ref('')
const currentTitleFilter = ref('')

const skillItems = computed(() => {
  let items = [...tasks.value]

  if (selectedTeamId.value) {
    items = items.filter(task =>
      (task.teams || []).some(team => team.id === selectedTeamId.value)
    )
  } else if (selectedEmployee.value) {
    const employeeId = selectedEmployee.value.id
    const teamIds = selectedEmployeeTeams.value.map(team => team.id)

    items = items.filter((task) => {
      const assignedToEmployee = (task.members || []).some(member => member.id === employeeId)
      const assignedToTeam = (task.teams || []).some(team => teamIds.includes(team.id))
      return assignedToEmployee || assignedToTeam
    })
  }

  if (currentStatusFilters.value.length > 0) {
    items = items.filter((task) => {
      const p = task.progress || 0

      return currentStatusFilters.value.some((filter) => {
        switch (filter) {
          case 'not-started':
            return p === 0
          case '0-25':
            return p > 0 && p <= 25
          case '25-50':
            return p > 25 && p <= 50
          case '50-75':
            return p > 50 && p <= 75
          case '75-99':
            return p > 75 && p <= 99
          case 'in-progress':
            return p >= 1 && p <= 99
          case 'finished':
            return p === 100
          default:
            return false
        }
      })
    })
  }

  if (currentLabelFilter.value) {
    const query = currentLabelFilter.value.toLowerCase()
    items = items.filter(
      (task) => task.label && task.label.toLowerCase().includes(query)
    )
  }

  if (currentTitleFilter.value) {
    const query = currentTitleFilter.value.toLowerCase()
    items = items.filter(
      (task) => task.title && task.title.toLowerCase().includes(query)
    )
  }

  if (currentSort.value === 'progress-asc') {
    items.sort((a, b) => (a.progress || 0) - (b.progress || 0))
  } else if (currentSort.value === 'progress-desc') {
    items.sort((a, b) => (b.progress || 0) - (a.progress || 0))
  }

  return items
})

const selectedTask = ref(null)
const isMainView = ref(true)

function handleSortChange(sortValue) {
  currentSort.value = sortValue
}

function handleStatusChange(statuses) {
  currentStatusFilters.value = statuses
}

function handleLabelChange(label) {
  currentLabelFilter.value = label
}

function handleTitleChange(title) {
  currentTitleFilter.value = title
}

function openTaskDetails(task) {
  selectedTask.value = { ...task }
  isMainView.value = false
  isNewTask.value = false
}

function handleAddNewCompetence() {
  isNewTask.value = true
  selectedTask.value = {
    id: null,
    title: 'New Competence',
    content: 'This is a new competence description.',
    label: 'Default Label',
    progress: 0,
    start_date: null,
    end_date: null,
    files: [],
  }
  isMainView.value = true
}

async function handleSaveTask(updatedTask) {
  try {
    if (updatedTask.id) {
      await tasksStore.updateTask(updatedTask.id, updatedTask)
    } else {
      await tasksStore.createTask(updatedTask)
    }
    selectedTask.value = null
    // Reload all competences after saving
    await loadAllCompetences()
  } catch (error) {
    console.error('Failed to save task:', error)
    alert('Failed to save competence: ' + (error.message || 'Unknown error'))
  }
}

async function handleDeleteTask(taskId) {
  try {
    await tasksStore.deleteTask(taskId)
    selectedTask.value = null
    // Reload all competences after deletion
    await loadAllCompetences()
  } catch (error) {
    console.error('Failed to delete task:', error)
    alert('Failed to delete competence: ' + (error.message || 'Unknown error'))
  }
}

async function loadAllCompetences() {
  tasksLoading.value = true
  try {
    const response = await apiStore.getCompetences()
    tasks.value = response.map(comp => ({
      id: comp.id,
      title: comp.title,
      content: comp.description || '',
      label: comp.label || '',
      status: mapStatus(comp.status),
      progress: comp.progress || 0,  // Use backend-calculated progress
      start_date: comp.start_date,
      end_date: comp.end_date,
      files: [],
      members: comp.members || [],  // Include members from API
      teams: comp.teams || []        // Include teams from API
    }))
  } catch (error) {
    console.error('Failed to load competences:', error)
    // Fallback to tasks store if API fails
    tasks.value = tasksStore.tasks
  } finally {
    tasksLoading.value = false
  }
}

function mapStatus(backendStatus) {
  const statusMap = {
    'todo': 'to do',
    'in-progress': 'in progress',
    'in_progress': 'in progress',
    'done': 'finished',
    'finished': 'finished'
  }
  return statusMap[backendStatus] || backendStatus || 'to do'
}

function calculateProgress(status) {
  const progressMap = {
    'todo': 0,
    'in-progress': 50,
    'in_progress': 50,
    'done': 100,
    'finished': 100
  }
  return progressMap[status] || 0
}

function handleTeamCreated(team) {
  // Force TeamList to refresh
  teamListKey.value++
}

async function handleEmployeeCreated() {
  await loadEmployees()
}

async function handleMemberAdded(data) {
  // Force TeamList to refresh
  teamListKey.value++

  const employeeId = data?.employee?.id
  if (!employeeId) return

  invalidateEmployeeTeams(employeeId)

  if (selectedEmployee.value?.id === employeeId) {
    selectedEmployeeTeams.value = await ensureEmployeeTeams(employeeId, { forceRefresh: true })
  }
}

onMounted(() => {
  loadAllCompetences()
  loadEmployees()
  userStore.initialize()
})
</script>

<style scoped>
.dashboard-wrapper {
  display: flex;
  flex-direction: column;
  background: radial-gradient(
      circle at 70% 15%,
      rgba(0, 180, 255, 0.6),
      transparent 60%
    ),
    radial-gradient(circle at 30% 65%, rgba(255, 0, 120, 5.5), transparent 60%),
    #000;
}
</style>