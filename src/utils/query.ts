export function buildQueryString(params: Record<string, any>) {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&")

  return query ? `?${query}` : ""
}