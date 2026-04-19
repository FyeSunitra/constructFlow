import { http } from '@/lib/apiClient'
import type { CheckpointStatus } from '@/types/checkpoint'

export const checkpointService = {
    async update(id: string, payload: { status: CheckpointStatus; note_text: string }) {
        return http.patch(`/checkpoints/${id}`, payload)
    }
}