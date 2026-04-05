import type { PhaseDraft, Template, TemplateForm } from "@/types/template"

/** Convert form drafts → API payload */
export function buildPayload(form: TemplateForm) {
  return {
    name:        form.name,
    description: form.description,
    phases:      form.phases.map((p, i) => ({
      name:             p.name,
      order_index:      i + 1,
      start_offset_day: 0,
      duration_days:    0,
      budget_estimate:  p.budget_estimate,
      checkpoints:      p.checkpoints
        .filter(c => c.name.trim())
        .map((c, j) => ({ name: c.name, order_index: j + 1 })),
    })),
  }
}
 
/** Convert a Template back → editable form drafts */
export function templateToForm(t: Template): TemplateForm {
  return {
    name:        t.name,
    description: t.description,
    phases:      t.phases.map(p => ({
      name:            p.name,
      budget_estimate: p.budget_estimate,
      checkpoints:     p.checkpoints.map(c => ({ name: c.name })),
    })),
  }
}
 
export function emptyPhaseDraft(): PhaseDraft {
  return { name: '', budget_estimate: 0, checkpoints: [{ name: '' }] }
}
 
export function emptyForm(): TemplateForm {
  return { name: '', description: '', phases: [emptyPhaseDraft()] }
}
 
/** Total checkpoints across all phases */
export function totalCheckpoints(t: Template): number {
  return t.phases.reduce((s, p) => s + p.checkpoints.length, 0)
}
 
/** Total budget across all phases */
export function totalBudget(t: Template): number {
  return t.phases.reduce((s, p) => s + (p.budget_estimate ?? 0), 0)
}