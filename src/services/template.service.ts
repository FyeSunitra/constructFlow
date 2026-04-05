import { http } from "@/lib/apiClient"
import type { ListResponse } from "@/types/pagination"
import type { Template, TemplateForm } from "@/types/template"

export const templateService = {
  async createTemplate(payload: TemplateForm) {
    return http.post('/templates/full', payload)
  },

  async getTemplate(): Promise<ListResponse<Template>> {
      const res = await http.get(`/templates`)
      return res as ListResponse<Template>
    },
}