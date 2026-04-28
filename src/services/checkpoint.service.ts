import { http } from '@/lib/apiClient'
import type { CheckpointStatus } from '@/types/checkpoint'

export const checkpointService = {
    async update(
        projectId: string,
        phaseId: string,
        checkpointId: string,
        payload: { status: CheckpointStatus; note_text: string }
    ) {
        return http.patch(
            `/projects/${projectId}/phases/${phaseId}/checkpoints/${checkpointId}`,
            payload
        )
    },

    async getLogs(projectId: string, phaseId: string, checkpointId: string) {
        return http.get(
            `/projects/${projectId}/phases/${phaseId}/checkpoints/${checkpointId}/logs`
        )
    },

    async uploadImages(
        projectId: string,
        phaseId: string,
        checkpointId: string,
        files: File[]
    ) {
        const fd = new FormData()
        files.forEach(f => fd.append('files', f))
        return http.post(
            `/projects/${projectId}/phases/${phaseId}/checkpoints/${checkpointId}/images`,
            fd,
            true
        )
    }
}