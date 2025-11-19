import { defineStore } from "pinia";
import { useUserStore } from "./user";
import { getRouterInstance } from "../utils/routerInstance";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const REFRESH_TOKEN_KEY = "todo-refresh-token";

function getStoredRefreshToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.warn("Unable to read refresh token", error);
    return null;
  }
}

function storeRefreshToken(token) {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.warn("Unable to store refresh token", error);
  }
}

export const useApiStore = defineStore("api", {
  state: () => ({
    refreshToken: getStoredRefreshToken(),
    isRefreshing: false,
    refreshSubscribers: [],
  }),

  actions: {
    handleUnauthorized({
      redirect = true,
      reason = "sessionExpired",
      redirectPath,
    } = {}) {
      const userStore = useUserStore();

      this.clearTokens();
      userStore.clearUser();

      if (!redirect) return;

      const routerInstance = getRouterInstance();
      if (!routerInstance) return;

      const currentRoute = routerInstance.currentRoute?.value;
      const alreadyOnLogin = currentRoute?.path === "/login";
      if (alreadyOnLogin) return;

      const query = {};
      if (reason) query.reason = reason;
      const fallbackRedirect =
        redirectPath ||
        (currentRoute?.fullPath && currentRoute.path !== "/login"
          ? currentRoute.fullPath
          : null);
      if (fallbackRedirect) query.redirect = fallbackRedirect;

      routerInstance
        .push({
          path: "/login",
          query: Object.keys(query).length ? query : undefined,
        })
        .catch(() => {});
    },

    /**
     * Make an authenticated API request
     */
    async request(endpoint, options = {}) {
      const userStore = useUserStore();
      const url = `${API_BASE_URL}${endpoint}`;

      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      // Add Authorization header if we have a token
      if (userStore.token) {
        headers["Authorization"] = `Bearer ${userStore.token}`;
      }

      const config = {
        ...options,
        headers,
      };

      try {
        let response = await fetch(url, config);

        if (response.status === 401 && this.refreshToken) {
          const newToken = await this.refreshAccessToken();
          if (newToken) {
            headers["Authorization"] = `Bearer ${newToken}`;
            response = await fetch(url, { ...config, headers });
          }
        }

        if (response.status === 401) {
          this.handleUnauthorized({ reason: "sessionExpired" });
          throw new Error("Session expired. Please log in again.");
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Request failed: ${response.statusText}`
          );
        }

        if (response.status === 204) {
          return null;
        }

        return await response.json();
      } catch (error) {
        console.error("API request error:", error);
        throw error;
      }
    },

    /**
     * Refresh the access token using the refresh token
     */
    async refreshAccessToken() {
      if (this.isRefreshing) {
        // Wait for the ongoing refresh to complete
        return new Promise((resolve) => {
          this.refreshSubscribers.push(resolve);
        });
      }

      this.isRefreshing = true;

      try {
        const response = await fetch(`${API_BASE_URL}/employee/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });

        if (!response.ok) {
          this.clearTokens();
          return null;
        }

        const data = await response.json();
        const { accessToken, refreshToken } = data.tokens;

        const userStore = useUserStore();
        userStore.setToken(accessToken);
        this.setRefreshToken(refreshToken);

        // Notify all subscribers
        this.refreshSubscribers.forEach((callback) => callback(accessToken));
        this.refreshSubscribers = [];

        return accessToken;
      } catch (error) {
        console.error("Token refresh error:", error);
        this.clearTokens();
        return null;
      } finally {
        this.isRefreshing = false;
      }
    },

    /**
     * Authentication methods
     */
    async login(email, password) {
      const response = await fetch(`${API_BASE_URL}/employee/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      const userStore = useUserStore();

      // Store tokens
      userStore.setToken(data.tokens.accessToken);
      this.setRefreshToken(data.tokens.refreshToken);

      // Store user data
      userStore.setUser({
        id: data.user.id,
        firstname: data.user.firstname,
        lastname: data.user.lastname,
        email: data.user.email,
        role: data.user.role,
      });

      return data.user;
    },

    async register(userData) {
      const response = await fetch(`${API_BASE_URL}/employee/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();
      const userStore = useUserStore();

      // Store tokens
      userStore.setToken(data.tokens.accessToken);
      this.setRefreshToken(data.tokens.refreshToken);

      // Store user data
      userStore.setUser({
        id: data.user.id,
        firstname: data.user.firstname,
        lastname: data.user.lastname,
        email: data.user.email,
        role: data.user.role,
      });

      return data.user;
    },

    async logout() {
      try {
        if (this.refreshToken) {
          await fetch(`${API_BASE_URL}/employee/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: this.refreshToken }),
          });
        }
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        this.clearTokens();
        const userStore = useUserStore();
        userStore.clearUser();
      }
    },

    async changePassword(currentPassword, newPassword) {
      return this.request("/employee/changepsw", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },

    setRefreshToken(token) {
      this.refreshToken = token;
      storeRefreshToken(token);
    },

    clearTokens() {
      this.refreshToken = null;
      storeRefreshToken(null);
      const userStore = useUserStore();
      userStore.clearToken();
    },

    /**
     * Resource-specific API methods
     */

    // Employees
    async getEmployees() {
      return this.request("/employee");
    },

    async createEmployee(employeeData) {
      return this.request("/employee", {
        method: "POST",
        body: JSON.stringify(employeeData),
      });
    },
    async createAdmin(employeeData) {
      return this.request("/employee/admin", {
        method: "POST",
        body: JSON.stringify(employeeData),
      });
    },

    // Teams
    async getTeams() {
      return this.request("/team");
    },

    async createTeam(teamData) {
      return this.request("/team", {
        method: "POST",
        body: JSON.stringify(teamData),
      });
    },

    // Team Members
    async getTeamMembers() {
      return this.request("/team_member");
    },

    async getTeamsByEmployee(employeeId) {
      return this.request(`/team_member/employee/${employeeId}`);
    },

    async getMembersByTeam(teamId) {
      return this.request(`/team_member/team/${teamId}`);
    },

    async createTeamMember(memberData) {
      return this.request("/team_member", {
        method: "POST",
        body: JSON.stringify(memberData),
      });
    },

    async removeTeamMember(teamId, employeeId) {
      return this.request(`/team_member/${teamId}/${employeeId}`, {
        method: "DELETE",
      });
    },

    // Competences
    async getCompetences() {
      return this.request("/competence");
    },

    async getCompetencesByEmployee(employeeId) {
      return this.request(`/competence/employee/${employeeId}`);
    },

    async getCompetencesByTeam(teamId) {
      return this.request(`/competence/team/${teamId}`);
    },

    async getCompetenceProgress(competenceId) {
      return this.request(`/competence/${competenceId}/progress`);
    },

    async createCompetence(competenceData) {
      return this.request("/competence", {
        method: "POST",
        body: JSON.stringify(competenceData),
      });
    },

    async updateCompetence(competenceId, competenceData) {
      return this.request(`/competence/${competenceId}`, {
        method: "PUT",
        body: JSON.stringify(competenceData),
      });
    },

    async deleteCompetence(competenceId) {
      return this.request(`/competence/${competenceId}`, {
        method: "DELETE",
      });
    },

    // User Tasks
    async getUserTasks() {
      return this.request("/user_task");
    },

    async updateMyTask(competenceOrId, data = {}) {
      let competenceId;
      let payload = {};

      if (typeof competenceOrId === 'object' && competenceOrId !== null) {
        console.log("updateMyTask called with object:", JSON.stringify(competenceOrId));
        competenceId = competenceOrId.id;
        payload = {
          status: competenceOrId.status,
          employee_review:
            competenceOrId.employee_review ??
            competenceOrId.commentEmployee ??
            '',
        };
      } else {
        competenceId = competenceOrId;
        payload = {
          status: data.status,
          employee_review:
            data.employee_review ??
            data.commentEmployee ??
            '',
        };
      }

      if (!competenceId) {
        throw new Error('Competence ID is required to update task');
      }

      const taskData = {};
      if (typeof payload.status !== 'undefined') {
        taskData.status = payload.status;
      }
      if (typeof payload.employee_review !== 'undefined') {
        taskData.employee_review = payload.employee_review;
      }

      return this.request(`/user_task/me/${competenceId}`, {
        method: "PUT",
        body: JSON.stringify(taskData),
      });
    },
    
    async updateTaskByHR(competenceId, employeeId, taskData) {
      return this.request(`/user_task/${competenceId}/${employeeId}`, {
        method: "PUT",
        body: JSON.stringify(taskData),
      });
    },

    // Search
    async search(query) {
      return this.request(`/search/fuzzy?q=${encodeURIComponent(query)}`);
    },

    // Files
    async getFilesByCompetence(competenceId) {
      return this.request(`/file?competenceId=${competenceId}`);
    },

    async uploadFile(competenceId, file) {
      const userStore = useUserStore();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("competence_id", competenceId);

      const url = `${API_BASE_URL}/file`;
      const headers = {};
      if (userStore.token) {
        headers["Authorization"] = `Bearer ${userStore.token}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData, // Don't set Content-Type, browser will set multipart boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Upload failed: ${response.statusText}`
        );
      }

      return await response.json();
    },

    async downloadFile(fileId) {
      const userStore = useUserStore();
      const url = `${API_BASE_URL}/file/${fileId}/download`;
      const headers = {};
      if (userStore.token) {
        headers["Authorization"] = `Bearer ${userStore.token}`;
      }

      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error("Download failed");
      }

      // Return blob for download
      return response.blob();
    },

    async deleteFile(fileId) {
      return this.request(`/file/${fileId}`, {
        method: "DELETE",
      });
    },
  },
});
