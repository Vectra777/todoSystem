import { defineStore } from 'pinia'

const THEME_STORAGE_KEY = 'todo-bs-theme'
const LEGACY_STORAGE_KEY = 'todo-dark-mode'

function readStoredTheme() {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(THEME_STORAGE_KEY)
  } catch (error) {
    console.warn('Unable to access localStorage for theme', error)
    return null
  }
}

function readLegacyTheme() {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(LEGACY_STORAGE_KEY)
  } catch (error) {
    return null
  }
}

function detectInitialTheme() {
  if (typeof document === 'undefined') return 'light'

  const stored = readStoredTheme()
  if (stored === 'dark' || stored === 'light') return stored

  const legacy = readLegacyTheme()
  if (legacy === '1') return 'dark'
  if (legacy === '0') return 'light'

  const attr = document.documentElement.getAttribute('data-bs-theme')
  if (attr === 'dark' || attr === 'light') return attr

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    if (query.matches) return 'dark'
  }

  return 'light'
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return
  const normalized = theme === 'dark' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-bs-theme', normalized)
  document.documentElement.classList.toggle('dark-mode', normalized === 'dark')
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: detectInitialTheme()
  }),
  getters: {
    isDark: (state) => state.theme === 'dark'
  },
  actions: {
    initialize() {
      this.applyCurrentTheme()
    },
    setTheme(theme) {
      const normalized = theme === 'dark' ? 'dark' : 'light'
      this.theme = normalized
      this.applyCurrentTheme()
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(THEME_STORAGE_KEY, normalized)
        } catch (error) {
          console.warn('Unable to persist theme preference', error)
        }
      }
    },
    toggleTheme() {
      this.setTheme(this.isDark ? 'light' : 'dark')
    },
    applyCurrentTheme() {
      applyTheme(this.theme)
    }
  }
})
