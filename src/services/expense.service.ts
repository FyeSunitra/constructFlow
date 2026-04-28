import { http } from "@/lib/apiClient"
import type { CreateExpensePayload } from "@/types/expense"

export const expenseService = {
    async getAll(projectId: string, status?: string) {
        return http.get(`/projects/${projectId}/expense-requests`, {
            params: status ? { status } : {},
        })
    },

    async getOne(projectId: string, reqId: string) {
        return http.get(`/projects/${projectId}/expense-requests/${reqId}`)
    },

    async create(projectId: string, payload: CreateExpensePayload) {
        return http.post(`/projects/${projectId}/expense-requests`, payload)
    },

    async approve(projectId: string, reqId: string) {
        return http.patch(`/projects/${projectId}/expense-requests/${reqId}/approve`, {})
    },

    async reject(projectId: string, reqId: string, reviewerNote?: string) {
        return http.patch(`/projects/${projectId}/expense-requests/${reqId}/reject`, {
            reviewer_note: reviewerNote,
        })
    },

    async getSummary(projectId: string) {
        return http.get(`/projects/${projectId}/expense-summary`)
    },

    async uploadImages(projectId: string, reqId: string, files: File[]) {
        const fd = new FormData()
        files.forEach(f => fd.append('files', f))
        return http.post(`/projects/${projectId}/expense-requests/${reqId}/images`, fd, true)
    },

    async uploadDocuments(projectId: string, reqId: string, files: File[]) {
        const fd = new FormData()
        files.forEach(f => fd.append('files', f))
        return http.post(`/projects/${projectId}/expense-requests/${reqId}/documents`, fd, true)
    },
}