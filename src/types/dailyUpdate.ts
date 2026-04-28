export interface DailyUpdateItem {
    id: string
    date: string
    engineer_id: string
    engineer: {
        id: string
        first_name: string
        last_name: string
    }
    work_done: string
    issues: string | null
    images: { id: string; url: string }[]
    created_at: string
}

export interface DailyUpdatePayload {
    work_done: string
    issues?: string
}
