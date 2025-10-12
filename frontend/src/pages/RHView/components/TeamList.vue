<template>
  <div class="bg-white rounded-4 p-4 shadow-sm">
    <h2 class="text-center fs-5 mb-3">The Teams</h2>

    <div
      v-for="(team, index) in teams"
      :key="index"
      class="row align-items-center bg-light p-3 mb-2 rounded gx-2"
    >
      <div class="col-12 col-md-3 mb-1 mb-md-0">{{ team.name }}</div>
      <div class="col-12 col-md-3 mb-1 mb-md-0">{{ team.employees }} employees</div>
      <div class="col-12 col-md-3 mb-1 mb-md-0">{{ team.skills }} competences</div>
      <div class="col-12 col-md-3 text-md-end">
        <button class="btn btn-outline-secondary btn-sm">+</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const teams = [
  { name: 'Devops', employees: 120, skills: 14 },
  { name: 'Marketing', employees: 80, skills: 10 },
  { name: 'Design', employees: 50, skills: 8 },
  { name: 'QA', employees: 40, skills: 12 },
  { name: 'Support', employees: 60, skills: 6 },
]
</script>
