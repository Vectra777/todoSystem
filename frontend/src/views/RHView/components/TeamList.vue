<template>
  <div class="bg-body rounded-4 p-4 shadow-sm">
    <h2 class="text-center fs-5 mb-3">
      {{ selectedEmployee ? "User's Team(s)" : 'The Teams' }}
    </h2>

    <template v-for="team in filteredTeams" :key="team.id">
      <div class="border-bottom py-3">
        <div
          class="row align-items-center bg-body p-3 gx-2"
          style="cursor: pointer"
          @click="toggleTeam(team)"
        >
          <div class="col-12 col-md-3 mb-1 mb-md-0">{{ team.name }}</div>
          <div class="col-12 col-md-3 mb-1 mb-md-0">
            {{ team.employees }} employees
          </div>
          <div class="col-12 col-md-3 mb-1 mb-md-0">
            {{ team.skills }} competences
          </div>
          <div class="col-12 col-md-3 text-md-end">
            <button class="btn btn-outline-secondary btn-sm">
              {{ openTeamId === team.id ? '−' : '+' }}
            </button>
          </div>
        </div>
        <div
          v-if="openTeamId === team.id"
          class="p-3 mt-2 bg-light-subtle rounded border"
        >
          <h5 class="mb-3">{{ team.name }} Details</h5>

          <div class="accordion" :id="'teamAccordion-' + team.id">
            <div class="accordion-item">
              <h2
                class="accordion-header"
                :id="'competences-heading-' + team.id"
              >
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  :data-bs-target="'#competences-collapse-' + team.id"
                  aria-expanded="false"
                  :aria-controls="'competences-collapse-' + team.id"
                >
                  Competences ({{ team.competences.length > 0 ? team.competences.length : team.skills }})
                </button>
              </h2>
              <div
                :id="'competences-collapse-' + team.id"
                class="accordion-collapse collapse"
                :aria-labelledby="'competences-heading-' + team.id"
                :data-bs-parent="'#teamAccordion-' + team.id"
              >
                <div class="accordion-body">
                  <ul
                    v-if="team.competences.length > 0"
                    class="list-unstyled mb-0"
                  >
                    <li
                      v-for="competence in team.competences"
                      :key="competence.id"
                      class="p-2 border-bottom"
                    >
                      {{ competence.title }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <h2 class="accordion-header" :id="'members-heading-' + team.id">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  :data-bs-target="'#members-collapse-' + team.id"
                  aria-expanded="false"
                  :aria-controls="'members-collapse-' + team.id"
                >
                  Team Members ({{ team.members.length > 0 ? team.members.length : team.employees }})
                </button>
              </h2>
              <div
                :id="'members-collapse-' + team.id"
                class="accordion-collapse collapse"
                :aria-labelledby="'members-heading-' + team.id"
                :data-bs-parent="'#teamAccordion-' + team.id"
              >
                <div class="accordion-body">
                  <input
                    type="text"
                    v-model="memberSearchQuery"
                    class="form-control mb-3"
                    placeholder="Search for a member..."
                    @click.stop
                  />
                  <ul
                    v-if="filteredMembers.length > 0"
                    class="list-unstyled mb-0"
                  >
                    <li
                      v-for="member in filteredMembers"
                      :key="member.id"
                      class="p-2 border-bottom"
                    >
                      {{ member.name }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  selectedEmployee: Object,
  allEmployees: {
    type: Array,
    default: () => [],
  },
  allCompetences: {
    type: Array,
    default: () => [],
  },
})

const openTeamId = ref(null)
const memberSearchQuery = ref('')

const teams = ref([
  {
    id: 1,
    name: 'Devops',
    employees: 0,
    skills: 0,
    members: [],
    competences: [],
    isLoading: false,
    hasLoaded: false,
    error: null,
  },
  {
    id: 2,
    name: 'Marketing',
    employees: 0,
    skills: 0,
    members: [],
    competences: [],
    isLoading: false,
    hasLoaded: false,
    error: null,
  },
  {
    id: 3,
    name: 'Design',
    employees: 0,
    skills: 0,
    members: [],
    competences: [],
    isLoading: false,
    hasLoaded: false,
    error: null,
  },
  {
    id: 4,
    name: 'QA',
    employees: 0,
    skills: 0,
    members: [],
    competences: [],
    isLoading: false,
    hasLoaded: false,
    error: null,
  },
  {
    id: 5,
    name: 'Support',
    employees: 0,
    skills: 0,
    members: [],
    competences: [],
    isLoading: false,
    hasLoaded: false,
    error: null,
  },
])

function updateTeamCounts() {
  if (!props.allEmployees.length && !props.allCompetences.length) return

  for (const team of teams.value) {
    const teamMembers = props.allEmployees.filter((employee) =>
      employee.teams.includes(team.name)
    )
    team.employees = teamMembers.length
    
    const teamCompetences = props.allCompetences.filter(
      (c) => c.label === team.name
    )
    team.skills = teamCompetences.length
  }
}

onMounted(() => {
  updateTeamCounts()
})
watch(() => props.allCompetences, () => {
  updateTeamCounts()
})

const filteredTeams = computed(() => {
  if (!props.selectedEmployee) {
    return teams.value
  }
  return teams.value.filter((team) =>
    props.selectedEmployee.teams.includes(team.name)
  )
})

async function fetchTeamData(team) {
  team.isLoading = true
  team.error = null

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const teamMembers = props.allEmployees.filter((employee) =>
      employee.teams.includes(team.name)
    )
    
    const teamCompetences = props.allCompetences.filter(
      (c) => c.label === team.name
    )

    team.members = teamMembers
    team.competences = teamCompetences
    
    team.employees = teamMembers.length
    team.skills = teamCompetences.length
    
    team.hasLoaded = true
  } catch (e) {
    console.error(e)
    team.error = e.message || 'Failed to load team data.'
  } finally {
    team.isLoading = false
  }
}

function toggleTeam(team) {
  if (openTeamId.value === team.id) {
    openTeamId.value = null
  } else {
    openTeamId.value = team.id
    memberSearchQuery.value = ''

    if (!team.hasLoaded && !team.isLoading) {
      fetchTeamData(team)
    }
  }
}

const filteredMembers = computed(() => {
  if (openTeamId.value === null) {
    return []
  }
  const team = filteredTeams.value.find((t) => t.id === openTeamId.value)
  if (!team || !team.members) {
    return []
  }

  if (!memberSearchQuery.value) {
    return team.members
  }

  const query = memberSearchQuery.value.toLowerCase()
  return team.members.filter((member) =>
    member.name.toLowerCase().includes(query)
  )
})
</script>


<style scoped>
.collapse-enter-active,
.collapse-leave-active {
  transition: opacity 0.3s ease;
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
}

.accordion-body ul {
  max-height: 250px;
  overflow-y: auto;
}

.border-bottom:last-child {
  border-bottom: 0 !important;
}
</style>