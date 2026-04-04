export type UserRole = 'CEO' | 'Engineer'
 
export interface User {
  id:         number
  username:   string
  email:      string
  first_name: string
  last_name:  string
  role:       UserRole
  is_active:  boolean
  created_at: string
}
 
export interface UserForm {
  username:   string
  email:      string
  first_name: string
  last_name:  string
  role:       UserRole | null
  password:   string
  is_active:  boolean
}
 
export interface RoleOption {
  value:   UserRole
  label:   string
  desc:    string
  icon:    string
  bg:      string
  color:   string
}
 
export const ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'CEO',
    label: 'CEO',
    desc:  'เข้าถึงได้ทุกส่วน',
    icon:  'lucide:star',
    bg:    '#E6F1FB',
    color: '#185FA5',
  },
  {
    value: 'Engineer',
    label: 'Engineer',
    desc:  'อัปเดตงานและ daily',
    icon:  'lucide:hard-hat',
    bg:    '#EAF3DE',
    color: '#3B6D11',
  },
]