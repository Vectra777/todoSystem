<template>
  <Header />
  <div>
      <div class="dashboard-wrapper py-5">
          <div class="container">
              <SearchBar />

              <TeamList class="my-4" />

              <AddTeamForm class="my-4" />

               <AddEmployeeForm class="my-4" />
          </div>
      </div>

      <div class="container py-5">
        <h2 class="text-center mb-4">Competences</h2>
        <CompetenceFilters class="mb-4" />

          <div class="d-flex flex-wrap justify-content-center gap-4">
          <CompetenceCard
            v-for="(skill, i) in skillItems"
            :key="skill.id"
            :item="skill"
            style="flex: 1 1 calc(33.333% - 2rem); max-width: 400px;"
          />
        </div>
        <div class="text-center mt-4">
          <button class="btn btn-outline-primary rounded-pill px-4"  >
            Voir plus
          </button>
        </div>
      </div>
  </div>
  <Footer />
</template>
<script setup>

import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";

import Header from "../../components/Header.vue";
import Footer from "../../components/Footer.vue";
import SearchBar from "./components/SearchBar.vue";
import TeamList from "./components/TeamList.vue";
import AddTeamForm from "./components/AddTeamForm.vue";
import AddEmployeeForm from "./components/AddEmployeeForm.vue";
import CompetenceFilters from "./components/CompetenceFilters.vue";
import CompetenceCard from '../../components/CompetenceCard.vue';
import { useTasksStore } from '../../stores/tasks';

const tasksStore = useTasksStore();
const { tasks } = storeToRefs(tasksStore);

const skillItems = computed(() => tasks.value);

onMounted(() => {
  tasksStore.initialize();
});
</script>
<style scoped>
    .dashboard-wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: radial-gradient(circle at 70% 15%, rgba(0, 180, 255, 0.6), transparent 60%),
                radial-gradient(circle at 30% 65%, rgba(255, 0, 120, 0.5), transparent 60%),
                #000;
    }
</style>