<template>
  <div class="competence-card-wrapper">
    <div class="rounded-4 p-4 text-center shadow-sm competence-card grabbable border card" draggable="true" @dragstart="onDragStart">
  <h3 class="fw-bold fs-6">{{ itemObj.title }}</h3>
  <p class="mb-2 small text-muted">{{ itemObj.content }}</p>

      <div class="small text-muted mb-2">
        <div v-if="formattedStart">📅 Start: {{ formattedStart }}</div>
        <div v-if="formattedEnd">⏳ End: {{ formattedEnd }}</div>
      </div>

      <div class="my-3" v-if="userStore.isAdmin">
        <div class="progress-circle position-relative d-inline-block my-3" style="width: 80px; height: 80px;">
          <svg viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="50" r="45" stroke="#e6e6e6" stroke-width="6" fill="none" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              :stroke="progressColor"
              stroke-width="6"
              stroke-linecap="round"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="dashOffset"
              transform="rotate(90 50 50)"
              style="transition: stroke-dashoffset 0.6s ease, stroke 0.4s ease;"
            />
          </svg>
            <div class="position-absolute top-50 start-50 translate-middle fw-bold">{{ itemObj.progress || 0 }}%</div>
        </div>
      </div>

  <div class="mb-2"><span class="badge bg-secondary">{{ itemObj.label }}</span></div>
  <button class="btn btn-info text-white w-100 rounded-pill" @click.stop="openDetails">Voir</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

userStore.initialize()



const emit = defineEmits(['open'])

const props = defineProps({
  item: { type: Object, required: true }
})

function formatDate(val) {
  if (!val) return null
  if (typeof val === 'string') {
    const m = val.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (m) return `${m[3]}/${m[2]}/${m[1]}`
  }
  const d = new Date(val)
  if (isNaN(d)) return null
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const year = d.getUTCFullYear()
  return `${day}/${month}/${year}`
}

const itemObj = computed(() => ({
  id: props.item?.id ?? null,
  title: props.item?.title ?? 'Untitled',
  content: props.item?.content ?? '',
  progress: props.item?.progress ?? 0,
  label: props.item?.label ?? '',
  start_date: props.item?.start_date ?? null,
  end_date: props.item?.end_date ?? null
}))

const formattedStart = computed(() => formatDate(itemObj.value.start_date))
const formattedEnd = computed(() => formatDate(itemObj.value.end_date))

const radius = 45
const circumference = 2 * Math.PI * radius

const dashOffset = computed(() => circumference * (1 - ((itemObj.value.progress || 0) / 100)))

const progressColor = computed(() => {
  const p = itemObj.value.progress || 0
  if (p < 25) return 'red'
  if (p < 50) return 'orange'
  if (p < 75) return 'gold'
  return 'green'
})

function onDragStart(e) {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', String(props.item?.id))
}

function openDetails() {
  emit('open', { ...itemObj.value })
}
</script>

<style scoped>
.competence-card-wrapper {
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
}

.grabbable {
  cursor: grab;
}
.grabbable:active {
  cursor: grabbing;
}
</style>

