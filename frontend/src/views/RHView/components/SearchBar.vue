<template>
  <div class="shadow-sm position-relative">
    <input
      ref="inputRef"
      type="text"
      placeholder="Type employee/team name"
      class="form-control form-control-lg rounded-pill"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />

    <div
      v-if="loading"
      class="position-absolute end-0 top-50 translate-middle-y me-3 text-muted"
    >
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    </div>

    <ul
      v-if="!loading && suggestions.length > 0"
      class="list-group position-absolute mt-1 bg-light shadow search-suggestions"
      style="z-index: 1000"
    >
      <li
        v-for="item in suggestions"
        :key="item.id"
        class="list-group-item list-group-item-action"
        style="cursor: pointer"
        @mousedown.prevent
        @click="selectItem(item)"
      >
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div class="d-flex flex-column">
            <span class="fw-semibold">{{ formatName(item) }}</span>
            <small v-if="formatSubtitle(item)" class="text-muted">{{ formatSubtitle(item) }}</small>
          </div>
          <span class="badge text-bg-secondary">{{ formatTypeLabel(item) }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  modelValue: String,
  suggestions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'item-selected'])
const inputRef = ref(null)

function selectItem(item) {
  emit('update:modelValue', formatName(item))
  emit('item-selected', item)
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function formatName(item) {
  if (item?.type === 'team') {
    const teamName = (item.team_name || item.teamName || item.name || '').trim()
    return teamName || `Team ${item?.id || ''}`.trim()
  }
  const first = (item.firstname || '').trim()
  const last = (item.lastname || '').trim()
  const fallback = (item.name || '').trim()
  const combined = `${first} ${last}`.trim()
  return combined || fallback || item.email || 'Unknown'
}

function formatSubtitle(item) {
  if (item?.type === 'team') {
    return (item.description || '').trim()
  }
  const parts = []
  if (item.email) parts.push(item.email)
  const teams = Array.isArray(item.teams) ? item.teams.filter(Boolean) : []
  if (teams.length) parts.push(`Teams: ${teams.join(', ')}`)
  return parts.join(' • ')
}

function formatTypeLabel(item) {
  if (item?.type === 'team') return 'Team'
  return 'Employee'
}
</script>

<style scoped>


/* Targets the <li> items in dark mode.
  This is the part that was missing.
*/
:global([data-bs-theme='dark'] .search-suggestions .list-group-item-action) {
  background-color: #424242 !important;
  color: var(--bs-light-color) !important; /* Makes text light */
  border-bottom-color: #2a2a2a !important; /* Adds a subtle separator */
}

/* Adds a hover effect for dark mode
*/
:global([data-bs-theme='dark'] .search-suggestions .list-group-item-action:hover) {
  background-color: #2a2a2a !important; /* A slightly lighter dark color */
}
</style>