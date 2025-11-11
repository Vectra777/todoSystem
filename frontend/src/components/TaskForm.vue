<template>
  <form
    @submit.prevent="handleSave"
    class="position-fixed top-0 end-0 border-start p-4 bg-body-tertiary shadow"
    style="width: 500px; height: 100vh; z-index: 200000; overflow-y: auto"
  >
    <h5 class="d-flex align-items-center justify-content-between mb-4">
      <span>{{ task.title }} task</span>
      <div>
        <button
          type="button"
          class="btn btn-outline-primary btn-sm me-2"
          @click="toggleMode"
        >
          {{ currentMode === "view" ? "Edit" : "View" }}
        </button>
        <button
          type="button"
          class="btn-close"
          aria-label="Close"
          @click="$emit('close')"
        ></button>
      </div>
    </h5>

    <div class="card mb-4">
      <div class="card-header fw-semibold">General Information</div>
      <div class="card-body">
        <div class="mb-3">
          <label class="form-label">Title</label>
          <template v-if="currentMode === 'edit' && mainView">
            <input
              v-model="localTask.title"
              class="form-control"
              placeholder="Enter a task title"
              required
            />
          </template>
          <template v-else>
            <p class="mb-0">{{ localTask.title || "—" }}</p>
          </template>
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <template v-if="currentMode === 'edit' && mainView">
            <textarea
              v-model="localTask.content"
              class="form-control"
              rows="6"
              placeholder="Describe the task..."
              required
            ></textarea>
          </template>
          <template v-else>
            <div
              v-html="renderMarkdown(localTask.content)"
              class="border rounded p-2"
            ></div>
          </template>
        </div>

        <div class="mb-3">
          <label class="form-label">Label</label>
          <template v-if="currentMode === 'edit' && mainView">
            <input
              v-model="localTask.label"
              class="form-control"
              placeholder="Enter a label"
              required
            />
          </template>
          <template v-else>
            <p class="mb-0">{{ localTask.label || "—" }}</p>
          </template>
        </div>

        <div class="mb-3" v-if="!mainView">
          <label class="form-label">Status</label>
          <template v-if="currentMode === 'edit' && !mainView">
            <select v-model="localTask.status" class="form-select" required>
              <option disabled value="">Select a status</option>
              <option value="to do">To Do</option>
              <option value="in progress">In Progress</option>
              <option value="finished">Finished</option>
              <option v-if="lookAsHR" value="validated">Validated</option>
            </select>
          </template>
          <template v-else>
            <p class="mb-0">{{ localTask.status || "—" }}</p>
          </template>
        </div>
      </div>
    </div>
    <div class="card mb-4" v-if="mainView">
      <div class="card-header fw-semibold">Members</div>
      <div class="card-body">
        <div class="mb-3">
          <template v-if="currentMode === 'edit' && mainView">
            <div class="mb-4">
              <label class="form-label">Teams</label>
              
              <div v-if="selectedTeams.length > 0" class="mb-2 d-flex flex-wrap gap-2">
                <span 
                  v-for="team in selectedTeams" 
                  :key="team.id"
                  class="badge bg-info d-flex align-items-center gap-1"
                >
                  <i class="bi bi-people-fill"></i>
                  <span>{{ team.name }}</span>
                  <button 
                    type="button"
                    class="btn-close btn-close-white"
                    style="font-size: 0.6rem; padding: 0.2rem;"
                    @click="removeMember(team.id)"
                    aria-label="Remove"
                  ></button>
                </span>
              </div>

              <div class="position-relative">
                <input 
                  type="text"
                  v-model="teamSearchQuery"
                  @focus="showTeamResults = true"
                  @blur="hideTeamResultsDelayed"
                  class="form-control"
                  placeholder="Search teams..."
                  :disabled="loadingTeams"
                />
                <div 
                  v-if="showTeamResults && (loadingTeams || filteredTeams.length > 0)"
                  class="position-absolute w-100 mt-1 bg-white border rounded shadow-sm"
                  style="max-height: 200px; overflow-y: auto; z-index: 1000;"
                >
                  <div v-if="loadingTeams" class="p-2 text-center text-muted">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Loading teams...
                  </div>
                  <div 
                    v-else
                    v-for="team in filteredTeams" 
                    :key="team.id"
                    class="p-2 hover-bg-light"
                    style="cursor: pointer;"
                    @mousedown.prevent="addMember(team)"
                  >
                    <i class="bi bi-people-fill me-2 text-info"></i>{{ team.name }}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="form-label">Employees</label>
              
              <div v-if="selectedEmployees.length > 0" class="mb-2 d-flex flex-wrap gap-2">
                <span 
                  v-for="employee in selectedEmployees" 
                  :key="employee.id"
                  class="badge bg-primary d-flex align-items-center gap-1"
                >
                  <i class="bi bi-person-fill"></i>
                  <span>{{ employee.name }}</span>
                  <button 
                    type="button"
                    class="btn-close btn-close-white"
                    style="font-size: 0.6rem; padding: 0.2rem;"
                    @click="removeMember(employee.id)"
                    aria-label="Remove"
                  ></button>
                </span>
              </div>

              <div class="position-relative">
                <input 
                  type="text"
                  v-model="employeeSearchQuery"
                  @focus="showEmployeeResults = true"
                  @blur="hideEmployeeResultsDelayed"
                  class="form-control"
                  placeholder="Search employees..."
                  :disabled="loadingEmployees"
                />
                <div 
                  v-if="showEmployeeResults && (loadingEmployees || filteredEmployees.length > 0)"
                  class="position-absolute w-100 mt-1 bg-white border rounded shadow-sm"
                  style="max-height: 200px; overflow-y: auto; z-index: 1000;"
                >
                  <div v-if="loadingEmployees" class="p-2 text-center text-muted">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Loading employees...
                  </div>
                  <div 
                    v-else
                    v-for="employee in filteredEmployees" 
                    :key="employee.id"
                    class="p-2 hover-bg-light"
                    style="cursor: pointer;"
                    @mousedown.prevent="addMember(employee)"
                  >
                    <i class="bi bi-person-fill me-2 text-primary"></i>{{ employee.name }}
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div v-if="localTask.members && localTask.members.length > 0">
              <h6 class="mb-2">Teams</h6>
              <ul v-if="selectedTeams.length > 0" class="mb-3 list-group">
                <li v-for="team in selectedTeams" :key="team.id" class="list-group-item">
                  <i class="bi bi-people-fill me-2 text-info"></i>{{ team.name }}
                </li>
              </ul>
              <p v-else class="text-muted small">No teams assigned</p>

              <h6 class="mb-2">Employees</h6>
              <ul v-if="selectedEmployees.length > 0" class="mb-0 list-group">
                <li v-for="employee in selectedEmployees" :key="employee.id" class="list-group-item">
                  <i class="bi bi-person-fill me-2 text-primary"></i>{{ employee.name }}
                </li>
              </ul>
              <p v-else class="text-muted small">No employees assigned</p>
            </div>
            <p v-else class="mb-0 text-muted">No members or teams assigned</p>
          </template>
        </div>
      </div>
    </div>
    <div class="card mb-4">
      <div class="card-header fw-semibold">Dates</div>
      <div class="card-body">
        <div class="mb-3">
          <label class="form-label">Start Date</label>
          <template v-if="currentMode === 'edit' && mainView">
            <input
              type="date"
              v-model="localTask.start_date"
              class="form-control"
            />
          </template>
          <template v-else>
            <p class="mb-0">{{ localTask.start_date || "—" }}</p>
          </template>
        </div>

        <div class="mb-3">
          <label class="form-label">End Date</label>
          <template v-if="currentMode === 'edit' && mainView">
            <input
              type="date"
              v-model="localTask.end_date"
              class="form-control"
            />
          </template>
          <template v-else>
            <p class="mb-0">{{ localTask.end_date || "—" }}</p>
          </template>
        </div>
      </div>
    </div>

    <div class="card mb-4" v-if="!mainView">
      <div class="card-header fw-semibold">Comments</div>
      <div class="card-body">
        <div class="mb-3">
          <label class="form-label">Employee comment</label>
          <template v-if="currentMode === 'edit' && !lookAsHR">
            <textarea
              v-model="localTask.commentEmployee"
              class="form-control"
              rows="3"
              placeholder="Add your comment..."
            ></textarea>
          </template>
          <template v-else>
            <p class="mb-0" style="white-space: pre-wrap">
              {{ localTask.commentEmployee || "—" }}
            </p>
          </template>
        </div>

        <div class="mb-3">
          <label class="form-label">HR comment</label>
          <template v-if="currentMode === 'edit' && lookAsHR">
            <textarea
              v-model="localTask.commentHR"
              class="form-control"
              rows="3"
              placeholder="Add an HR comment..."
            ></textarea>
          </template>
          <template v-else>
            <p class="mb-0" style="white-space: pre-wrap">
              {{ localTask.commentHR || "—" }}
            </p>
          </template>
        </div>
      </div>
    </div>

    <div class="card mb-4">
      <div class="card-header fw-semibold">Attached Files</div>
      <div class="card-body">
        <template v-if="currentMode === 'edit' && mainView">
          <div class="mb-3">
            <label class="form-label">Add files</label>
            <input
              type="file"
              ref="fileInput"
              class="form-control"
              @change="onFilesSelected"
              multiple
            />
            <small class="text-muted">Max 20 MB per file. Allowed: images, PDF, Office docs, text, zip.</small>
          </div>
          <div v-if="uploading" class="alert alert-info">
            Uploading... {{ uploadProgress }}%
          </div>
        </template>

        <div
          v-if="(!localTask.files || localTask.files.length === 0) && !loadingFiles"
          class="text-muted text-center py-3"
        >
          No files attached
        </div>
        <div v-if="loadingFiles" class="text-center py-3">
          <div class="spinner-border spinner-border-sm" role="status"></div>
          <span class="ms-2">Loading files...</span>
        </div>
        <ul
          v-else-if="localTask.files && localTask.files.length > 0"
          class="list-group"
          style="max-height: 200px; overflow-y: auto"
        >
          <li
            v-for="file in localTask.files"
            :key="file.id"
            class="list-group-item d-flex align-items-center justify-content-between"
          >
            <div class="d-flex align-items-center">
              <i :class="fileIconByMime(file.mime_type) + ' fs-4 me-2'"></i>
              <div>
                <div>{{ file.original_name || file.name }}</div>
                <small class="text-muted">{{ formatFileSize(file.size) }}</small>
              </div>
            </div>
            <div>
              <button
                type="button"
                class="btn btn-sm btn-outline-primary me-1"
                @click="downloadFile(file)"
                title="Download"
              >
                <i class="bi bi-download"></i>
              </button>
              <button
                v-if="currentMode === 'edit' && mainView"
                type="button"
                class="btn btn-sm btn-outline-danger"
                @click="deleteFile(file)"
                title="Delete"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="d-flex justify-content-between mt-4 mb-3">
      <div>
        <button
          v-if="lookAsHR && mainView && task.id"
          class="btn btn-danger"
          type="button"
          @click="handleDelete"
        >
          <i class="bi bi-trash me-1"></i> Delete
        </button>
      </div>

      <div v-if="currentMode === 'edit'">
        <button
          class="btn btn-secondary me-2"
          type="button"
          @click="$emit('close')"
        >
          <i class="bi bi-x-lg me-1"></i> Cancel
        </button>
        <button class="btn btn-success" type="submit" :disabled="!isFormValid">
          <i class="bi bi-check-lg me-1"></i> Save
        </button>
      </div>
      <div v-else>
        <button class="btn btn-secondary" type="button" @click="$emit('close')">
          <i class="bi bi-x-lg me-1"></i> Close
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import MarkdownIt from "markdown-it";
import { useApiStore } from '../stores/api';

const md = new MarkdownIt();

export default {
  props: {
    task: { type: Object, required: true },
    mainView: { type: Boolean, default: false },
    lookAsHR: { type: Boolean, default: false },
  },
  data() {
    return {
      currentMode: "view",
      localTask: this.normalizeTask(this.task),
      teamSearchQuery: '',
      employeeSearchQuery: '',
      showTeamResults: false,
      showEmployeeResults: false,
      availableTeams: [],
      availableEmployees: [],
      loadingTeams: false,
      loadingEmployees: false,
      loadingFiles: false,
      uploading: false,
      uploadProgress: 0,
    };
  },
  async mounted() {
    await this.loadTeamsAndEmployees();
    if (this.task.id) {
      await this.loadFiles();
    }
  },
  computed: {
    isFormValid() {
      // Simplification of validity check, adjust as needed
      return (
        this.localTask.title &&
        this.localTask.content &&
        this.localTask.label &&
        (this.mainView || this.localTask.status) // Status is required only if not mainView
      );
    },
    selectedTeams() {
      if (!this.localTask.members) return [];
      // Teams are identified by their ID structure (e.g., starting with 't')
      return this.localTask.members.filter(m => m.id && String(m.id).startsWith('t'));
    },
    selectedEmployees() {
      if (!this.localTask.members) return [];
      // Employees are identified by their ID structure (e.g., starting with 'e' or being purely numeric if IDs are integers)
      // Assuming employee IDs start with 'e' or are numeric, and team IDs start with 't'
      return this.localTask.members.filter(m => m.id && String(m.id).startsWith('e'));
    },
    filteredTeams() {
      if (!this.teamSearchQuery.trim()) return this.availableTeams;
      const query = this.teamSearchQuery.toLowerCase();
      return this.availableTeams.filter(team => 
        team.name.toLowerCase().includes(query) &&
        !this.selectedTeams.some(selected => selected.id === team.id)
      );
    },
    filteredEmployees() {
      if (!this.employeeSearchQuery.trim()) return this.availableEmployees;
      const query = this.employeeSearchQuery.toLowerCase();
      return this.availableEmployees.filter(employee => 
        employee.name.toLowerCase().includes(query) &&
        !this.selectedEmployees.some(selected => selected.id === employee.id)
      );
    },
  },
  methods: {
    toggleMode() {
      this.currentMode = this.currentMode === "view" ? "edit" : "view";
    },
    async loadTeamsAndEmployees() {
      const apiStore = useApiStore();
      
      try {
        this.loadingTeams = true;
        const teams = await apiStore.getTeams();
        this.availableTeams = teams.map(team => ({
          id: String(team.id).startsWith('t') ? team.id : `t${team.id}`, // Ensure team ID format consistency
          name: team.team_name || team.name
        }));
      } catch (error) {
        console.error('Failed to load teams:', error);
        this.availableTeams = [];
      } finally {
        this.loadingTeams = false;
      }

      try {
        this.loadingEmployees = true;
        const employees = await apiStore.getEmployees();
        this.availableEmployees = employees.map(emp => ({
          id: String(emp.id).startsWith('e') ? emp.id : `e${emp.id}`, // Ensure employee ID format consistency
          name: `${emp.firstname} ${emp.lastname}`
        }));
      } catch (error) {
        console.error('Failed to load employees:', error);
        this.availableEmployees = [];
      } finally {
        this.loadingEmployees = false;
      }
    },
    addMember(member) {
      if (!this.localTask.members) {
        this.localTask.members = [];
      }
      // Check if member is already added
      const exists = this.localTask.members.some(m => m.id === member.id);
      if (!exists) {
        this.localTask.members.push({ ...member });
      }
      // Clear search and hide results
      if (String(member.id).startsWith('t')) {
        this.teamSearchQuery = '';
        this.showTeamResults = false;
      } else {
        this.employeeSearchQuery = '';
        this.showEmployeeResults = false;
      }
    },
    removeMember(memberId) {
      if (this.localTask.members) {
        this.localTask.members = this.localTask.members.filter(m => m.id !== memberId);
      }
    },
    // FIX APPLIQUÉE ICI : Augmenter le délai pour éviter le conflit blur/mousedown
    hideTeamResultsDelayed() {
      setTimeout(() => {
        this.showTeamResults = false;
      }, 400); 
    },
    // FIX APPLIQUÉE ICI : Augmenter le délai pour éviter le conflit blur/mousedown
    hideEmployeeResultsDelayed() {
      setTimeout(() => {
        this.showEmployeeResults = false;
      }, 400); 
    },
    handleSave() {
      // Ensure members list contains only IDs for submission if the backend expects it
      // For this example, we save the full object list
      if (this.isFormValid) {
        this.$emit("save", this.localTask);
        this.currentMode = "view";
      }
    },
    handleDelete() {
      if (!this.task.id) return;
      
      const confirmDelete = confirm(
        `Are you sure you want to delete "${this.task.title}"?\n\nThis action cannot be undone.`
      );
      
      if (confirmDelete) {
        this.$emit("delete", this.task.id);
      }
    },
    renderMarkdown(text) {
      return text ? md.render(text) : "";
    },
    normalizeTask(task) {
      if (!task) return { files: [], members: [] };
      
      let members = [];
      
      // Add employees from the members array
      if (Array.isArray(task.members)) {
        members = task.members.map(emp => ({
          id: String(emp.id).startsWith('e') ? emp.id : `e${emp.id}`, // Ensure ID starts with 'e'
          name: emp.firstname && emp.lastname ? `${emp.firstname} ${emp.lastname}` : emp.name || emp.id,
          status: emp.status
        }));
      }
      
      // Add teams from the teams array
      if (Array.isArray(task.teams)) {
        const teamMembers = task.teams.map(team => ({
          id: String(team.id).startsWith('t') ? team.id : `t${team.id}`, // Ensure ID starts with 't'
          name: team.team_name || team.name || team.id
        }));
        members = [...members, ...teamMembers];
      }
      
      const copy = {
        ...task,
        files: Array.isArray(task.files) ? [...task.files] : [],
        members: members,
      };
      if (copy.start_date)
        copy.start_date = this.normalizeDateForInput(copy.start_date);
      if (copy.end_date)
        copy.end_date = this.normalizeDateForInput(copy.end_date);
      return copy;
    },
    normalizeDateForInput(val) {
      if (!val) return "";
      if (typeof val === "string") {
        const match = val.match(/^(\d{4}-\d{2}-\d{2})/);
        if (match) return match[1];
      }
      const d = new Date(val);
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    },
    fileIcon(type) {
      switch (type) {
        case "docx":
          return "bi bi-file-word text-primary";
        case "pptx":
          return "bi bi-filetype-ppt text-danger";
        case "xlsx":
          return "bi bi-file-earmark-excel text-success";
        case "pdf":
          return "bi bi-file-pdf text-danger";
        case "jpg":
          return "bi bi-file-image text-warning";
        default:
          return "bi bi-file-earmark";
      }
    },
    fileIconByMime(mime) {
      if (!mime) return "bi bi-file-earmark";
      if (mime.startsWith('image/')) return "bi bi-file-image text-warning";
      if (mime === 'application/pdf') return "bi bi-file-pdf text-danger";
      if (mime.includes('word')) return "bi bi-file-word text-primary";
      if (mime.includes('excel') || mime.includes('spreadsheet')) return "bi bi-file-earmark-excel text-success";
      if (mime.includes('powerpoint') || mime.includes('presentation')) return "bi bi-filetype-ppt text-danger";
      if (mime.startsWith('text/')) return "bi bi-file-text";
      if (mime.includes('zip')) return "bi bi-file-zip";
      return "bi bi-file-earmark";
    },
    formatFileSize(bytes) {
      if (!bytes) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    },
    async loadFiles() {
      if (!this.task.id) return;
      const apiStore = useApiStore();
      try {
        this.loadingFiles = true;
        const files = await apiStore.getFilesByCompetence(this.task.id);
        this.localTask.files = files;
      } catch (error) {
        console.error('Failed to load files:', error);
        this.localTask.files = [];
      } finally {
        this.loadingFiles = false;
      }
    },
    async onFilesSelected(event) {
      const selected = Array.from(event.target.files || []);
      if (selected.length === 0 || !this.task.id) return;

      const apiStore = useApiStore();
      this.uploading = true;
      this.uploadProgress = 0;

      try {
        for (let i = 0; i < selected.length; i++) {
          const file = selected[i];
          this.uploadProgress = Math.round(((i + 1) / selected.length) * 100);
          
          const uploaded = await apiStore.uploadFile(this.task.id, file);
          
          // Add to local list
          if (!this.localTask.files) this.localTask.files = [];
          this.localTask.files.push(uploaded);
        }
        
        // Clear file input
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = null;
        }
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed: ' + (error.message || 'Unknown error'));
      } finally {
        this.uploading = false;
        this.uploadProgress = 0;
      }
    },
    async downloadFile(file) {
      if (!file.id) return;
      const apiStore = useApiStore();
      try {
        const blob = await apiStore.downloadFile(file.id);
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.original_name || file.name || 'download';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed: ' + (error.message || 'Unknown error'));
      }
    },
    async deleteFile(file) {
      if (!file.id) return;
      
      const confirm = window.confirm(`Delete "${file.original_name || file.name}"?`);
      if (!confirm) return;

      const apiStore = useApiStore();
      try {
        await apiStore.deleteFile(file.id);
        // Remove from local list
        if (this.localTask.files) {
          this.localTask.files = this.localTask.files.filter(f => f.id !== file.id);
        }
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Delete failed: ' + (error.message || 'Unknown error'));
      }
    },
    removeFile(file) {
      // Legacy method - now handled by deleteFile
      this.deleteFile(file);
    },
  },
  watch: {
    task(newTask) {
      this.localTask = this.normalizeTask(newTask);
    },
  },
};
</script>

<style scoped>
.form-label {
  font-weight: 600;
  font-style: italic;
  text-decoration: underline;
}
.card {
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.card-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.hover-bg-light:hover {
  background-color: #f8f9fa;
}
</style>