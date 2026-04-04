import type { UserRole } from "@/types/user";

export const ROLE_META: Record<UserRole, { type: 'info' | 'success'; label: string }> = {
  CEO:      { type: 'info',    label: 'CEO'      },
  Engineer: { type: 'success', label: 'Engineer' },
}
 
/** Deterministic avatar background from a seed string */
export function avatarBg(seed: string): string {
  const palette = ['#E1F5EE', '#E6F1FB', '#EEEDFE', '#FAEEDA', '#EAF3DE']
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) % palette.length
  return palette[Math.abs(h)]
}
 
/** Deterministic avatar text-color from a seed string */
export function avatarFg(seed: string): string {
  const palette = ['#0F6E56', '#185FA5', '#3C3489', '#854F0B', '#3B6D11']
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) % palette.length
  return palette[Math.abs(h)]
}
 
/** Generate initials (up to 2 chars) from first + last name */
export function getInitials(firstName: string, lastName: string): string {
  return ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase() || '?'
}