export type CheckpointStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

export interface CheckpointUpdatePayload {
    status: CheckpointStatus
    note_text: string
    // image upload handled separately via multipart
}

export const CHECKPOINT_STATUS_META: Record<CheckpointStatus, {
    label: string
    color: string
    bg: string
    border: string
}> = {
    PENDING: {
        label: 'รอดำเนินการ',
        color: '#888780',
        bg: '#F1EFE8',
        border: '#D3D1C7',
    },
    IN_PROGRESS: {
        label: 'กำลังดำเนินการ',
        color: '#854F0B',
        bg: '#FAEEDA',
        border: '#EF9F27',
    },
    COMPLETED: {
        label: 'เสร็จสิ้น',
        color: '#0F6E56',
        bg: '#E1F5EE',
        border: '#1D9E75',
    },
}