import { defineStore } from 'pinia'
import { createCompetence } from '../models/competence'

const STORAGE_KEY = 'todo-local-tasks'

const defaultTasks = [
  createCompetence({
    id: 1,
    title: 'Welcome tour',
    content: 'Explore the dashboard views and filters.',
    progress: 25,
    label: 'Onboarding',
    status: 'doing',
    start_date: '2025-09-30',
    end_date: '2025-10-15'
  }),
  createCompetence({
    id: 2,
    title: 'Draft policy update',
    content: 'Consolidate feedback from HR and prepare the policy draft.',
    progress: 60,
    label: 'HR',
    status: 'doing',
    start_date: '2025-09-20',
    end_date: '2025-10-10'
  }),
  createCompetence({
    id: 3,
    title: 'Launch comms camf',
    content: 'Coordinate launch checklist with communications team.',
    progress: 90,
    label: 'Operations',
    status: 'finished',
    start_date: '2025-08-15',
    end_date: '2025-09-05'
  }),
  createCompetence({
    id: 4,
    title: 'Meet-up devs',
    content: 'Organize a meet-up with the devs',
    progress: 0,
    label: 'Operations',
    status: 'to do',
    start_date: '2025-08-15',
    end_date: '2025-09-05'
  }),
  createCompetence({
    id: 5,
    title: 'Creating an account',
    content: 'The name is quite explicit.',
    progress: 100,
    label: 'HR',
    status: 'finished',
    start_date: '2025-08-15',
    end_date: '2025-09-05'
  })
]

function readStorage() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch (error) {
    console.warn('Unable to read tasks from storage', error)
    return []
  }
}

function writeStorage(list) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (error) {
    console.warn('Unable to persist tasks to storage', error)
  }
}

function normalizeTasks(list) {
  return list.map((item, index) => {
    const normalized = createCompetence({ ...item })
    if (!normalized.id) {
      normalized.id = index + 1
    }
    return normalized
  })
}

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    items: [],
    initialized: false,
    loading: false,
    error: null
  }),
  getters: {
    tasks: (state) => state.items,
    byStatus: (state) => (status) => state.items.filter((task) => task.status === status)
  },
  actions: {
    initialize() {
      if (this.initialized || this.loading) return
      this.loading = true
      try {
        const stored = readStorage()
        if (stored.length) {
          this.items = normalizeTasks(defaultTasks) // normaly you use the stored data here 
        } else {
          this.items = normalizeTasks(defaultTasks)
          writeStorage(this.items)
        }
        this.initialized = true
        this.error = null
      } catch (error) {
        this.error = error
        console.error('Failed to initialize tasks store', error)
      } finally {
        this.loading = false
      }
    },
    refresh() {
      this.initialized = false
      this.initialize()
    },
    saveSnapshot() {
      writeStorage(this.items)
    },
    async moveTask({ id, toStatus }) {
      const index = this.items.findIndex((task) => String(task.id) === String(id))
      if (index === -1) throw new Error('Task not found')
      const previous = { ...this.items[index] }
      this.items[index].status = toStatus
      this.saveSnapshot()
      return { previous }
    },
    restoreTask(id, snapshot) {
      const index = this.items.findIndex((task) => String(task.id) === String(id))
      if (index === -1) return
      this.items[index] = { ...snapshot }
      this.saveSnapshot()
    },
    updateTask(id, partial) {
      const index = this.items.findIndex((task) => String(task.id) === String(id))
      if (index === -1) throw new Error('Task not found')
      this.items[index] = { ...this.items[index], ...partial, id: this.items[index].id }
      this.saveSnapshot()
      return this.items[index]
    }
  }
})
