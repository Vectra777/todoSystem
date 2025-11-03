<template>
  <div class="row g-2 justify-content-center">
    <div class="col-12 col-md-auto">
      <div class="dropdown">
        <button
          class="form-select dropdown-toggle w-100 text-start"
          type="button"
          id="statusFilterDropdown"
          data-bs-toggle="dropdown"
          data-bs-auto-close="outside"
          aria-expanded="false"
        >
          Filter by status
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
    </div>

    <div class="col-12 col-md-auto">
      <select
        class="form-select w-100"
        v-model="sortBy"
        @change="emitSortChange"
      >
        <option value="">Sort by</option>
        <option value="progress-desc">Progression (Descending)</option>
        <option value="progress-asc">Progression (Ascending)</option>
      </select>
    </div>

    <div class="col-12 col-md-auto">
      <input
        type="text"
        class="form-control w-100"
        placeholder="Filter by label"
        v-model="filterLabel"
        @input="emitLabelChange"
      />
    </div>

    <div class="col-12 col-md-auto">
      <input
        type="text"
        class="form-control w-100"
        placeholder="Filter by title"
        v-model="filterTitle"
        @input="emitTitleChange"
      />
    </div>

    <div class="col-12 col-md-auto">
      <button
        class="btn btn-success px-4 w-100"
        type="button"
        @click="emitAddNew"
      >
        Add new
      </button>
    </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits([
  'sort-change',
  'status-change',
  'filter-label-change',
  'filter-title-change',
  'add-new',
])

const statusOptions = ref([
  { value: 'not-started', label: 'Not started (0%)' },
  { value: '0-25', label: '0% < X <= 25%' },
  { value: '25-50', label: '25% < X <= 50%' },
  { value: '50-75', label: '50% < X <= 75%' },
  { value: '75-99', label: '75% < X <= 99%' },
  { value: 'in-progress', label: 'In Progress (1% <= X <= 99%)' },
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

function emitAddNew() {
  emit('add-new')
}
</script>