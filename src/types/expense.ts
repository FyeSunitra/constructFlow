export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface ExpenseRequest {
    id: string
    project_id: string
    phase_id: string
    requester_id: string
    requester: { id: string; first_name: string; last_name: string }
    amount: number
    description: string
    status: ExpenseStatus
    approved_by: string | null
    approved_at: string | null
    rejected_by: string | null
    rejected_at: string | null
    reviewer_note: string | null
    created_at: string
    // attachments — handled separately (mock)
    documents: { name: string; size: string }[]
}

export const EXPENSE_STATUS_META: Record<ExpenseStatus, { label: string; color: string; bg: string }> = {
    PENDING: { label: 'รออนุมัติ', color: '#854F0B', bg: '#FAEEDA' },
    APPROVED: { label: 'อนุมัติแล้ว', color: '#085041', bg: '#E1F5EE' },
    REJECTED: { label: 'ปฏิเสธ', color: '#791F1F', bg: '#FCEBEB' },
}