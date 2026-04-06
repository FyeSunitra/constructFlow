import { http } from "@/lib/apiClient"
import type { ListResponse } from "@/types/pagination"
import type { CreateProjectPayload, Project } from "@/types/project"
import type { Query } from "@/types/query"
import { buildQueryString } from "@/utils/query"

export const projectService = {
  async getAll(params: Query = {}): Promise<ListResponse<Project>> {
    const query = buildQueryString({
      page: params.page,
      limit: params.limit,
      joinTable: params.joinTable,
      is_active: params.is_active,
      searchKeyword: params.searchKeyword,
      status: params.status,
    })
    return http.get(`/projects${query}`)
  },

  async getOne(id: string) {
    return http.get(`/projects/${id}`)
  },

  async create(payload: CreateProjectPayload) {
    return http.post('/projects', payload)
  },

  async update(id: string, payload: Partial<CreateProjectPayload>) {
    return http.patch(`/projects/${id}`, payload)
  },

  async remove(id: string) {
    return http.del(`/projects/${id}`)
  },

  /** Upload documents after project is created — call when API is ready */
  //   async uploadDocuments(projectId: string, files: File[]) {
  //     const fd = new FormData()
  //     files.forEach(f => fd.append('files', f))
  //     return http.post(`/projects/${projectId}/documents`, fd, {
  //       headers: { 'Content-Type': 'multipart/form-data' },
  //     })
  //   },
}