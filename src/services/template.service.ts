import { http } from "@/lib/apiClient"
import type { ListResponse } from "@/types/pagination"
import type { Query } from "@/types/query"
import type { Template, TemplateForm } from "@/types/template"
import { buildQueryString } from "@/utils/query"

export const templateService = {
  async createTemplate(payload: TemplateForm) {
    return http.post('/templates/full', payload)
  },

  async getTemplate(params: Query = {}): Promise<ListResponse<Template>> {
    const query = buildQueryString({
      page: params.page,
      limit: params.limit,
      joinTable: params.joinTable,
      is_active: params.is_active,
      searchKeyword: params.searchKeyword,
    })

    const res = await http.get(`/templates${query}`)
    return res as ListResponse<Template>
  },

  async getOne(id: string) {
    return http.get(`/templates/${id}`)
  },

  async updateTemplate(id: string, payload: Partial<Omit<Template, 'id'>>) {
    return http.patch(`/templates/${id}`, payload)
  },

  async deleteTemplate(id: string) {
    return http.del(`/templates/${id}`)
  },

}