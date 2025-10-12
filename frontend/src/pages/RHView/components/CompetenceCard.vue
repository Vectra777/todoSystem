<template>
  <div class="col-md-4">
    <div class="bg-light rounded-4 p-4 text-center shadow-sm">
      <h3 class="fw-bold fs-6">Competence title</h3>
      <p>Description of the competence</p>

      <div class="my-3">
       
    <div class="progress-circle position-relative d-inline-block my-3" style="width: 80px; height: 80px;">
          <svg viewBox="0 0 100 100" width="80" height="80">
          <span class="fw-bold fs-5">90%</span>
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
          style="transition: stroke-dashoffset 0.6s ease, stroke 0.4s ease;"
        />
      </svg>
      <div class="position-absolute top-50 start-50 translate-middle fw-bold">
        {{ progress }}%
      </div>
        </div>
      </div>

      <button class="btn btn-info text-white w-100 rounded-pill">Voir</button>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'

const props = defineProps({
  progress: {
    type: Number,
    default: 0, 
  },
})

const radius = 45
const circumference = 2 * Math.PI * radius

const dashOffset = computed(() => circumference * (1 - props.progress / 100))

const progressColor = computed(() => {
  if (props.progress < 25) return 'red'
  if (props.progress < 50) return 'orange'
  if (props.progress < 75) return 'gold'
  return 'green'
})
</script>

