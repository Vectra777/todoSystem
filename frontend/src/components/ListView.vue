<template>
  <div>
    <div class="d-flex justify-content-end mb-2">
      <button class="btn btn-sm" :class="detailed ? 'btn-primary' : 'btn-outline-secondary'" @click="detailed = !detailed">
        {{ detailed ? 'Detailed' : 'Compact' }}
      </button>
    </div>

    <!-- Compact: simple table list -->
    <table v-if="!detailed" class="table table-striped">
      <thead>
        <tr>
          <th>Title</th>
          <th>Label</th>
          <th>Status</th>
          <th>Start Date</th>
          <th>End Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in tasks" :key="task.id">
          <td>{{ task.title }}</td>
          <td>{{ task.label }}</td>
          <td>{{ task.status }}</td>
          <td>{{ task.start_date || '-' }}</td>
          <td>{{ task.end_date || '-' }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Detailed: competence cards -->
    <div v-else class="row g-3">
      <div v-for="task in tasks" :key="task.id" class="col-12 col-md-6">
        <CompetenceCard :item="task" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CompetenceCard from './CompetenceCard.vue'

const props = defineProps({ tasks: Array })
// Read-only list view: no emitters

const detailed = ref(false)
</script>
