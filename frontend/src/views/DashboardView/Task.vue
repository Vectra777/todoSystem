<template>

  <div class="container-fluid home-page" :style="loginWrapperStyle" >
    <h2 class="text-center mb-4">🗂️ Todo Multi-views</h2>
    

  <div class="d-flex justify-content-between align-items-center mb-3 row">
      <Filters
        :selectedStatus="filters.status"
        :selectedLabel="filters.label"
        :selectedTitle="filters.title"
        @update:status="filters.status = $event"
        @update:label="filters.label = $event"
        @update:title="filters.title = $event"
        class="col-8"
      />
      <div class="ms-1 mt-3 col-4">
        <button class="btn btn-outline-primary me-2" @click="view = 'kanban'">Kanban</button>
        <button class="btn btn-outline-secondary" @click="view = 'list'">List</button>
        <button class="btn btn-outline-info ms-2" @click="view='calendar'">Calendar</button>
      </div>
    </div>
    <component
      :is="currentViewComponent"
      :tasks="filteredTasks"
      @move-task="handleMoveTask"
      @open-task="handleOpenTask"
    />
    <TaskForm
      v-if="selectedTask"
      :task="selectedTask"
      :lookAsHR="false"
      :mainView="false"
      @close="selectedTask = null"
      @save="handleSaveTask"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import KanbanView from '../../components/KanbanView.vue'
import ListView from '../../components/ListView.vue'
import CalendarView from '../../components/CalendarView.vue'
import Filters from '../../components/Filters.vue'
import TaskForm from '../../components/TaskForm.vue'
import { useTasksStore } from '../../stores/tasks'
import { useUserStore } from '../../stores/user'

const view = ref('kanban')

const filters = ref({
  status: '',
  label: '',
  title: ''
})

const tasksStore = useTasksStore()
const { tasks } = storeToRefs(tasksStore)
const userStore = useUserStore()

const selectedTask = ref(null)

const currentViewComponent = computed(() => {
  return view.value === 'kanban'
    ? KanbanView
    : view.value === 'list'
    ? ListView
    : CalendarView;
});

const filteredTasks = computed(() => {
  return tasks.value.filter((task) => {
    const matchesStatus = !filters.value.status || task.status === filters.value.status
    const matchesLabel =
      !filters.value.label ||
      (task.label && task.label.toLowerCase().includes(filters.value.label.toLowerCase()))
    const matchesTitle =
      !filters.value.title ||
      (task.title && task.title.toLowerCase().includes(filters.value.title.toLowerCase()))
    return matchesStatus && matchesLabel && matchesTitle
  })
})

const loginWrapperStyle = computed(() => {
    return {
      backgroundImage: "url('../assets/pexels-gdtography-277628-950241.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  });

async function handleMoveTask({ id, toStatus }) {
  const snapshotSource = tasks.value.find((task) => String(task.id) === String(id))
  const snapshot = snapshotSource ? { ...snapshotSource } : null

  try {
    await tasksStore.moveTask({ id, toStatus })
  } catch (err) {
    if (snapshot) {
      tasksStore.restoreTask(id, snapshot)
    }
    alert('Failed to move task: ' + (err?.message || err))
  }
}

onMounted(() => {
  // Always refresh tasks on mount so simple employees see latest data
  tasksStore.refresh()
  userStore.initialize()
})

function handleOpenTask(task) {
  selectedTask.value = { ...task }
}

async function handleSaveTask(updated) {
  try {
    await tasksStore.updateTask(updated.id, updated)
    selectedTask.value = null
  } catch (e) {
    alert('Failed to save: ' + (e?.message || e))
  }
}
</script>

<style>
.home-page {
  flex-grow: 1; 
  padding: 20px;

}
</style>

