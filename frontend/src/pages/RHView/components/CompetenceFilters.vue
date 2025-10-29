<template>
  <div class="d-flex flex-wrap justify-content-center gap-2">
    <div class="dropdown">
      <button
        class="btn btn-outline-secondary dropdown-toggle"
        type="button"
        id="statusFilterDropdown"
        data-bs-toggle="dropdown"
        data-bs-auto-close="outside"
        aria-expanded="false"
      >
        Filtrer par statut
      </button>
      <div
        class="dropdown-menu p-3"
        aria-labelledby="statusFilterDropdown"
        @click.stop
      >
        <div
          v-for="option in statusOptions"
          :key="option.value"
          class="form-check"
        >
          <input
            class="form-check-input"
            type="checkbox"
            :value="option.value"
            :id="'status-' + option.value"
            v-model="selectedStatuses"
            @change="emitStatusChange"
          />
          <label class="form-check-label" :for="'status-' + option.value">
            {{ option.label }}
          </label>
        </div>
      </div>
    </div>

    <select
      class="form-select w-auto"
      v-model="sortBy"
      @change="emitSortChange"
    >
      <option value="">Trier par</option>
      <option value="progress-desc">Progression (Élevée à Faible)</option>
      <option value="progress-asc">Progression (Faible à Élevée)</option>
    </select>

    <input
      type="text"
      class="form-control w-auto"
      placeholder="Filter by label"
      v-model="filterLabel"
      @input="emitLabelChange"
    />
    <input
      type="text"
      class="form-control w-auto"
      placeholder="Filter by title"
      v-model="filterTitle"
      @input="emitTitleChange"
    />
    <button class="btn btn-success px-4">Add new</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits([
  'sort-change',
  'status-change',
  'filter-label-change',
  'filter-title-change',
])

const statusOptions = ref([
  { value: 'not-started', label: 'No started (0%)' },
  { value: '0-25', label: '0% < X <= 25%' },
  { value: '25-50', label: '25% < X <= 50%' },
  { value: '50-75', label: '50% < X <= 75%' },
  { value: '75-99', label: '75% < X <= 99%' },
  { value: 'in-progress', label: 'En cours (1% <= X <= 99%)' },
  { value: 'finished', label: 'Finished (100%)' },
])
const selectedStatuses = ref([])
function emitStatusChange() {
  emit('status-change', selectedStatuses.value)
}

const sortBy = ref('')
function emitSortChange() {
  emit('sort-change', sortBy.value)
}

const filterLabel = ref('')
const filterTitle = ref('')

function emitLabelChange() {
  emit('filter-label-change', filterLabel.value)
}

function emitTitleChange() {
  emit('filter-title-change', filterTitle.value)
}
</script>