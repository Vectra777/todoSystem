import { defineStore } from "pinia";
import { createCompetence } from "../models/competence";

const STORAGE_KEY = "todo-local-tasks";

const defaultTasks = [
  createCompetence({
    id: 1,
    title: "Welcome tour",
    content: "# 🧭 Welcome Tour\n\n**Objective:** Get familiar with the internal dashboard and its key features.\n\n---\n\n## Overview\nWelcome to the [Company Name] workspace! This short onboarding task will guide you through:\n1. Navigating the dashboard\n2. Using filters and views\n3. Accessing your personal tasks and documents\n\n---\n\n## Steps\n- ✅ Open the **Dashboard** tab.\n- 🔍 Explore **Filters** (by status, department, or due date).\n- 📂 Review a few sample **tasks** to understand the structure.\n- 💬 Ask your manager if something looks unclear.\n\n---\n\n## Expected Outcome\nAfter this tour, you should be able to:\n- Navigate all key sections of the platform\n- Find documents, deadlines, and project owners quickly\n- Understand your team’s active priorities\n\n---\n\n_Once completed, mark this task as **Done** in the dashboard._",
    progress: 25,
    label: "Onboarding",
    status: "to do",
    start_date: "2025-09-30",
    end_date: "2025-10-15",
    members: [{name:"Alexis",id:"e1"},{name: "Valentin",id:"e2"},{name:"Team dev",id:"t1"}]
  }),

  createCompetence({
    id: 2,
    title: "Draft policy update",
    content: "# 📝 Draft: Internal Policy Update\n\n**Policy ID:** POL-2025-001  \n**Draft Date:** 28/10/2025  \n**Prepared by:** John Smith  \n**Version:** 0.1 (Draft)\n\n---\n\n## Purpose\nThis task involves drafting an updated version of the company’s **Internal HR Policy**, ensuring it complies with the new data protection laws and modern work guidelines.\n\n---\n\n## Scope\nApplies to:\n- All full-time and part-time employees\n- Contractors with access to internal systems\n- Department heads responsible for compliance\n\n---\n\n## Policy Summary\n[Company Name] commits to maintaining a fair, transparent, and compliant work environment. The new version of the policy introduces clear sections on **remote work**, **conflict of interest**, and **data security**.\n\n---\n\n## Responsibilities\n| Role | Responsibility |\n|------|----------------|\n| Employees | Follow the guidelines and report violations |\n| Managers | Monitor adherence and support staff understanding |\n| HR | Communicate updates and organize awareness sessions |\n| Compliance Officer | Validate compliance and record audit results |\n\n---\n\n## Key Updates\n1. Added detailed section on **remote work security**\n2. Clarified procedure for **incident reporting**\n3. Updated definitions of key terms\n4. Simplified approval workflow between HR and Compliance\n\n---\n\n## Procedure\n1. Draft policy updates collaboratively on shared document.  \n2. Review by HR & Compliance.  \n3. Approval by management.  \n4. Communicate updates company-wide and provide training.\n\n---\n\n## References\n- EU General Data Protection Regulation (GDPR)  \n- Internal Work-from-Home Guidelines (2023)  \n- Employee Code of Conduct\n\n---\n\n## Revision History\n| Version | Date | Author | Changes |\n|----------|------|--------|----------|\n| 0.1 | 28/10/2025 | John Smith | Initial draft |\n| 0.2 | 05/11/2025 | Mary Johnson | Added compliance section |\n\n---\n\n_**Note:** This draft is under review. Please submit feedback by 10/11/2025._",
    progress: 60,
    label: "HR",
    status: "doing",
    start_date: "2025-09-20",
    end_date: "2025-10-10",
    files: [
      { name: "Rapport_annuel_2025.docx", type: "docx", id: 1 },
      { name: "Présentation_projet.pptx", type: "pptx", id: 2 },
      { name: "Données_budget.xlsx", type: "xlsx", id: 3 },
      { name: "Compte_rendu.pdf", type: "pdf",  id: 4 },
      { name: "Photo_reunion.jpg", type: "jpg", id: 5},
    ],
  }),

  createCompetence({
    id: 3,
    title: "Launch comms campaign",
    content: "# 🚀 Launch Communications Campaign\n\n**Campaign ID:** COMMS-2025-004  \n**Launch Date:** 05/09/2025  \n**Owner:** Marketing Department  \n**Version:** 1.0 (Released)\n\n---\n\n## Objective\nCoordinate the internal and external communication efforts for the **Autumn Product Launch** campaign. Ensure consistent messaging across all channels.\n\n---\n\n## Channels\n- 📧 Email announcements (internal & client mailing lists)\n- 💬 Social media posts (LinkedIn, X, Instagram)\n- 📰 Press release\n- 🖥️ Intranet banner update\n\n---\n\n## Key Deliverables\n| Deliverable | Owner | Status |\n|--------------|--------|---------|\n| Campaign brief | Comms Lead | ✅ Done |\n| Design assets | Design Team | ✅ Done |\n| Internal announcement | HR | ✅ Done |\n| External press release | PR | 🚀 Live |\n\n---\n\n## Checklist\n- [x] Validate campaign message tone and visuals\n- [x] Coordinate with Sales for launch alignment\n- [x] Ensure all social media posts are scheduled\n- [ ] Monitor engagement metrics and adjust copy\n\n---\n\n## Metrics to Track\n- Email open rate (%)  \n- Click-through rate (CTR)  \n- Social engagement (likes/comments/shares)  \n- Press mentions\n\n---\n\n## Lessons Learned\nPost-launch debrief scheduled for **10/09/2025** to analyze metrics, gather feedback, and identify process improvements.\n\n---\n\n_**Status:** Campaign completed successfully — awaiting performance report._",
    progress: 90,
    label: "Operations",
    status: "finished",
    start_date: "2025-08-15",
    end_date: "2025-09-05",
    files: [
      { name: "Rapport_annuel_2025.docx", type: "docx", id: 6 },
      { name: "Présentation_projet.pptx", type: "pptx", id: 7 },
      { name: "Données_budget.xlsx", type: "xlsx", id: 8 },
      { name: "Compte_rendu.pdf", type: "pdf", id: 9 },
      { name: "Photo_reunion.jpg", type: "jpg", id: 10 },
    ],
  }),

  createCompetence({
    id: 4,
    title: "Q4 Performance Reviews",
    content: "# 📊 Q4 Performance Reviews\n\n**Review Period:** November 2025  \n**Owner:** HR Department  \n\n---\n\n## Objective\nConduct comprehensive performance reviews for all team members before year-end.\n\n---\n\n## Timeline\n- Week 1-2: Schedule individual meetings\n- Week 3-4: Conduct reviews and gather feedback\n\n---\n\n## Key Activities\n- Review individual KPIs and achievements\n- Discuss career development goals\n- Identify training needs for next quarter",
    progress: 30,
    label: "HR",
    status: "doing",
    start_date: "2025-11-01",
    end_date: "2025-11-30",
  }),

  createCompetence({
    id: 5,
    title: "Holiday Season Marketing",
    content: "# 🎄 Holiday Season Marketing Campaign\n\n**Campaign Period:** November - December 2025  \n**Owner:** Marketing Team  \n\n---\n\n## Overview\nPrepare and launch holiday-themed marketing materials across all channels.\n\n---\n\n## Deliverables\n- Email templates\n- Social media content calendar\n- Website banner updates\n- Special promotions strategy",
    progress: 15,
    label: "Marketing",
    status: "to do",
    start_date: "2025-11-05",
    end_date: "2025-12-20",
  }),

  createCompetence({
    id: 6,
    title: "Security Audit",
    content: "# 🔒 Annual Security Audit\n\n**Audit Date:** Mid-November 2025  \n**Owner:** IT Security Team  \n\n---\n\n## Scope\n- Review access controls\n- Check security protocols\n- Update security documentation\n- Test incident response procedures",
    progress: 0,
    label: "IT",
    status: "to do",
    start_date: "2025-11-15",
    end_date: "2025-11-15",
  }),
];


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
  }),
  getters: {
    tasks: (state) => state.items,
    byStatus: (state) => (status) =>
      state.items.filter((task) => task.status === status),
  },
  actions: {
    initialize() {
      if (this.initialized || this.loading) return;
      this.loading = true;
      try {
        const stored = readStorage();
        if (stored.length) {
          this.items = normalizeTasks(defaultTasks);

        } else {
          this.items = normalizeTasks(defaultTasks);
          writeStorage(this.items);
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
    refresh() {
      this.initialized = false;
      this.initialize();
    },
    saveSnapshot() {
      writeStorage(this.items);
    },
    async moveTask({ id, toStatus }) {
      const index = this.items.findIndex(
        (task) => String(task.id) === String(id)
      );
      if (index === -1) throw new Error("Task not found");
      const previous = { ...this.items[index] };
      this.items[index].status = toStatus;
      this.saveSnapshot();
      return { previous };
    },
    restoreTask(id, snapshot) {
      const index = this.items.findIndex(
        (task) => String(task.id) === String(id)
      );
      if (index === -1) return;
      this.items[index] = { ...snapshot };
      this.saveSnapshot();
    },

    createTask(newTaskData) {
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
    },

    updateTask(id, partial) {
      const index = this.items.findIndex(
        (task) => String(task.id) === String(id)
      );
      if (index === -1) throw new Error("Task not found");
      this.items[index] = {
        ...this.items[index],
        ...partial,
        id: this.items[index].id,
      };
      this.saveSnapshot();
      return this.items[index];
    },
  },
});