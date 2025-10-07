<template>
  <div class="row">
    <div
      class="col kanban-column"
      v-for="status in statuses"
      :key="status"
      :class="{ 'drop-over': overStatus === status }"
      @dragover.prevent
      @dragenter.prevent="onDragEnter(status)"
      @dragleave="onDragLeave(status)"
      @drop="onDrop(status, $event)"
    >
      <h4 class="text-center text-capitalize">{{ status }}</h4>
      <div v-for="task in tasksByStatus(status)" :key="task.id">
        <TaskCard :task="task" @edit="() => $emit('edit-task', task)" @delete="t => $emit('delete-task', t)" />
      </div>
    </div >
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TaskCard from './TaskCard.vue'
const props = defineProps({ tasks: Array })
const emit = defineEmits(['edit-task', 'delete-task', 'move-task'])
const statuses = ['to do', 'doing', 'finished', 'validated']

const overStatus = ref(null)

function tasksByStatus(status) {
  return props.tasks.filter((t) => t.status === status)
}

function onDragEnter(status) {
  overStatus.value = status
}
function onDragLeave(status) {
  if (overStatus.value === status) overStatus.value = null
}
function onDrop(targetStatus, e) {
  const idText = e.dataTransfer.getData('text/plain')
  if (!idText) return
  overStatus.value = null
  emit('move-task', { id: idText, toStatus: targetStatus })
}
</script>

<style scoped>
.kanban-column {
  /* Make each status drop zone much taller */
  min-height: 70vh;
  padding-bottom: 3rem;
  padding-top: .5rem;
  transition: background-color 0.15s ease-in-out, outline-color 0.15s;
}
.drop-over {
  outline: 2px dashed var(--bs-primary);
  outline-offset: -6px;
  background-color: color-mix(in oklab, var(--bs-primary) 8%, transparent);
}
</style>
