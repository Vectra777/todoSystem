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
        <!-- Title -->
        <div class="mb-3">
          <label class="form-label">Add team or member</label>
          <template v-if="currentMode === 'edit' && mainView">
            <input
              v-model="localTask.members"
              class="form-control"
              placeholder="Enter a member or team name"
            />
          </template>
          <template v-else>
            <ul>
              <li v-for="(member, i) in localTask.members" :key="i" class="mb-0">
                {{ member.name || "—" }}
              </li>
            </ul>
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
  },
  methods: {
    toggleMode() {
      this.currentMode = this.currentMode === "view" ? "edit" : "view";
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
      if (!task) return { files: [] };
      const copy = {
        ...task,
        files: Array.isArray(task.files) ? [...task.files] : [],
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
</style>
