<template>
  <div>
    <Header />
    <div class="dashboard-wrapper py-5">
      <div class="container">
        <SearchBar
          v-model="searchQuery"
          :suggestions="filteredSuggestions"
          @item-selected="handleEmployeeSelected"
        />
        <TeamList
          class="my-4"
          :selected-employee="selectedEmployee"
          :all-employees="fakeEmployees"
          :all-competences="tasks"
        />

        <template v-if="!selectedEmployee">
          <AddTeamForm class="my-4" />
          <AddEmployeeForm class="my-4" />
          <AddEmployeeToTeamForm class="my-4" />
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
    />
    <Footer />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

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

const searchQuery = ref('')
const selectedEmployee = ref(null)

const fakeEmployees = [
  { id: 1, name: 'Alice Johnson', teams: ['Devops', 'QA'] },
  { id: 2, name: 'Bob Smith', teams: ['Marketing'] },
  { id: 3, name: 'Charlie Brown', teams: ['Design'] },
  { id: 4, name: 'David Lee', teams: ['Devops'] },
  { id: 5, name: 'Emily White', teams: ['QA'] },
  { id: 6, name: 'Alex Dubois', teams: ['Support'] },
  { id: 7, name: 'Alexandra Martin', teams: ['Marketing'] },
  { id: 8, name: 'Mohammed Benali', teams: ['Support'] },
  { id: 9, name: 'Sophie Tremblay', teams: ['Design', 'Marketing'] },
  { id: 10, name: 'Wei Zhang', teams: ['Devops'] },
  { id: 11, name: 'Carlos Gomez', teams: ['QA'] },
  { id: 12, name: 'Fatima Al-Fassi', teams: ['Support'] },
  { id: 13, name: "James O'Malley", teams: ['Support'] },
  { id: 14, name: 'Priya Patel', teams: ['Devops'] },
  { id: 15, name: 'Léa Fournier', teams: ['Design'] },
  { id: 16, name: 'Kenji Watanabe', teams: ['QA'] },
  { id: 17, name: 'Olivia Kim', teams: ['Marketing'] },
  { id: 18, name: 'William Rousseau', teams: ['Devops', 'Support'] },
  { id: 19, name: 'Isabella Rossi', teams: ['Design'] },
  { id: 20, name: 'Malik Diawara', teams: ['Devops'] },
  { id: 21, name: 'Nadia Ivanova', teams: ['QA'] },
  { id: 22, name: 'Ethan Hunt', teams: ['Marketing', 'Support'] },
  { id: 23, name: 'Chloé Gagnon', teams: ['Design'] },
  { id: 24, name: 'Samuel Chen', teams: ['Design'] },
  { id: 25, name: 'Aarav Sharma', teams: ['Devops'] },
  { id: 26, name: 'Mia St-Pierre', teams: ['Support'] },
  { id: 27, name: 'Benjamin Cohen', teams: ['Marketing'] },
  { id: 28, name: 'Sofia Rodriguez', teams: ['QA'] },
  { id: 29, name: 'Liam Murphy', teams: ['Devops'] },
  { id: 30, name: 'Emma Leblanc', teams: ['Design', 'QA'] },
  { id: 31, name: 'Lucas Silva', teams: ['Support'] },
  { id: 32, name: 'Hannah Schmidt', teams: ['Marketing'] },
  { id: 33, name: 'Antoine Lavigne', teams: ['Devops'] },
  { id: 34, name: 'Zoé Martin', teams: ['QA'] },
  { id: 35, name: 'Daniel Kim', teams: ['Design'] },
  { id: 36, name: 'Gabriel Roy', teams: ['Support', 'Devops'] },
  { id: 37, name: 'Jasmine Kaur', teams: ['Support'] },
  { id: 38, name: 'Thomas Girard', teams: ['Marketing'] },
  { id: 39, name: 'Yuki Tanaka', teams: ['QA'] },
  { id: 40, name: 'Ryan Ibrahim', teams: ['Design'] },
  { id: 41, name: 'Sara Bouchard', teams: ['Devops'] },
  { id: 42, name: 'Elijah Brown', teams: ['Support'] },
  { id: 43, name: 'Camila Fernandez', teams: ['Marketing'] },
  { id: 44, name: 'Nathan Pelletier', teams: ['QA', 'Devops'] },
  { id: 45, name: 'Maya Singh', teams: ['Design'] },
  { id: 46, name: 'Leo Virtanen', teams: ['Devops'] },
  { id: 47, name: 'Clara Moreau', teams: ['Support'] },
  { id: 48, name: 'Oumar Diallo', teams: ['Marketing'] },
  { id: 49, name: 'Felix Schneider', teams: ['QA'] },
  { id: 50, name: 'Juliette Lavoie', teams: ['Design', 'Marketing'] },
]

const filteredSuggestions = computed(() => {
  if (
    !searchQuery.value ||
    (selectedEmployee.value &&
      searchQuery.value === selectedEmployee.value.name)
  ) {
    return []
  }

  const query = searchQuery.value.toLowerCase()
  return fakeEmployees
    .filter((emp) => emp.name.toLowerCase().includes(query))
    .slice(0, 20)
})

function handleEmployeeSelected(employee) {
  selectedEmployee.value = employee
  searchQuery.value = employee.name
}

watch(searchQuery, (newQuery) => {
  if (!newQuery) {
    selectedEmployee.value = null
  } else if (
    selectedEmployee.value &&
    newQuery !== selectedEmployee.value.name
  ) {
    selectedEmployee.value = null
  }
})

const currentSort = ref('')
const currentStatusFilters = ref([])
const currentLabelFilter = ref('')
const currentTitleFilter = ref('')

const skillItems = computed(() => {
  let items = [...tasks.value]

  if (selectedEmployee.value) {
    const employeeTeams = selectedEmployee.value.teams 
    items = items.filter((task) => employeeTeams.includes(task.label))
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
}

function handleAddNewCompetence() {
  selectedTask.value = {
    id: null,
    title: 'New Competence',
    content: '',
    label: '',
    status: 'to do',
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
      progress: calculateProgress(comp.status),
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

onMounted(() => {
  loadAllCompetences()
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