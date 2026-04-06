import { http } from "@/lib/apiClient"
import type { ListResponse } from "@/types/pagination"
import type { Query } from "@/types/query"
import type { User, UserForm, UserRole } from "@/types/user"
import { buildQueryString } from "@/utils/query"

export interface UserQuery extends Query {
  role?: UserRole
}

export const userService = {
  async createUser(payload: UserForm) {
    return http.post('/users', payload)
  },

  async getUsers(params: UserQuery = {}): Promise<ListResponse<User>> {
    const query = buildQueryString({
      page: params.page,
      limit: params.limit,
      joinTable: params.joinTable,
      is_active: params.is_active,
      role: params.role,
      searchKeyword: params.searchKeyword,
    })

    const res = await http.get(`/users${query}`)
    return res as ListResponse<User>
  },
}