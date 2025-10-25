<template>
  <form @submit.prevent="handleSave" :class="'position-fixed top-0 end-0 border-start p-4 bg-body-tertiary shadow'" style="width: 380px; height: 100vh; z-index: 200000;">
    <h5 class="d-flex align-items-center justify-content-between">
      <span>{{ readonly ? 'View' : (task?.id ? 'Modify' : 'New') }} task</span>
      <button type="button" class="btn-close" aria-label="Close" @click="$emit('close')"></button>
    </h5>

    <div class="mb-3">
      <label class="form-label">Title</label>
      <input v-model="localTask.title" class="form-control" :disabled="readonly" required />
    </div>

    <div class="mb-3">
      <label class="form-label">Content</label>
      <textarea v-model="localTask.content" class="form-control" :disabled="readonly" required></textarea>
    </div>

    <div class="mb-3">
      <label class="form-label">Label</label>
      <input v-model="localTask.label" class="form-control" :disabled="readonly" required />
    </div>

    <div class="mb-3">
      <label class="form-label">Status</label>
      <select v-model="localTask.status" class="form-select" :disabled="readonly" required>
        <option value="">Select status</option>
        <option>to do</option>
        <option>doing</option>
        <option>finished</option>
        <option>validated</option>
      </select>
    </div>

    <div class="mb-3">
      <label class="form-label">Start Date</label>
      <input type="date" v-model="localTask.start_date" class="form-control" :disabled="readonly" optional/>
    </div>

    <div class="mb-3">
      <label class="form-label">End Date</label>
      <input type="date" v-model="localTask.end_date" class="form-control" :disabled="readonly" optional/>
    </div>

    <div class="d-flex justify-content-between">
      <button class="btn btn-success" type="submit" :disabled="readonly || !isFormValid">Save</button>
      <button class="btn btn-secondary" type="button" @click="$emit('close')">Close</button>
    </div>
  </form>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
const props = defineProps({ task: Object, readonly: { type: Boolean, default: false } })
const emit = defineEmits(['save', 'close'])

const localTask = reactive({ ...normalizeTask(props.task) })

const isFormValid = computed(() => {
  return (
    localTask.title &&
    localTask.content &&
    localTask.label &&
    localTask.status
  )
})

function handleSave() {
  if (!props.readonly && isFormValid.value) {
    console.log('Saving task:', localTask)
    emit('save', localTask)
  }
}

watch(() => props.task, (newTask) => {
  Object.assign(localTask, normalizeTask(newTask))
})

function normalizeTask(t) {
  const copy = { ...t }
  if (copy.start_date) copy.start_date = normalizeDateForInput(copy.start_date)
  if (copy.end_date) copy.end_date = normalizeDateForInput(copy.end_date)
  return copy
}

function normalizeDateForInput(val) {
  if (!val) return ''
  if (typeof val === 'string') {
    const m = val.match(/^(\d{4}-\d{2}-\d{2})/)
    if (m) return m[1]
  }
  const d = new Date(val)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
</script>
