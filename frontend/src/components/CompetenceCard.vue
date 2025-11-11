<template>
  <div class="competence-card-wrapper">
    <div
      class="rounded-4 p-4 text-center shadow-sm competence-card grabbable border container d-flex flex-column"
      draggable="true"
      @dragstart="onDragStart"
    >
      <div class="flex-grow-1 d-flex flex-column justify-content-between">
        <div>
          <h3 class="fw-bold fs-6">{{ itemObj.title }}</h3>

          <div
            class="mb-2 small text-muted markdown-content"
            v-html="renderedContentHtml"
          ></div>

          <div class="small text-muted mb-3">
            <div v-if="formattedStart">📅 Start: {{ formattedStart }}</div>
            <div v-if="formattedEnd">⏳ End: {{ formattedEnd }}</div>
          </div>
        </div>

  <div v-if="showProgress" class="mb-3">
          <div
            class="progress-circle position-relative d-inline-block"
            style="width: 80px; height: 80px"
          >
            <svg viewBox="0 0 100 100" width="80" height="80">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#e6e6e6"
                stroke-width="6"
                fill="none"
              />
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
                style="
                  transition: stroke-dashoffset 0.6s ease, stroke 0.4s ease;
                "
              />
            </svg>
            <div
              class="position-absolute top-50 start-50 translate-middle fw-bold"
            >
              {{ itemObj.progress || 0 }}%
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="mb-2">
          <span class="badge bg-secondary">{{ itemObj.label }}</span>
        </div>
        <button
          class="btn btn-info text-white w-100 rounded-pill"
          @click.stop="openDetails"
        >
          Voir
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()

const userStore = useUserStore()
userStore.initialize()

const route = useRoute()

const emit = defineEmits(['open'])
const props = defineProps({
  item: { type: Object, required: true },
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
  end_date: props.item?.end_date ?? null,
  status: props.item?.status ?? 'to do',
  files: props.item?.files ?? [],
  members: props.item?.members ?? [],
  teams: props.item?.teams ?? [],
  commentEmployee: props.item?.commentEmployee ?? '',
  commentHR: props.item?.commentHR ?? '',
}))
const formattedStart = computed(() => formatDate(itemObj.value.start_date))
const formattedEnd = computed(() => formatDate(itemObj.value.end_date))

const renderedContentHtml = computed(() => {
  const content = itemObj.value.content
  return content ? md.render(content) : ''
})

const radius = 45
const circumference = 2 * Math.PI * radius
const dashOffset = computed(
  () => circumference * (1 - (itemObj.value.progress || 0) / 100)
)
const progressColor = computed(() => {
  const p = itemObj.value.progress || 0
  if (p < 25) return 'red'
  if (p < 50) return 'orange'
  if (p < 75) return 'gold'
  return 'green'
})

const isHRRoute = computed(() => route.matched?.some(r => r.meta && r.meta.requiresHR))
const showProgress = computed(() => {
  const result = userStore.isHr && isHRRoute.value
    // Debug logs removed in cleanup
  return result
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
  align-items: stretch;
}
.grabbable {
  cursor: grab;
}
.grabbable:active {
  cursor: grabbing;
}

.markdown-content {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  /* Standard property for newer browsers */
  line-clamp: 3;
  -webkit-box-orient: vertical;
  text-align: left;
}

.markdown-content :deep(*) {
  font-size: 0.875em;
  color: inherit;
}
.markdown-content :deep(p) {
  margin-bottom: 0;
}
.markdown-content :deep(strong) {
  font-weight: 700;
}
.markdown-content :deep(em) {
  font-style: italic;
}
</style>