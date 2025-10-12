import { defineStore } from 'pinia'

const USER_STORAGE_KEY = 'todo-current-user'
const DEFAULT_ROLE = 'admin'
const VALID_ROLES = ['employee', 'admin']

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
    name: 'Guest',
    email: null,
    role: DEFAULT_ROLE,
    initialized: false
  }),
  getters: {
    isAdmin: (state) => state.role === 'admin',
    isEmployee: (state) => state.role === 'employee',
    displayName: (state) => state.name || 'Guest'
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
    setUser(payload = {}) {
      this.applyUser(payload)
      this.persist()
    },
    applyUser(payload = {}) {
      this.id = payload.id ?? this.id
      this.name = payload.name ?? this.name ?? 'Guest'
      this.email = payload.email ?? this.email
      this.role = normalizeRole(payload.role ?? this.role)
    },
    clearUser() {
      this.id = null
      this.name = 'Guest'
      this.email = null
      this.role = DEFAULT_ROLE
      this.persist()
    },
    persist() {
      writeStoredUser({
        id: this.id,
        name: this.name,
        email: this.email,
        role: this.role
      })
    }
  }
})
