export interface TemplateCheckpoint {
  name:        string
  order_index: number
}
 
export interface TemplatePhase {
  name:               string
  order_index:        number
  start_offset_day:   number
  duration_days:      number
  budget_estimate:    number
  checkpoints:        TemplateCheckpoint[]
}
 
export interface Template {
  id:          string
  name:        string
  description: string
  phases:      TemplatePhase[]
}

export interface CheckpointDraft {
  name: string
}
 
export interface PhaseDraft {
  name:            string
  budget_estimate: number
  checkpoints:     CheckpointDraft[]
}
 
export interface TemplateForm {
  name:        string
  description: string
  phases:      PhaseDraft[]
}
