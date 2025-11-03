<template>
  <form
    @submit.prevent="handleSave"
    class="position-fixed top-0 end-0 border-start p-4 bg-body-tertiary shadow"
    style="width: 500px; height: 100vh; z-index: 200000; overflow-y: auto"
  >
    <!-- Header -->
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

    <!-- General Information -->
    <div class="card mb-4">
      <div class="card-header fw-semibold">General Information</div>
      <div class="card-body">
        <!-- Title -->
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

        <!-- Description -->
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

        <!-- Label -->
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

        <!-- Status -->
        <div class="mb-3">
          <label class="form-label">Status</label>
          <template v-if="currentMode === 'edit' && !mainView">
            <select v-model="localTask.status" class="form-select" required>
              <option disabled value="">Select a status</option>
              <option>to do</option>
              <option>doing</option>
              <option>finished</option>
              <option v-if="lookAsHR">validated</option>
            </select>
          </template>
          <template v-else>
            <p class="mb-0">{{ localTask.status || "—" }}</p>
          </template>
        </div>
      </div>
    </div>
    <!-- Add member or team -->
    <div class="card mb-4">
      <div class="card-header fw-semibold">Members</div>
      <div class="card-body">
        <div class="mb-3">
          <template v-if="currentMode === 'edit' && mainView">
            <!-- Teams Section -->
            <div class="mb-4">
              <label class="form-label">Teams</label>
              
              <!-- Selected Teams -->
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

              <!-- Team Search Bar -->
              <div class="position-relative">
                <input 
                  type="text"
                  v-model="teamSearchQuery"
                  @focus="showTeamResults = true"
                  @blur="hideTeamResultsDelayed"
                  class="form-control"
                  placeholder="Search teams..."
                />
                <div 
                  v-if="showTeamResults && filteredTeams.length > 0"
                  class="position-absolute w-100 mt-1 bg-white border rounded shadow-sm"
                  style="max-height: 200px; overflow-y: auto; z-index: 1000;"
                >
                  <div 
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

            <!-- Employees Section -->
            <div>
              <label class="form-label">Employees</label>
              
              <!-- Selected Employees -->
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

              <!-- Employee Search Bar -->
              <div class="position-relative">
                <input 
                  type="text"
                  v-model="employeeSearchQuery"
                  @focus="showEmployeeResults = true"
                  @blur="hideEmployeeResultsDelayed"
                  class="form-control"
                  placeholder="Search employees..."
                />
                <div 
                  v-if="showEmployeeResults && filteredEmployees.length > 0"
                  class="position-absolute w-100 mt-1 bg-white border rounded shadow-sm"
                  style="max-height: 200px; overflow-y: auto; z-index: 1000;"
                >
                  <div 
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
    <!-- Dates -->
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

    <!-- Comments -->
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

    <!-- Files -->
    <div class="card mb-4">
      <div class="card-header fw-semibold">Attached Files</div>
      <div class="card-body">
        <template v-if="currentMode === 'edit' && mainView">
          <div class="mb-3">
            <label class="form-label">Add files</label>
            <input
              type="file"
              class="form-control"
              @change="onFilesSelected"
              multiple
            />
            <small class="text-muted">You can add multiple files.</small>
          </div>
        </template>

        <div
          v-if="!localTask.files || localTask.files.length === 0"
          class="text-muted text-center py-3"
        >
          No files attached
        </div>
        <ul
          v-else
          class="list-group"
          style="max-height: 200px; overflow-y: auto"
        >
          <li
            v-for="(file, index) in localTask.files"
            :key="file.id || file.name || index"
            class="list-group-item d-flex align-items-center"
          >
            <i :class="fileIcon(file.type) + ' fs-4 me-2'"></i>
            <span class="me-2">{{ file.name }}</span>
            <button
              v-if="currentMode === 'edit' && mainView"
              type="button"
              class="btn btn-sm btn-outline-danger ms-auto"
              @click="removeFile(file)"
              aria-label="Remove file"
            >
              <i class="bi bi-trash"></i>
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Actions -->
    <div class="d-flex justify-content-end mt-4 mb-3">
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
      // Mock data - à remplacer par des données du store plus tard
      availableTeams: [
        { id: 't1', name: 'Team Dev' },
        { id: 't2', name: 'Team Marketing' },
        { id: 't3', name: 'Team HR' },
        { id: 't4', name: 'Team Sales' },
      ],
      availableEmployees: [
        { id: 'e1', name: 'Alexis' },
        { id: 'e2', name: 'Valentin' },
        { id: 'e3', name: 'Marie' },
        { id: 'e4', name: 'Sophie' },
        { id: 'e5', name: 'Thomas' },
        { id: 'e6', name: 'Lucas' },
      ],
    };
  },
  computed: {
    isFormValid() {
      return (
        this.localTask.title &&
        this.localTask.content &&
        this.localTask.label &&
        this.localTask.status &&
        this.localTask.files?.length > 0
      );
    },
    selectedTeams() {
      if (!this.localTask.members) return [];
      return this.localTask.members.filter(m => m.id && m.id[0] === 't');
    },
    selectedEmployees() {
      if (!this.localTask.members) return [];
      return this.localTask.members.filter(m => m.id && m.id[0] === 'e');
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
      if (member.id[0] === 't') {
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
    hideTeamResultsDelayed() {
      setTimeout(() => {
        this.showTeamResults = false;
      }, 200);
    },
    hideEmployeeResultsDelayed() {
      setTimeout(() => {
        this.showEmployeeResults = false;
      }, 200);
    },
    handleSave() {
      if (this.isFormValid) {
        this.$emit("save", this.localTask);
        this.currentMode = "view";
      }
    },
    renderMarkdown(text) {
      return text ? md.render(text) : "";
    },
    normalizeTask(task) {
      if (!task) return { files: [], members: [] };
      const copy = {
        ...task,
        files: Array.isArray(task.files) ? [...task.files] : [],
        members: Array.isArray(task.members) ? [...task.members] : [],
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
    onFilesSelected(event) {
      const selected = Array.from(event.target.files || []);
      if (!this.localTask.files) this.localTask.files = [];
      selected.forEach((f) => {
        const ext = (f.name.split(".").pop() || "").toLowerCase();
        this.localTask.files.push({ name: f.name, type: ext });
      });
      event.target.value = null;
    },
    removeFile(file) {
      if (!this.localTask.files) return;
      this.localTask.files = this.localTask.files.filter(
        (f) => f.name !== file.name
      );
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
