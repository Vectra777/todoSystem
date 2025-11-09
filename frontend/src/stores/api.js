import { defineStore } from 'pinia'
import { useUserStore } from './user'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const REFRESH_TOKEN_KEY = 'todo-refresh-token'

function getStoredRefreshToken() {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch (error) {
    console.warn('Unable to read refresh token', error)
    return null
  }
}

function storeRefreshToken(token) {
  if (typeof window === 'undefined') return
  try {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
  } catch (error) {
    console.warn('Unable to store refresh token', error)
  }
}

export const useApiStore = defineStore('api', {
  state: () => ({
    refreshToken: getStoredRefreshToken(),
    isRefreshing: false,
    refreshSubscribers: []
  }),

  actions: {
    /**
     * Make an authenticated API request
     */
    async request(endpoint, options = {}) {
      const userStore = useUserStore()
      const url = `${API_BASE_URL}${endpoint}`
      
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      }

      // Add Authorization header if we have a token
      if (userStore.token) {
        headers['Authorization'] = `Bearer ${userStore.token}`
      }

      const config = {
        ...options,
        headers
      }

      try {
        const response = await fetch(url, config)
        
        // If unauthorized and we have a refresh token, try to refresh
        if (response.status === 401 && this.refreshToken) {
          const newToken = await this.refreshAccessToken()
          if (newToken) {
            // Retry the original request with new token
            headers['Authorization'] = `Bearer ${newToken}`
            const retryResponse = await fetch(url, { ...config, headers })
            if (!retryResponse.ok) {
              throw new Error(`Request failed: ${retryResponse.statusText}`)
            }
            return await retryResponse.json()
          }
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Request failed: ${response.statusText}`)
        }

        // Handle 204 No Content
        if (response.status === 204) {
          return null
        }

        return await response.json()
      } catch (error) {
        console.error('API request error:', error)
        throw error
      }
    },

    /**
     * Refresh the access token using the refresh token
     */
    async refreshAccessToken() {
      if (this.isRefreshing) {
        // Wait for the ongoing refresh to complete
        return new Promise((resolve) => {
          this.refreshSubscribers.push(resolve)
        })
      }

      this.isRefreshing = true

      try {
        const response = await fetch(`${API_BASE_URL}/employee/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken })
        })

        if (!response.ok) {
          // Refresh token is invalid, clear everything
          this.clearTokens()
          return null
        }

        const data = await response.json()
        const { accessToken, refreshToken } = data.tokens

        const userStore = useUserStore()
        userStore.setToken(accessToken)
        this.setRefreshToken(refreshToken)

        // Notify all subscribers
        this.refreshSubscribers.forEach(callback => callback(accessToken))
        this.refreshSubscribers = []

        return accessToken
      } catch (error) {
        console.error('Token refresh error:', error)
        this.clearTokens()
        return null
      } finally {
        this.isRefreshing = false
      }
    },

    /**
     * Authentication methods
     */
    async login(email, password) {
      const response = await fetch(`${API_BASE_URL}/employee/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Login failed')
      }

      const data = await response.json()
      const userStore = useUserStore()
      
      // Store tokens
      userStore.setToken(data.tokens.accessToken)
      this.setRefreshToken(data.tokens.refreshToken)
      
      // Store user data
      userStore.setUser({
        id: data.user.id,
        firstname: data.user.firstname,
        lastname: data.user.lastname,
        email: data.user.email,
        role: data.user.role
      })

      return data.user
    },

    async register(userData) {
      const response = await fetch(`${API_BASE_URL}/employee/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Registration failed')
      }

      const data = await response.json()
      const userStore = useUserStore()
      
      // Store tokens
      userStore.setToken(data.tokens.accessToken)
      this.setRefreshToken(data.tokens.refreshToken)
      
      // Store user data
      userStore.setUser({
        id: data.user.id,
        firstname: data.user.firstname,
        lastname: data.user.lastname,
        email: data.user.email,
        role: data.user.role
      })

      return data.user
    },

    async logout() {
      try {
        if (this.refreshToken) {
          await fetch(`${API_BASE_URL}/employee/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: this.refreshToken })
          })
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.clearTokens()
        const userStore = useUserStore()
        userStore.clearUser()
      }
    },

    async changePassword(currentPassword, newPassword) {
      return this.request('/employee/changepsw', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      })
    },

    setRefreshToken(token) {
      this.refreshToken = token
      storeRefreshToken(token)
    },

    clearTokens() {
      this.refreshToken = null
      storeRefreshToken(null)
      const userStore = useUserStore()
      userStore.clearToken()
    },

    /**
     * Resource-specific API methods
     */
    
    // Employees
    async getEmployees() {
      return this.request('/employee')
    },

    async createEmployee(employeeData) {
      return this.request('/employee', {
        method: 'POST',
        body: JSON.stringify(employeeData)
      })
    },

    // Teams
    async getTeams() {
      return this.request('/team')
    },

    async createTeam(teamData) {
      return this.request('/team', {
        method: 'POST',
        body: JSON.stringify(teamData)
      })
    },

    // Team Members
    async getTeamMembers() {
      return this.request('/team_member')
    },

    async getTeamsByEmployee(employeeId) {
      return this.request(`/team_member/employee/${employeeId}`)
    },

    async getMembersByTeam(teamId) {
      return this.request(`/team_member/team/${teamId}`)
    },

    async createTeamMember(memberData) {
      return this.request('/team_member', {
        method: 'POST',
        body: JSON.stringify(memberData)
      })
    },

    async removeTeamMember(teamId, employeeId) {
      return this.request(`/team_member/${teamId}/${employeeId}`, {
        method: 'DELETE'
      })
    },

    // Competences
    async getCompetences() {
      return this.request('/competence')
    },

    async getCompetencesByEmployee(employeeId) {
      return this.request(`/competence/employee/${employeeId}`)
    },

    async getCompetencesByTeam(teamId) {
      return this.request(`/competence/team/${teamId}`)
    },

    async getCompetenceProgress(competenceId) {
      return this.request(`/competence/${competenceId}/progress`)
    },

    async createCompetence(competenceData) {
      return this.request('/competence', {
        method: 'POST',
        body: JSON.stringify(competenceData)
      })
    },

    async updateCompetence(competenceId, competenceData) {
      return this.request(`/competence/${competenceId}`, {
        method: 'PUT',
        body: JSON.stringify(competenceData)
      })
    },

    async deleteCompetence(competenceId) {
      return this.request(`/competence/${competenceId}`, {
        method: 'DELETE'
      })
    },

    // User Tasks
    async getUserTasks() {
      return this.request('/user_task')
    },

    async updateMyTask(competenceId, taskData) {
      return this.request(`/user_task/me/${competenceId}`, {
        method: 'PUT',
        body: JSON.stringify(taskData)
      })
    },

    async updateTaskByHR(competenceId, employeeId, taskData) {
      return this.request(`/user_task/${competenceId}/${employeeId}`, {
        method: 'PUT',
        body: JSON.stringify(taskData)
      })
    },

    // Search
    async search(query) {
      return this.request(`/search?q=${encodeURIComponent(query)}`)
    }
  }
})
