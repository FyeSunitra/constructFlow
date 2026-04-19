export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'DELAYED' | 'COMPLETED'
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

export interface ProjectEngineer {
  id: string
  first_name: string
  last_name: string
  username: string
  email: string
}

export interface ProjectAssignment {
  id: string
  project_id: string
  engineer_id: string
  assigned_at: string
  is_active: boolean
  engineer: ProjectEngineer
}

export interface ProjectCheckpoint {
  id: string
  phase_id: string
  name: string
  note_text: string | null
  image_url: string | null
  status: TaskStatus
  started_at: string | null
  completed_at: string | null
  order_index: number
  is_active: boolean
  created_at: string
}

export interface ProjectPhase {
  id: string
  project_id: string
  name: string
  status: TaskStatus
  order_index: number
  start_date: string | null
  end_date: string | null
  budget_estimate: string
  actual_cost: string
  is_active: boolean
  created_at: string
  checkpoints: ProjectCheckpoint[]
}

export interface ProjectDetail {
  id: string
  template_id: string | null
  name: string
  description: string
  status: ProjectStatus
  start_date: string | null
  end_date: string | null
  owner_name: string | null
  is_active: boolean
  created_at: string
  phases: ProjectPhase[]
  assignments: ProjectAssignment[]
  progress_percentage: number
}

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