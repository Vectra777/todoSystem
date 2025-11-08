import { defineStore } from 'pinia'

const USER_STORAGE_KEY = 'todo-current-user'
const DEFAULT_ROLE = 'admin'
const VALID_ROLES = ['employee', 'admin','hr']

function readStoredUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (error) {
    console.warn('Unable to read stored user', error)
    return null
  }
}

function writeStoredUser(payload) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload))
  } catch (error) {
    console.warn('Unable to persist user', error)
  }
}

function normalizeRole(role) {
  if (typeof role !== 'string') return DEFAULT_ROLE
  const normalized = role.toLowerCase()
  return VALID_ROLES.includes(normalized) ? normalized : DEFAULT_ROLE
}

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,
    firstname: null,
    lastname: null,
    email: null,
    role: DEFAULT_ROLE,
    token: null, // JWT or session token from backend
    teams: [], // array of team objects { id, name, employees, competences }
    initialized: false
  }),
  getters: {
    isAdmin: (state) => state.role === 'admin',
    isHr: (state) => state.role === 'hr',
    isEmployee: (state) => state.role === 'employee',
    isAuthenticated: (state) => !!state.token,
    displayName: (state) => {
      const first = state.firstname?.trim()
      const last = state.lastname?.trim()
      if (first || last) return [first, last].filter(Boolean).join(' ')
      return 'Guest'
    },
    authHeader: (state) => (state.token ? { Authorization: `Bearer ${state.token}` } : {}),
    teamsCount: (state) => Array.isArray(state.teams) ? state.teams.length : 0
  },
  actions: {
    initialize() {
      if (this.initialized) return
      const stored = readStoredUser()
      if (stored) {
        this.applyUser(stored)
      }
      this.initialized = true
    },
    setRole(role) {
      this.role = normalizeRole(role)
      this.persist()
    },
    setToken(token) {
      this.token = token || null
      this.persist()
    },
    clearToken() {
      this.token = null
      this.persist()
    },
    setUser(payload = {}) {
      this.applyUser(payload)
      this.persist()
    },
    applyUser(payload = {}) {
      // Accept both separate names and a legacy single 'name' field
      this.id = payload.id ?? this.id

      if (typeof payload.name === 'string' && (!payload.firstname && !payload.lastname)) {
        const parts = payload.name.trim().split(/\s+/)
        this.firstname = payload.firstname ?? parts[0] ?? this.firstname
        this.lastname = payload.lastname ?? (parts.slice(1).join(' ') || this.lastname)
      } else {
        this.firstname = payload.firstname ?? this.firstname
        this.lastname = payload.lastname ?? this.lastname
      }

      this.email = payload.email ?? this.email
      this.role = normalizeRole(payload.role ?? this.role)
      this.token = payload.token ?? this.token ?? null
      if (Array.isArray(payload.teams)) this.teams = payload.teams
    },
    clearUser() {
      this.id = null
      this.firstname = null
      this.lastname = null
      this.email = null
      this.role = DEFAULT_ROLE
      this.token = null
      this.teams = []
      this.persist()
    },
    setTeams(teams = []) {
      this.teams = Array.isArray(teams) ? teams : []
      this.persist()
    },
    addTeam(team) {
      if (!team || typeof team !== 'object') return
      const exists = this.teams?.some(t => t.id === team.id)
      this.teams = exists ? this.teams.map(t => (t.id === team.id ? { ...t, ...team } : t)) : [...(this.teams || []), team]
      this.persist()
    },
    removeTeam(id) {
      this.teams = (this.teams || []).filter(t => t.id !== id)
      this.persist()
    },
    persist() {
      writeStoredUser({
        id: this.id,
        firstname: this.firstname,
        lastname: this.lastname,
        email: this.email,
        role: this.role,
        token: this.token,
        teams: this.teams
      })
    }
  }
})
