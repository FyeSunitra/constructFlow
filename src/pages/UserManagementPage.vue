<script lang="ts">
export default { name: 'UserManagementPage' }
</script>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
    NButton, NInput, NSelect, NEmpty, NSwitch,
    NPopconfirm, useMessage,
} from 'naive-ui'
import { Icon } from '@iconify/vue'
import { type User, type UserForm, type UserRole } from '@/types/user'
import { useBreakpoint } from '@/composables/useBreakpoint';
import { userService } from '@/services/user.service';

const message = useMessage()
const { breakpoint, isMobile } = useBreakpoint()

const showModal = ref(false)
const editingUser = ref<User | null>(null)

const users = ref<User[]>([])
const loading = ref(false)

const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)

const search = ref('')
const filterRole = ref<UserRole | 'all'>('all')
const isActive = ref<boolean | 'all'>('all')

const emptyColspan = computed(() => breakpoint.value === 'desktop' ? 6 : 4)

function openCreate() { editingUser.value = null; showModal.value = true }
function openEdit(user: User) { editingUser.value = { ...user }; showModal.value = true }

function toggleActive(user: User) {
    const t = users.value.find(u => u.id === user.id)
    if (!t) return
    t.is_active = !t.is_active
    message.success(`${t.is_active ? 'เปิด' : 'ปิด'}การใช้งาน ${t.first_name} แล้ว`)
}

function deleteUser(user: User) {
    users.value = users.value.filter(u => u.id !== user.id)
    message.success('ลบผู้ใช้งานเรียบร้อย')
}

const onSaved = async (form: UserForm, id: string | null) => {
    try {
        if (id) {
            await userService.updateUser(id, form)
            message.success('อัปเดตสำเร็จ')
            fetchUsers()
        } else {
            await userService.createUser(form)
            message.success('สร้างผู้ใช้งานสำเร็จ')
            fetchUsers()
        }

        editingUser.value = null
        showModal.value = false

    } catch (err: any) {
        message.error(err?.message || 'เกิดข้อผิดพลาด')
    }
}

const fetchUsers = async () => {
    try {
        loading.value = true

        const res = await userService.getUsers({
            page: currentPage.value,
            limit: pageSize.value,
            role: filterRole.value === 'all' ? undefined : filterRole.value,
            is_active: isActive.value === 'all' ? undefined : isActive.value,
            searchKeyword: search.value || undefined,
        })

        users.value = res.data
        totalItems.value = res.meta.total
    } finally {
        loading.value = false
    }
}

onMounted(fetchUsers)

watch(currentPage, () => {
    fetchUsers()
})

watch([search, filterRole, isActive], () => {
    currentPage.value = 1
    fetchUsers()
})

</script>

<template>
    <div class="flex h-screen overflow-hidden">
        <AppSidebar />

        <div class="flex-1 flex flex-col overflow-hidden bg-[--body]">
            <header class="shrink-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3">
                <AppBreadcrumb />
            </header>

            <main class="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-base md:text-lg font-medium text-gray-900 mb-0.5">จัดการผู้ใช้งาน</h1>
                        <p class="text-xs md:text-sm text-gray-400 hidden sm:block">เพิ่ม แก้ไข
                            และจัดการสิทธิ์ผู้ใช้ทั้งหมด</p>
                    </div>
                    <NButton type="primary" :size="isMobile() ? 'small' : 'medium'"
                        style="background:#0F6E56;border:none" @click="openCreate">
                        <template #icon>
                            <Icon icon="lucide:user-plus" style="width:14px;height:14px" />
                        </template>
                        <span class="hidden sm:inline">เพิ่มผู้ใช้งาน</span>
                        <span class="sm:hidden">เพิ่ม</span>
                    </NButton>
                </div>

                <div class="rounded-xl border bg-white overflow-hidden" style="border:0.5px solid #E3E1D8">
                    <div class="flex flex-wrap items-center gap-2 px-3 md:px-4 py-2.5"
                        style="border-bottom:0.5px solid #F1EFE8">
                        <NInput v-model:value="search" placeholder="ค้นหา..." clearable size="small" class="flex-1"
                            style="min-width:0;max-width:260px">
                            <template #prefix>
                                <Icon icon="lucide:search" style="width:13px;height:13px;color:#B4B2A9" />
                            </template>
                        </NInput>

                        <NSelect v-model:value="filterRole" :options="[
                            { label: 'ทุก Role', value: 'all' },
                            { label: 'CEO', value: 'CEO' },
                            { label: 'Engineer', value: 'ENGINEER' },
                        ]" size="small" style="width:130px" />

                        <span class="ml-auto text-xs text-gray-400 whitespace-nowrap">
                            {{ totalItems }} รายการ
                        </span>
                    </div>

                    <template v-if="isMobile()">
                        <template v-if="users.length > 0">
                            <div v-for="user in users" :key="user.id" class="flex items-center gap-3 px-4 py-3"
                                style="border-bottom:0.5px solid #F7F6F2">
                                <UserAvatar :first-name="user.first_name" :last-name="user.last_name"
                                    :username="user.username" :size="40" />
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <span class="text-sm font-medium text-gray-800 truncate">
                                            {{ user.first_name }} {{ user.last_name }}
                                        </span>
                                        <UserRoleTag :role="user.role" />
                                    </div>
                                    <div class="text-xs text-gray-400 truncate mt-0.5">{{ user.email }}</div>
                                </div>
                                <div class="flex items-center gap-1 flex-shrink-0">
                                    <NSwitch :value="user.is_active" size="small" @update:value="toggleActive(user)" />
                                    <NButton quaternary circle size="small" @click="openEdit(user)">
                                        <template #icon>
                                            <Icon icon="lucide:pencil" style="width:13px;height:13px" />
                                        </template>
                                    </NButton>
                                    <NPopconfirm positive-text="ลบ" negative-text="ยกเลิก"
                                        :positive-button-props="{ type: 'error' }" @positive-click="deleteUser(user)">
                                        <template #trigger>
                                            <NButton quaternary circle size="small" type="error">
                                                <template #icon>
                                                    <Icon icon="lucide:trash-2" style="width:13px;height:13px" />
                                                </template>
                                            </NButton>
                                        </template>
                                        ลบ {{ user.first_name }}?
                                    </NPopconfirm>
                                </div>
                            </div>
                        </template>
                        <NEmpty v-else description="ไม่พบผู้ใช้งาน" style="padding:40px 0" />
                    </template>

                    <template v-else>
                        <div class="overflow-x-auto w-full">
                            <table style="width:100%;min-width:520px;border-collapse:collapse;table-layout:auto">
                                <thead>
                                    <tr style="border-bottom:0.5px solid #F1EFE8;background:#FAFAF9">
                                        <th
                                            style="padding:10px 16px;font-size:12px;color:#888780;font-weight:500;text-align:left;white-space:nowrap">
                                            ผู้ใช้งาน
                                        </th>
                                        <!-- email: desktop only -->
                                        <th v-if="breakpoint === 'desktop'"
                                            style="padding:10px 16px;font-size:12px;color:#888780;font-weight:500;text-align:left;white-space:nowrap">
                                            อีเมล
                                        </th>
                                        <th
                                            style="padding:10px 16px;font-size:12px;color:#888780;font-weight:500;text-align:left;white-space:nowrap;width:120px">
                                            Role
                                        </th>
                                        <th
                                            style="padding:10px 16px;font-size:12px;color:#888780;font-weight:500;text-align:left;white-space:nowrap;width:110px">
                                            สถานะ
                                        </th>
                                        <th v-if="breakpoint === 'desktop'"
                                            style="padding:10px 16px;font-size:12px;color:#888780;font-weight:500;text-align:left;white-space:nowrap;width:120px">
                                            สร้างเมื่อ
                                        </th>
                                        <th style="width:80px" />
                                    </tr>
                                </thead>
                                <tbody>
                                    <template v-if="users.length > 0">
                                        <UserTableRow v-for="user in users" :key="user.id" :user="user"
                                            :breakpoint="breakpoint" @edit="openEdit" @delete="deleteUser"
                                            @toggle="toggleActive" />
                                    </template>
                                    <tr v-else>
                                        <td :colspan="emptyColspan">
                                            <NEmpty description="ไม่พบผู้ใช้งาน" style="padding:48px 0" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </template>

                    <div class="flex items-center justify-center px-4 py-3" style="border-top:0.5px solid #F1EFE8">
                        <AppPagination v-model:page="currentPage" :total="totalItems" :page-size="pageSize" />
                    </div>
                </div>

                <UserFormModal v-model:show="showModal" :editing="editingUser" @saved="onSaved" />
            </main>
        </div>
    </div>
</template>