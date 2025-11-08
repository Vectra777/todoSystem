<template>
  <div class="row g-3 g-lg-4">
    <div
      class="col-12 col-md-6 col-lg-3 kanban-column"
      v-for="status in statuses"
      :key="status"
      :class="{ 'drop-over': overStatus === status }"
      @dragover.prevent
      @dragenter.prevent="onDragEnter(status)"
      @dragleave="onDragLeave(status)"
      @drop="onDrop(status, $event)"
    >
      <h4 class="text-center text-capitalize mb-3">{{ status + ' (' + counter[status] + ')' }}</h4>
      <div v-for="task in tasksByStatus(status)" :key="task.id">
        <CompetenceCard :item="task" @open="$emit('open-task', task)" />
      </div>
    </div >
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import CompetenceCard from './CompetenceCard.vue'
const props = defineProps({ tasks: Array })
const emit = defineEmits(['edit-task', 'delete-task', 'move-task', 'open-task'])
const statuses = ['to do', 'in progress', 'finished', 'validated']

const overStatus = ref(null)

const counter = computed(() => {
  const counter = { 'to do': 0, 'in progress': 0, 'finished': 0, 'validated': 0 }
  props.tasks.map((task) => {
    counter[task.status]++
  })
  return counter
})

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

/* Adjust card density only at breakpoint boundaries (no continuous resizing) */
@media (max-width: 575.98px) {
  /* xs: single column – keep cards roomy */
  .kanban-column .competence-card { padding: 1.25rem !important; }
}

@media (min-width: 768px) and (max-width: 991.98px) {
  /* md: two columns – slightly tighter cards */
  .kanban-column .competence-card { padding: 1rem !important; }
}

@media (min-width: 1200px) {
  /* xl+: four columns plenty of space – restore padding */
  .kanban-column .competence-card { padding: 1.25rem !important; }
}
</style>
