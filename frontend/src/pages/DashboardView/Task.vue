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
     <button class="btn btn-success mb-3" @click="openEditor()">
  + New task
</button>

    <teleport to="body">
      <transition name="slide-panel" appear>
        <TaskForm
          v-if="editingTask"
          :task="editingTask"
          @save="saveTask"
          @close="editingTask = null"
        />
      </transition>
    </teleport>
    

    <component
      :is="currentViewComponent"
      :tasks="filteredTasks"
      @edit-task="openEditor"
      @move-task="moveTask"
      @delete-task="deleteTask"
    />
   


  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import KanbanView from '../../components/KanbanView.vue'
import ListView from '../../components/ListView.vue'
import CalendarView from '../../components/CalendarView.vue'
import TaskForm from '../../components/TaskForm.vue'
import Filters from '../../components/Filters.vue'

const view = ref('kanban')

const tasks = ref([])

const editingTask = ref(null)

const filters = ref({
  status: '',
  label: '',
  title: ''
})



function openEditor(task = null) {
  // Toggle behavior
  if (task) {
    if (editingTask.value && editingTask.value.id === task.id) {
      editingTask.value = null
    } else {
      editingTask.value = { ...task }
    }
  } else {
    if (editingTask.value && !editingTask.value.id) {
      editingTask.value = null
    } else {
      editingTask.value = { title: '', content: '', label: '', status: 'to do' }
    }
  }
}

async function deleteTask(task) {
  try {
    await deleteTodo(task.id);
  } catch (err) {
    alert('Failed to delete task: ' + err.message);
    return;
  }
  console.log('Deleting task', task);
  const index = tasks.value.findIndex((t) => t.id === task.id);
  if (index !== -1) {
    tasks.value.splice(index, 1);
  }


}

async function saveTask(updatedTask) {
  if (updatedTask.id) {
    try {
      const updated = await updateTodo(updatedTask.id, updatedTask);
      const index = tasks.value.findIndex((t) => t.id === updatedTask.id)
      tasks.value[index] = { ...updated };
    } catch (err) {
      alert('Failed to update task: ' + err.message);
    }
  } else {
    try {
      const newTask = await createTodo(updatedTask);
      tasks.value.push(newTask);
    } catch (err) {
      alert('Failed to save task: ' + err.message);
    }
  }
  editingTask.value = null
}

async function moveTask({ id, toStatus }) {
  const t = tasks.value.find(t => String(t.id) === String(id))
  if (!t) return

  const prev = { ...t }
  t.status = toStatus

  try {
    await updateTodo(t.id, t)
  } catch (err) {
    // Revert on error
    Object.assign(t, prev)
    alert('Failed to move task: ' + err.message)
  }
}

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

// Listen for changes to data-bs-theme
let observer;
// Placeholder local-storage backed API functions to avoid external API calls
const STORAGE_KEY = 'todo-local-tasks';

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read tasks from storage', e);
    return [];
  }
}

function writeStored(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to write tasks to storage', e);
  }
}

async function getTodos() {
  // simulate async network call
  return new Promise((resolve) => {
    setTimeout(() => resolve(readStored()), 100);
  });
}

async function createTodo(task) {
  const list = readStored();
  // simple id generation
  const id = list.length ? Math.max(...list.map(t => Number(t.id) || 0)) + 1 : 1;
  const newTask = { ...task, id };
  list.push(newTask);
  writeStored(list);
  return new Promise((resolve) => setTimeout(() => resolve(newTask), 50));
}

async function updateTodo(id, updated) {
  const list = readStored();
  const idx = list.findIndex(t => String(t.id) === String(id));
  if (idx === -1) throw new Error('Task not found');
  list[idx] = { ...list[idx], ...updated };
  writeStored(list);
  return new Promise((resolve) => setTimeout(() => resolve(list[idx]), 50));
}

async function deleteTodo(id) {
  let list = readStored();
  list = list.filter(t => String(t.id) !== String(id));
  writeStored(list);
  return new Promise((resolve) => setTimeout(() => resolve(true), 50));
}

onMounted(async () => {
  // Load tasks from local placeholder API
  try {
    tasks.value = await getTodos();
  } catch (err) {
    alert('Failed to load tasks: ' + err.message);
  }
});
onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});
</script>

<style>
.home-page {
  height: 100vh;

  justify-content: center;
  align-items: center;
  padding: 20px;
}

</style>
