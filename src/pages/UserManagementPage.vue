<script lang="ts">
export default { name: 'UserManagementPage' }
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NButton, NInput, NSelect, NEmpty, useMessage } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { type User, type UserForm, type UserRole } from '@/types/user'
import App from '@/App.vue';

// ─── State ────────────────────────────────────────────────────────────────────

const message = useMessage()
const showModal = ref(false)
const editingUser = ref<User | null>(null)
const search = ref('')
const filterRole = ref<UserRole | 'all'>('all')
const currentPage = ref(1)
const PAGE_SIZE = 8

let nextId = 6

const users = ref<User[]>([
    { id: 1, username: 'admin001', email: 'admin@pbt.co.th', first_name: 'สมชาย', last_name: 'ใจดี', role: 'CEO', is_active: true, created_at: '2025-01-10' },
    { id: 2, username: 'naree.k', email: 'naree@pbt.co.th', first_name: 'นารี', last_name: 'กล้าหาญ', role: 'Engineer', is_active: true, created_at: '2025-02-14' },
    { id: 3, username: 'wanchai.p', email: 'wanchai@pbt.co.th', first_name: 'วันชัย', last_name: 'พงศ์ดี', role: 'Engineer', is_active: true, created_at: '2025-03-01' },
    { id: 4, username: 'siriporn.t', email: 'siriporn@pbt.co.th', first_name: 'ศิริพร', last_name: 'ทองดี', role: 'CEO', is_active: false, created_at: '2025-03-15' },
    { id: 5, username: 'krit.s', email: 'krit@pbt.co.th', first_name: 'กฤต', last_name: 'สมบูรณ์', role: 'Engineer', is_active: true, created_at: '2025-04-02' },
])

// ─── Computed ─────────────────────────────────────────────────────────────────

const filteredUsers = computed(() => {
    const q = search.value.toLowerCase()
    currentPage.value = 1
    return users.value.filter(u => {
        const matchRole = filterRole.value === 'all' || u.role === filterRole.value
        const matchSearch = !q || [u.username, u.email, u.first_name, u.last_name]
            .some(s => s.toLowerCase().includes(q))
        return matchRole && matchSearch
    })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / PAGE_SIZE)))
const pagedUsers = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filteredUsers.value.slice(start, start + PAGE_SIZE)
})

const stats = computed(() => ({
    total: users.value.length,
    active: users.value.filter(u => u.is_active).length,
    ceo: users.value.filter(u => u.role === 'CEO').length,
    engineer: users.value.filter(u => u.role === 'Engineer').length,
}))

// ─── Actions ──────────────────────────────────────────────────────────────────

function openCreate() {
    editingUser.value = null
    showModal.value = true
}

function openEdit(user: User) {
    editingUser.value = { ...user }
    showModal.value = true
}

function toggleActive(user: User) {
    const target = users.value.find(u => u.id === user.id)
    if (!target) return
    target.is_active = !target.is_active
    message.success(`${target.is_active ? 'เปิด' : 'ปิด'}การใช้งาน ${target.first_name} แล้ว`)
}

function deleteUser(user: User) {
    users.value = users.value.filter(u => u.id !== user.id)
    message.success('ลบผู้ใช้งานเรียบร้อย')
}

function onSaved(form: UserForm, id: number | null) {
    if (id !== null) {
        const idx = users.value.findIndex(u => u.id === id)
        if (idx > -1) {
            users.value[idx] = {
                ...users.value[idx],
                username: form.username,
                email: form.email,
                first_name: form.first_name,
                last_name: form.last_name,
                role: form.role!,
                is_active: form.is_active,
            }
        }
        message.success('บันทึกข้อมูลเรียบร้อย')
    } else {
        users.value.unshift({
            id: nextId++,
            username: form.username,
            email: form.email,
            first_name: form.first_name,
            last_name: form.last_name,
            role: form.role!,
            is_active: form.is_active,
            created_at: new Date().toISOString().split('T')[0],
        })
        message.success('สร้างผู้ใช้งานสำเร็จ')
    }
}
</script>

<template>
    <div class="flex h-screen overflow-hidden">
        <AppSidebar />

        <div class="flex-1 flex flex-col overflow-hidden bg-gray-50">
            <header class="shrink-0 bg-white border-b border-gray-100 px-6 py-3">
                <AppBreadcrumb />
            </header>


            <main class="flex-1 overflow-y-auto p-6 space-y-6">
                <!-- Page header -->
                <div class="flex items-start justify-between mb-6">
                    <div>
                        <h1 class="text-lg font-medium text-gray-900 mb-0.5">จัดการผู้ใช้งาน</h1>
                        <p class="text-sm text-gray-400">เพิ่ม แก้ไข และจัดการสิทธิ์ผู้ใช้ทั้งหมด</p>
                    </div>
                    <NButton type="primary" style="background:#0F6E56;border:none" @click="openCreate">
                        <template #icon>
                            <Icon icon="lucide:user-plus" style="width:15px;height:15px" />
                        </template>
                        เพิ่มผู้ใช้งาน
                    </NButton>
                </div>

                <!-- Table card -->
                <div class="rounded-xl border bg-white overflow-hidden" style="border:0.5px solid #E3E1D8">

                    <!-- Toolbar -->
                    <div class="flex items-center gap-3 px-4 py-3" style="border-bottom:0.5px solid #F1EFE8">
                        <NInput v-model:value="search" placeholder="ค้นหาชื่อ, username, อีเมล..." clearable
                            style="max-width:280px">
                            <template #prefix>
                                <Icon icon="lucide:search" style="width:14px;height:14px;color:#B4B2A9" />
                            </template>
                        </NInput>

                        <NSelect v-model:value="filterRole" :options="[
                            { label: 'ทุก Role', value: 'all' },
                            { label: 'CEO', value: 'CEO' },
                            { label: 'Engineer', value: 'Engineer' },
                        ]" style="width:140px" />

                        <span class="ml-auto text-xs text-gray-400">
                            {{ filteredUsers.length }} รายการ
                        </span>
                    </div>

                    <!-- Table -->
                    <table style="width:100%;border-collapse:collapse">
                        <thead>
                            <tr style="border-bottom:0.5px solid #F1EFE8;background:#FAFAF9">
                                <th
                                    style="padding:10px 16px;font-size:12px;color:#888780;font-weight:500;text-align:left">
                                    ผู้ใช้งาน
                                </th>
                                <th
                                    style="padding:10px 16px;font-size:12px;color:#888780;font-weight:500;text-align:left">
                                    อีเมล</th>
                                <th
                                    style="padding:10px 16px;font-size:12px;color:#888780;font-weight:500;text-align:left;width:130px">
                                    Role</th>
                                <th
                                    style="padding:10px 16px;font-size:12px;color:#888780;font-weight:500;text-align:left;width:120px">
                                    สถานะ</th>
                                <th
                                    style="padding:10px 16px;font-size:12px;color:#888780;font-weight:500;text-align:left;width:130px">
                                    สร้างเมื่อ</th>
                                <th style="width:90px"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-if="pagedUsers.length > 0">
                                <UserTableRow v-for="user in pagedUsers" :key="user.id" :user="user" @edit="openEdit"
                                    @delete="deleteUser" @toggle="toggleActive" />
                            </template>
                            <tr v-else>
                                <td colspan="6">
                                    <NEmpty description="ไม่พบผู้ใช้งาน" style="padding:48px 0" />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Pagination -->
                    <div class="flex items-center justify-center px-4 py-3">
                        <AppPagination v-model:page="currentPage" :total="filteredUsers.length"
                            :page-size="PAGE_SIZE" />
                    </div>
                </div>

                <!-- Modal -->
                <UserFormModal v-model:show="showModal" :editing="editingUser" @saved="onSaved" />
            </main>
        </div>
    </div>
</template>