import type { CreateProjectPayload, PhaseDraft, ProjectForm, ProjectPhase, ProjectStatus, TaskStatus } from "@/types/project"

export function emptyProjectForm(): ProjectForm {
  return {
    name: '',
    description: '',
    template_id: '',
    start_date: '',
    end_date: '',
    owner_name: '',
    phases: [] as PhaseDraft[],
    assignments: [] as string[],
    _files: [] as File[],
  }
}

export function buildProjectPayload(form: ProjectForm): CreateProjectPayload {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    template_id: form.template_id,
    start_date: form.start_date,
    end_date: form.end_date,
    owner_name: form.owner_name.trim(),
    assignments: form.assignments.map(id => ({ engineer_id: id })),
    phases: form.phases.map((p, i) => ({
      name: p.name.trim(),
      order_index: i + 1,
      budget_estimate: Number(p.budget_estimate ?? 0),
      ...(p.start_date ? { start_date: p.start_date } : {}),
      ...(p.end_date ? { end_date: p.end_date } : {}),
      checkpoints: p.checkpoints
        .filter(c => c.name.trim())
        .map((c, j) => ({ name: c.name.trim(), order_index: j + 1 })),
    })),
  }
}

export const STATUS_META: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  PLANNING: { label: 'Planning', color: '#185FA5', bg: '#E6F1FB' },
  IN_PROGRESS: { label: 'In Progress', color: '#0F6E56', bg: '#E1F5EE' },
  DELAYED: { label: 'Delayed', color: '#A32D2D', bg: '#FCEBEB' },
  COMPLETED: { label: 'Completed', color: '#3B6D11', bg: '#EAF3DE' },
}

export const TASK_STATUS_META: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'รอดำเนินการ', color: '#888780', bg: '#F1EFE8' },
  IN_PROGRESS: { label: 'กำลังดำเนินการ', color: '#0F6E56', bg: '#E1F5EE' },
  COMPLETED: { label: 'เสร็จสิ้น', color: '#3B6D11', bg: '#EAF3DE' },
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export function computeProgress(phases: ProjectPhase[]): number {
  const all = phases.flatMap(p => p.checkpoints)
  if (!all.length) return 0
  const done = all.filter(c => c.status === 'COMPLETED').length
  return Math.round((done / all.length) * 100)
}