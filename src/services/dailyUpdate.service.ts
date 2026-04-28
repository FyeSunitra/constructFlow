import { http } from "@/lib/apiClient"
import type { DailyUpdatePayload } from "@/types/dailyUpdate"

export const dailyUpdateService = {
    async getAll(projectId: string) {
        return http.get(`/projects/${projectId}/daily-updates`)
    },

    async create(projectId: string, payload: DailyUpdatePayload) {
        return http.post(`/projects/${projectId}/daily-updates`, payload)
    },

    async uploadImages(projectId: string, updateId: string, files: File[]) {
        const fd = new FormData()
        files.forEach(f => fd.append('files', f))
        return http.post(`/projects/${projectId}/daily-updates/${updateId}/images`, fd, true)
    },

    async update(projectId: string, updateId: string, payload: DailyUpdatePayload) {
        return http.patch(`/projects/${projectId}/daily-updates/${updateId}`, payload)
    },
}