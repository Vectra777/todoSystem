export function createCompetence(data = {}) {
  console.log('Creating competence with data:', data)
  console.log(data.content === undefined ? 'content is undefined' : `content: ${data.content}`)
  


  return {
    id: data.id ?? null,
    title: data.title ?? 'Untitled',
    content: data.content ?? '',
    progress: typeof data.progress === 'number' ? data.progress : 0,
    label: data.label ?? '',
    start_date: data.start_date ?? null,
    end_date: data.end_date ?? null,
    status: data.status ?? 'to do',
    files: data.files ?? []
  }
}
