export interface Query {
  page?: number
  limit?: number
  joinTable?: boolean
  is_active?: boolean | "all"
  searchKeyword?: string
}