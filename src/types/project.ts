export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'DELAYED' | 'COMPLETED'

export interface Project {
  id: string
  template_id: string | null
  name: string
  description: string
  status: ProjectStatus
  start_date: string | null
  end_date: string | null
  owner_name: string
  is_active: boolean
  created_at: string
  _count: {
    phases: number
    assignments: number
  }
}

export interface ProjectCheckpointPayload {
  name: string
  order_index: number
}

export interface ProjectPhasePayload {
  name: string
  order_index: number
  budget_estimate: number
  start_date?: string
  end_date?: string
  checkpoints: ProjectCheckpointPayload[]
}

export interface CreateProjectPayload {
  name: string
  description: string
  template_id: string
  start_date: string
  end_date: string
  owner_name: string
  assignments: { engineer_id: string }[]
  phases: ProjectPhasePayload[]
}

export interface CheckpointDraft {
  name: string
}

export interface PhaseDraft {
  name: string
  order_index: number
  budget_estimate: number
  start_date: string
  end_date: string
  checkpoints: CheckpointDraft[]
}

export interface ProjectForm {
  name: string
  description: string
  template_id: string
  start_date: string
  end_date: string
  owner_name: string
  phases: PhaseDraft[]
  assignments: string[]
  _files: File[]
}