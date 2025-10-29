<template>
  <div class="bg-body rounded-4 p-4 shadow-sm">
    <h2 class="text-center fs-5 mb-3">The Teams</h2>

    <template v-for="(team, index) in teams" :key="team.id">
      <div
        class="row align-items-center bg-body border p-3 mb-2 rounded gx-2"
        style="cursor: pointer"
        @click="toggleTeam(index)"
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
            {{ openTeamIndex === index ? '−' : '+' }}
          </button>
        </div>
      </div>

      <div
        v-if="openTeamIndex === index"
        class="p-3 mb-2 bg-light-subtle rounded border"
      >
        <h5 class="mb-3">{{ team.name }} Details</h5>

        <div class="accordion" :id="'teamAccordion-' + index">
          <div class="accordion-item">
            <h2 class="accordion-header" :id="'competences-heading-' + index">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                :data-bs-target="'#competences-collapse-' + index"
                aria-expanded="false"
                :aria-controls="'competences-collapse-' + index"
              >
                Competences ({{ team.skills }})
              </button>
            </h2>
            <div
              :id="'competences-collapse-' + index"
              class="accordion-collapse collapse"
              :aria-labelledby="'competences-heading-' + index"
              :data-bs-parent="'#teamAccordion-' + index"
            >
              <div class="accordion-body">
                <div v-if="team.isLoading" class="text-center">
                  <div
                    class="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
                <div
                  v-else-if="team.error"
                  class="alert alert-danger p-2 small"
                >
                  {{ team.error }}
                </div>

                <ul
                  v-else-if="team.competences.length > 0"
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
                <p v-else class="text-muted small">
                  No competences found for this team.
                </p>
                </div>
            </div>
          </div>

          <div class="accordion-item">
            <h2 class="accordion-header" :id="'members-heading-' + index">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                :data-bs-target="'#members-collapse-' + index"
                aria-expanded="false"
                :aria-controls="'members-collapse-' + index"
              >
                Team Members ({{ team.employees }})
              </button>
            </h2>
            <div
              :id="'members-collapse-' + index"
              class="accordion-collapse collapse"
              :aria-labelledby="'members-heading-' + index"
              :data-bs-parent="'#teamAccordion-' + index"
            >
              <div class="accordion-body">
                <input
                  type="text"
                  v-model="memberSearchQuery"
                  class="form-control mb-3"
                  placeholder="Search for a member..."
                  @click.stop
                />

                <div v-if="team.isLoading" class="text-center">
                  <div
                    class="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
                <div
                  v-else-if="team.error"
                  class="alert alert-danger p-2 small"
                >
                  {{ team.error }}
                </div>
                <ul
                  v-else-if="filteredMembers.length > 0"
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
                <p
                  v-else-if="team.hasLoaded && filteredMembers.length === 0"
                  class="text-muted small"
                >
                  No members match your search.
                </p>
                <p v-else class="text-muted small">
                  No members found for this team.
                </p>
                </div>
              </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue' 

const openTeamIndex = ref(null)
const memberSearchQuery = ref('')

const teams = ref([
  {
    id: 1,
    name: 'Devops',
    employees: 120,
    skills: 14,
    members: [],
    competences: [],
    isLoading: false,
    hasLoaded: false,
    error: null,
  },
  {
    id: 2,
    name: 'Marketing',
    employees: 80,
    skills: 10,
    members: [],
    competences: [], 
    isLoading: false,
    hasLoaded: false,
    error: null,
  },
  {
    id: 3,
    name: 'Design',
    employees: 50,
    skills: 8,
    members: [],
    competences: [], 
    isLoading: false,
    hasLoaded: false,
    error: null,
  },
  {
    id: 4,
    name: 'QA',
    employees: 40,
    skills: 12,
    members: [],
    competences: [], 
    isLoading: false,
    hasLoaded: false,
    error: null,
  },
  {
    id: 5,
    name: 'Support',
    employees: 60,
    skills: 6,
    members: [],
    competences: [], 
    isLoading: false,
    hasLoaded: false,
    error: null,
  },
])

async function fetchTeamData(team) {
  team.isLoading = true
  team.error = null

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockMembers = [
      { id: 101, name: `Jean Val Jean` },
      { id: 102, name: `Justin Trudeau` },
      { id: 103, name: `Alex Johnson` },
      { id: 104, name: `Sam Smith` },
    ]
  
    const mockCompetences = [
      { id: 201, title: `Cryptographie 101` },
      { id: 202, title: `Maintain the Matrix` },
    ]

    team.members = mockMembers
    team.competences = mockCompetences 
    team.hasLoaded = true
  } catch (e) {
    console.error(e)
    team.error = e.message || 'Failed to load team data.'
  } finally {
    team.isLoading = false
  }
}

function toggleTeam(index) {
  if (openTeamIndex.value === index) {
    openTeamIndex.value = null
  } else {
    openTeamIndex.value = index
    memberSearchQuery.value = '' 
    const team = teams.value[index] 

    if (!team.hasLoaded && !team.isLoading) {
      fetchTeamData(team)
    }
  }
}

const filteredMembers = computed(() => {
  if (openTeamIndex.value === null) {
    return []
  }

  const team = teams.value[openTeamIndex.value]
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