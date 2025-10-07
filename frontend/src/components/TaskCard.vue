<template>
  <div class="card mb-1 grabbable" draggable="true" @dragstart="onDragStart">
    <div class="card-header d-flex justify-content-between align-items-center">
      <strong>{{ task.title }}</strong>
      <span class="badge bg-secondary text-uppercase">{{ task.label }}</span>
    </div>
    <div class="card-body">
      <p class="card-text">{{ task.content }}</p>

      <div class="small text-muted">
        <div v-if="task.start_date">📅 Beginning : {{ formatDate(task.start_date) }}</div>
        <div v-if="task.end_date">⏳ End : {{ formatDate(task.end_date) }}</div>
      </div>
    </div>
    <div class="card-footer text-end">
      <div class="d-flex justify-content-between">
  <button class="btn btn-sm btn-outline-danger" @click="$emit('delete', task)">
          🗑️ Remove
        </button>
        <button class="btn btn-sm btn-outline-primary" @click="$emit('edit')">
          ✏️ Modify
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

function formatDate(val) {
  if (!val) return '-'
  if (typeof val === 'string') {
    const m = val.match(/^(\d{4}-\d{2}-\d{2})/)
    if (m) return ymdToDmy(m[1])
  }
  const d = new Date(val)
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const year = d.getUTCFullYear()
  return `${day}/${month}/${year}`
}

function ymdToDmy(ymd) {
  const [y, m, d] = ymd.split('-')
  return `${d}/${m}/${y}`
}

function onDragStart(e) {
  // Mark this drag as a move and pass the task id
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', String(props.task.id))
}
</script>

<style scoped>
.grabbable {
  cursor: grab;
}
.grabbable:active {
  cursor: grabbing;
}
</style>
