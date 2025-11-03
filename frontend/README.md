# Todo System Frontend

This Vite-powered Vue 3 SPA drives the Todo System dashboard experience. It ships with Bootstrap styling, multiple task visualization modes, and a dark/light toggle.

## Quick start

```bash
npm install
npm run dev
```

For a production bundle run:

```bash
npm run build
```

## Key architecture notes

- **State management:** Built with [Pinia](https://pinia.vuejs.org/) stores. `useThemeStore` controls the global `data-bs-theme` attribute and syncs preferences to `localStorage`. `useTasksStore` centralizes the read-only dashboard task data with light persistence and sample seed data that feed both the employee and HR dashboards. `useUserStore` tracks the signed-in identity/role (admin vs. employee) so navigation and restricted areas can adapt automatically.
- **Views:** The dashboard exposes Kanban, List, and Calendar modules that render a shared `CompetenceCard` component.
- **Styling:** Bootstrap 5.3 + Bootstrap Icons provide the UI foundation. Custom dark-mode tweaks live in `src/style.css`.

## Manual test checklist

- Toggle the moon button in the header to switch themes (preference persists after reload).
- Visit `/dashboard` and drag competences between columns—the move persists to the next refresh.
