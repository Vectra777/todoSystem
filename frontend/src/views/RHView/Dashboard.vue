<template>
  <Header />
  <div>
    <div class="dashboard-wrapper py-5">
      <div class="container">
        <SearchBar />
        <TeamList class="my-4" />
        <AddTeamForm class="my-4" />
        <AddEmployeeForm class="my-4" />
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
      />
      <div class="d-flex flex-wrap justify-content-center gap-4">
        <CompetenceCard
          v-for="(skill, i) in skillItems"
          :key="skill.id"
          :item="skill"
          style="flex: 1 1 calc(33.333% - 2rem); max-width: 400px"
          @open="openTaskDetails"
        />
      </div>
    </div>
  </div>

  <TaskForm
    v-if="selectedTask"
    :task="selectedTask"
    :readonly="!userStore.isAdmin"
    @close="selectedTask = null"
    @save="handleSaveTask"
  />
  <Footer />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import SearchBar from './components/SearchBar.vue'
import TeamList from './components/TeamList.vue'
import AddTeamForm from './components/AddTeamForm.vue'
import AddEmployeeForm from './components/AddEmployeeForm.vue'
import CompetenceFilters from './components/CompetenceFilters.vue'
import CompetenceCard from '../../components/CompetenceCard.vue'
import TaskForm from '../../components/TaskForm.vue'
import { useTasksStore } from '../../stores/tasks'
import { useUserStore } from '../../stores/user'

const tasksStore = useTasksStore()
const userStore = useUserStore()
const { tasks } = storeToRefs(tasksStore)

const currentSort = ref('')
const currentStatusFilters = ref([])
const currentLabelFilter = ref('')
const currentTitleFilter = ref('')

const skillItems = computed(() => {
  let items = [...tasks.value]

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
}

async function handleSaveTask(updatedTask) {
  try {
    await tasksStore.updateTask(updatedTask.id, updatedTask)
    selectedTask.value = null
  } catch (error) {
    console.error('Failed to save task:', error)
  }
}

onMounted(() => {
  tasksStore.initialize()
  userStore.initialize()
})
</script>

<style scoped>
.dashboard-wrapper {
  min-height: 100vh;
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