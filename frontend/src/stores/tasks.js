import { defineStore } from "pinia";
import { createCompetence } from "../models/competence";
import { useApiStore } from "./api";
import { useUserStore } from "./user";

const STORAGE_KEY = "todo-local-tasks";

const defaultTasks = [];

function readStorage() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    console.warn("Unable to read tasks from storage", error);
    return [];
  }
}

function writeStorage(list) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    console.warn("Unable to persist tasks to storage", error);
  }
}

function normalizeTasks(list) {
  return list.map((item, index) => {
    const normalized = createCompetence({ ...item });
    if (!normalized.id) {
      normalized.id = index + 1;
    }
    return normalized;
  });
}

export const useTasksStore = defineStore("tasks", {
  state: () => ({
    items: [],
    initialized: false,
    loading: false,
    error: null,
    usePlaceholders: true, // Toggle to use real API or placeholders
  }),
  getters: {
    tasks: (state) => state.items,
    byStatus: (state) => (status) =>
      state.items.filter((task) => task.status === status),
  },
  actions: {
    async initialize() {
      if (this.initialized || this.loading) return;
      this.loading = true;
      try {
        const userStore = useUserStore();
        const apiStore = useApiStore();

        // If user is authenticated, fetch real competences
        if (userStore.isAuthenticated && userStore.id) {
          try {
            const competences = await apiStore.getCompetencesByEmployee(userStore.id);
            
            // Map backend data to frontend format
            this.items = competences.map((comp) => createCompetence({
              id: comp.id,
              title: comp.title,
              content: comp.description || '',
              progress: this.calculateProgress(comp.status),
              label: comp.label || 'General',
              status: this.mapStatus(comp.status),
              start_date: comp.start_date,
              end_date: comp.end_date,
              commentEmployee: comp.employee_review || '',
              commentHR: comp.hr_review || '',
            }));

            this.usePlaceholders = false;
          } catch (error) {
            console.warn('Failed to fetch competences, using placeholders:', error);
            // Fall back to placeholders on error
            const stored = readStorage();
            if (stored.length) {
              this.items = normalizeTasks(stored);
            } else {
              this.items = normalizeTasks(defaultTasks);
              writeStorage(this.items);
            }
            this.usePlaceholders = true;
          }
        } else {
          // Not authenticated, use placeholders
          const stored = readStorage();
          if (stored.length) {
            this.items = normalizeTasks(stored);
          } else {
            this.items = normalizeTasks(defaultTasks);
            writeStorage(this.items);
          }
          this.usePlaceholders = true;
        }

        this.initialized = true;
        this.error = null;
      } catch (error) {
        this.error = error;
        console.error("Failed to initialize tasks store", error);
      } finally {
        this.loading = false;
      }
    },

    // Map backend status to frontend status
    mapStatus(backendStatus) {
      if (!backendStatus) return 'to do';
      const normalized = backendStatus
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, ' ');

      const statusMap = {
        'to do': 'to do',
        'todo': 'to do',
        'not started': 'to do',
        'in progress': 'in progress',
        'doing': 'in progress',
        'progress': 'in progress',
        'done': 'finished',
        'finished': 'finished',
        'completed': 'finished',
        'validated': 'validated',
        'approved': 'validated',
        'blocked': 'to do'
      };

      return statusMap[normalized] || 'to do';
    },

    // Map frontend status to backend status
    mapStatusToBackend(frontendStatus) {
      if (!frontendStatus) return 'To Do';
      const normalized = frontendStatus
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, ' ');
      const statusMap = {
        'to do': 'To Do',
        'todo': 'To Do',
        'in progress': 'In Progress',
        'doing': 'In Progress',
        'finished': 'Completed',
        'completed': 'Completed',
        'done': 'Completed',
        'validated': 'Validated',
        'approved': 'Validated'
      };
      return statusMap[normalized] || 'To Do';
    },

    // Calculate progress percentage based on status
    calculateProgress(status) {
      if (!status) return 0;
      const normalized = status
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, ' ');

      const progressMap = {
        'to do': 0,
        'todo': 0,
        'not started': 0,
        'blocked': 25,
        'in progress': 50,
        'doing': 50,
        'progress': 50,
        'done': 100,
        'finished': 100,
        'completed': 100,
        'validated': 100,
        'approved': 100
      };

      return progressMap[normalized] || 0;
    },

    async fetchEmployeeCompetences() {
      const userStore = useUserStore();
      const apiStore = useApiStore();

      if (!userStore.id) {
        throw new Error('User not authenticated');
      }

      this.loading = true;
      try {
        const competences = await apiStore.getCompetencesByEmployee(userStore.id);
        
        this.items = competences.map((comp) => createCompetence({
          id: comp.id,
          title: comp.title,
          content: comp.description || '',
          progress: this.calculateProgress(comp.status),
          label: comp.label || 'General',
          status: this.mapStatus(comp.status),
          start_date: comp.start_date,
          end_date: comp.end_date,
          commentEmployee: comp.employee_review || '',
          commentHR: comp.hr_review || '',
        }));

        this.usePlaceholders = false;
        this.error = null;
      } catch (error) {
        this.error = error;
        console.error('Failed to fetch employee competences:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    refresh() {
      this.initialized = false;
      this.initialize();
    },
    saveSnapshot() {
      writeStorage(this.items);
    },
    async moveTask(competence) {
      const index = this.items.findIndex(
        (task) => String(task.id) === String(competence.id)
      );
      if (index === -1) throw new Error("Task not found");
      
      const previous = { ...this.items[index] };
      
      try {
          await this.updateTaskUser(competence); 
          // Update local state with new status and progress
          this.items[index].status = competence.status;
        
        this.saveSnapshot();
        return { previous };
      } catch (error) {
        console.error('Failed to move task:', error);
        // Restore previous state on error
        this.items[index] = { ...previous };
        this.saveSnapshot();
        throw error;
      }
    },
    restoreTask(id, snapshot) {
      const index = this.items.findIndex(
        (task) => String(task.id) === String(id)
      );
      if (index === -1) return;
      this.items[index] = { ...snapshot };
      this.saveSnapshot();
    },

    async createTask(newTaskData) {
      try {
        const competenceData = {
          title: newTaskData.title,
          description: newTaskData.content || newTaskData.description,
          label: newTaskData.label,
          start_date: newTaskData.start_date,
          end_date: newTaskData.end_date,
          members: newTaskData.members || []
        };

        const apiStore = useApiStore();
        const created = await apiStore.createCompetence(competenceData);
        
        // Add to local store
        const newTask = createCompetence({
          id: created.id,
          title: created.title,
          content: created.description,
          label: created.label,
          status: 'to do',
          progress: 0,
          start_date: created.start_date,
          end_date: created.end_date,
          commentEmployee: '',
          commentHR: '',
          files: []
        });
        this.items.push(newTask);
        this.saveSnapshot();
        return newTask;
      } catch (error) {
        console.error('Failed to create competence:', error);
        // Fallback to local creation
        const maxId = this.items.reduce(
          (max, item) => Math.max(item.id || 0, max),
          0
        );
        const newTask = createCompetence({
          ...newTaskData,
          id: maxId + 1,
        });
        this.items.push(newTask);
        this.saveSnapshot();
        return newTask;
      }
    },

    async updateTask(id, partial) {
      try {
        const apiStore = useApiStore();
        const userStore = useUserStore();

        // updateTask called (debug logs removed in cleanup)

        // If HR is updating the competence details
        if (userStore.isHr) {
          // HR update path
          const competenceData = {
            title: partial.title,
            description: partial.content || partial.description,
            label: partial.label,
            start_date: partial.start_date,
            end_date: partial.end_date,
            members: partial.members || []
          };
          // Calling updateCompetence with competenceData
          await apiStore.updateCompetence(id, competenceData);

          if (Array.isArray(partial.members) && partial.members.length) {
            const hrUpdates = partial.members
              .filter(member => member?.id && String(member.id).startsWith('e'))
              .map(member => {
                const hrReview =
                  member.hrReview ??
                  member.hr_review ??
                  member.commentHR;
                const frontendStatus = member.status;
                const backendStatus = frontendStatus
                  ? this.mapStatusToBackend(frontendStatus)
                  : undefined;

                if (
                  typeof hrReview === 'undefined' &&
                  typeof backendStatus === 'undefined'
                ) {
                  return null;
                }

                const payload = {};
                if (typeof hrReview !== 'undefined') {
                  payload.hr_review = hrReview ?? '';
                }
                if (typeof backendStatus !== 'undefined') {
                  payload.status = backendStatus;
                }

                return apiStore.updateTaskByHR(id, member.id, payload);
              })
              .filter(Boolean);

            if (hrUpdates.length) {
              await Promise.all(hrUpdates);
            }
          }
        }
        // If status is being updated by an employee, update the UserTask
        else if (partial.status && userStore.id) {
          // Employee update path - updating user task status
          try {
            // Map frontend status to backend status
            const backendStatus = this.mapStatusToBackend(partial.status);
            // Calling updateMyTask with mapped backend status
            await apiStore.updateMyTask(id, {
              status: backendStatus
            });
            
            // Update progress based on status
            partial.progress = this.calculateProgress(backendStatus);
          } catch (statusError) {
            console.error('Failed to update task status:', statusError);
            throw statusError;
          }
        }
        
  // Update local store
        // Update local store
        const index = this.items.findIndex(
          (task) => String(task.id) === String(id)
        );
        if (index !== -1) {
          this.items[index] = {
            ...this.items[index],
            ...partial,
            id: this.items[index].id,
          };
          this.saveSnapshot();
          return this.items[index];
        }
      } catch (error) {
        console.error('Failed to update competence:', error);
        throw error;
      }
    },

    async updateTaskUser(competence) {
      console.log('updateTaskUser called with:', JSON.stringify(competence));
      const apiStore = useApiStore();

      const index = this.items.findIndex(
        (task) => String(task.id) === String(competence.id)
      );

      const fallbackStatus = index !== -1 ? this.items[index].status : 'to do';
      const normalizedStatus = competence.status || fallbackStatus;
      const backendStatus = this.mapStatusToBackend(normalizedStatus);

      try {
        await apiStore.updateMyTask(competence.id, {
          status: backendStatus,
          employee_review: competence.commentEmployee,
        });
      } catch (statusError) {
        console.error('Failed to update task status:', statusError);
        throw statusError;
      }

      if (index !== -1) {
        this.items[index] = {
          ...this.items[index],
          ...competence,
          status: this.mapStatus(backendStatus),
          progress: this.calculateProgress(backendStatus),
          id: this.items[index].id,
        };
        this.saveSnapshot();
        return this.items[index];
      }
    },

    async deleteTask(id) {
      try {
        const apiStore = useApiStore();
        await apiStore.deleteCompetence(id);
        
        // Remove from local store
        const index = this.items.findIndex(
          (task) => String(task.id) === String(id)
        );
        if (index !== -1) {
          this.items.splice(index, 1);
          this.saveSnapshot();
        }
      } catch (error) {
        console.error('Failed to delete competence:', error);
        throw error;
      }
    },
  },
});
