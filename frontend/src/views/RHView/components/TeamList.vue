<template>
  <div class="bg-body rounded-4 p-4 shadow-sm">
    <h2 class="text-center fs-5 mb-3">
      {{ selectedEmployee ? "User's Team(s)" : 'The Teams' }}
    </h2>

    <div v-if="teamsLoading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading teams...</span>
      </div>
      <p class="mt-2 text-muted">Loading teams...</p>
    </div>

    <div v-else-if="teams.length === 0" class="text-center py-4 text-muted">
      <p>No teams found. Create a team to get started!</p>
    </div>

    <div v-else v-for="team in filteredTeams" :key="team.id" class="border-bottom py-3">
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
                    class="p-2 border-bottom d-flex justify-content-between align-items-center"
                  >
                    <span>{{ member.name }}</span>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      @click.stop="removeMember(team.id, member.id)"
                      title="Remove from team"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useApiStore } from '../../../stores/api'

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

const apiStore = useApiStore()
const openTeamId = ref(null)
const memberSearchQuery = ref('')
const teams = ref([])
const teamsLoading = ref(false)

async function loadTeams() {
  teamsLoading.value = true
  try {
    console.log('Loading teams...')
    const response = await apiStore.getTeams()
    console.log('Teams loaded:', response)
    
    // Load all team data immediately
    const teamsWithData = await Promise.all(response.map(async (team) => {
      const teamObj = {
        id: team.id,
        name: team.team_name || team.name,
        description: team.description,
        employees: 0,
        skills: 0,
        members: [],
        competences: [],
        isLoading: false,
        hasLoaded: true,
        error: null,
      }
      
      try {
        // Fetch team members from API
        const members = await apiStore.getMembersByTeam(team.id)
        teamObj.members = members
        teamObj.employees = members.length

        // Fetch team competences from API
        const competences = await apiStore.getCompetencesByTeam(team.id)
        teamObj.competences = competences
        teamObj.skills = competences.length
      } catch (error) {
        console.error(`Failed to load data for team ${team.id}:`, error)
        teamObj.error = error.message
      }
      
      return teamObj
    }))
    
    teams.value = teamsWithData
  } catch (error) {
    console.error('Failed to load teams:', error)
    // Show error to user but don't crash
    teams.value = []
  } finally {
    teamsLoading.value = false
  }
}

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
  loadTeams()
})

watch(() => props.allCompetences, () => {
  updateTeamCounts()
})

const filteredTeams = computed(() => {
  // Always show all teams
  return teams.value
})

async function fetchTeamData(team) {
  team.isLoading = true
  team.error = null

  try {
    // Fetch team members from API
    const members = await apiStore.getMembersByTeam(team.id)
    team.members = members
    team.employees = members.length

    // Fetch team competences from API
    const competences = await apiStore.getCompetencesByTeam(team.id)
    team.competences = competences
    team.skills = competences.length
    
    team.hasLoaded = true
  } catch (e) {
    console.error(e)
    team.error = e.message || 'Failed to load team data.'
    
    // Fallback to props data if available
    const teamMembers = props.allEmployees.filter((employee) =>
      employee.teams && employee.teams.includes(team.name)
    )
    const teamCompetences = props.allCompetences.filter(
      (c) => c.label === team.name
    )
    
    team.members = teamMembers
    team.competences = teamCompetences
    team.employees = teamMembers.length
    team.skills = teamCompetences.length
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

async function removeMember(teamId, employeeId) {
  if (!confirm('Are you sure you want to remove this member from the team?')) {
    return
  }

  try {
    await apiStore.removeTeamMember(teamId, employeeId)
    
    // Refresh the team data
    const team = teams.value.find(t => t.id === teamId)
    if (team) {
      team.hasLoaded = false
      await fetchTeamData(team)
    }
  } catch (error) {
    console.error('Failed to remove member:', error)
    alert('Failed to remove member from team: ' + (error.message || 'Unknown error'))
  }
}
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