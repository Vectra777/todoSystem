export function createCompetence(data = {}) {
  // Debug logs removed in cleanup

  return {
    id: data.id ?? null,
    title: data.title ?? 'Untitled',
    content: data.content ?? '',
    progress: typeof data.progress === 'number' ? data.progress : 0,
    label: data.label ?? '',
    start_date: data.start_date ?? null,
    end_date: data.end_date ?? null,
    status: data.status ?? 'to do',
    commentEmployee: data.commentEmployee ?? data.employee_review ?? '',
    commentHR: data.commentHR ?? data.hr_review ?? '',
    files: data.files ?? [],
    members: data.members ?? []
  }
}
