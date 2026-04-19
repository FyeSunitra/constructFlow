<script lang="ts">
export default { name: 'DailyUpdatePage' }
</script>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '@/store/auth.store'
import DailyUpdateFeed from '@/components/common/DailyUpdateFeed.vue'
import DailyUpdateModal from '@/components/common/DailyUpdateModal.vue'
import type { DailyUpdateItem } from '@/components/common/DailyUpdateCard.vue'
import type { ProjectDetail } from '@/types/project'
import { projectService } from '@/services/project.service'

const route = useRoute()
const message = useMessage()
const auth = useAuthStore()

const project = ref<ProjectDetail | null>(null)
const loadingProject = ref(false)
const loadingFeed = ref(false)

const updates = ref<DailyUpdateItem[]>([])
const projectId = computed(() => route.params.id as string)
const showModal = ref(false)
const currentPhase = ref('Phase 3: Structure')

const todayStr = computed(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const alreadyPostedToday = computed(() =>
    updates.value.some(u => u.date === todayStr.value && u.engineer_id === auth.user?.id),
)

function offsetDate(n: number) {
    const d = new Date(); d.setDate(d.getDate() + n)
    return d.toISOString().split('T')[0]
}


const MOCK: DailyUpdateItem[] = [
    { id: '1', date: offsetDate(0), engineer_id: 'e1', engineer: { id: 'e1', first_name: 'สมชาย', last_name: 'ใจดี' }, work_done: 'ติดตั้งคอนกรีตชั้น 1 เสร็จสมบูรณ์ ตรวจสอบคุณภาพงานเชื่อมทั้งหมด ไม่พบปัญหา', issues: '', image_url: null, created_at: new Date().toISOString() },
    { id: '2', date: offsetDate(-1), engineer_id: 'e1', engineer: { id: 'e1', first_name: 'สมชาย', last_name: 'ใจดี' }, work_done: 'เทคอนกรีตเสาชั้น 1 จำนวน 12 ต้น ตรวจสอบระดับและความแน่น', issues: 'คอนกรีตบางส่วนยังไม่แห้งดี ต้องรอ 24 ชม.', image_url: null, created_at: new Date().toISOString() },
    { id: '3', date: offsetDate(-2), engineer_id: 'e2', engineer: { id: 'e2', first_name: 'นารี', last_name: 'กล้าหาญ' }, work_done: 'ติดตั้งเหล็กเสริมคานชั้น 1', issues: '', image_url: null, created_at: new Date().toISOString() },
    { id: '4', date: offsetDate(-4), engineer_id: 'e1', engineer: { id: 'e1', first_name: 'สมชาย', last_name: 'ใจดี' }, work_done: 'ตรวจสอบงานฐานราก', issues: 'พบรอยแตกเล็กน้อยที่มุมตะวันออก', image_url: null, created_at: new Date().toISOString() },
    { id: '5', date: offsetDate(-7), engineer_id: 'e2', engineer: { id: 'e2', first_name: 'นารี', last_name: 'กล้าหาญ' }, work_done: 'วางโครงเหล็กหลังคา', issues: '', image_url: null, created_at: new Date().toISOString() },
    { id: '6', date: offsetDate(-12), engineer_id: 'e1', engineer: { id: 'e1', first_name: 'สมชาย', last_name: 'ใจดี' }, work_done: 'ทดสอบระบบไฟฟ้าชั้น 1', issues: '', image_url: null, created_at: new Date().toISOString() },
    { id: '7', date: offsetDate(-20), engineer_id: 'e2', engineer: { id: 'e2', first_name: 'นารี', last_name: 'กล้าหาญ' }, work_done: 'ติดตั้งระบบประปา', issues: 'ท่อบางส่วนไม่ได้มาตรฐาน สั่งเพิ่มเติม', image_url: null, created_at: new Date().toISOString() },
]

async function fetchProject() {
    const id = route.params.id as string
    if (!id) return
    loadingProject.value = true
    try {
        const res = await projectService.getOne(id)
        project.value = (res as any)?.data ?? res as ProjectDetail
        if (project.value) {
            route.meta.projectName = project.value.name
        }
    } catch {
        message.error('โหลดข้อมูลโปรเจ็คไม่สำเร็จ')
    } finally {
        loadingProject.value = false
    }
}

async function fetchUpdates() {
    loadingFeed.value = true
    try {
        // TODO: const res = await dailyUpdateService.getRecent(projectId.value)
        // updates.value = res.data
        updates.value = MOCK
    } catch { message.error('โหลดข้อมูลไม่สำเร็จ') }
    finally { loadingFeed.value = false }
}

onMounted(() => {
    fetchProject()
    fetchUpdates()
})

async function onSaved(
    payload: { date: string; work_done: string; issues: string },
    files: File[],
) {
    try {
        // TODO: await dailyUpdateService.create(projectId.value, payload)
        message.success('บันทึก Daily Update เรียบร้อย')
        await fetchUpdates()
    } catch { message.error('บันทึกไม่สำเร็จ') }
}
</script>

<template>
    <div class="flex h-screen overflow-hidden">
        <AppSidebar />

        <div class="flex-1 flex flex-col overflow-hidden bg-[--body]">
            <header class="shrink-0 bg-white border-b border-gray-100 px-4 md:px-6 py-3">
                <AppBreadcrumb />
            </header>

            <main class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

                <template v-if="loadingProject">
                    <div class="h-44 rounded-2xl animate-pulse mb-5" style="background:#F1EFE8" />
                    <div v-for="i in 3" :key="i" class="h-14 rounded-xl animate-pulse mb-3"
                        style="background:#F1EFE8" />
                </template>

                <template v-else-if="project">
                    <ProjectDetailCard :project="project" />
                </template>

                <DailyUpdateFeed :updates="updates" :loading="loadingFeed" :current-phase="currentPhase"
                    :today-str="todayStr" :already-posted-today="alreadyPostedToday" @add="showModal = true" />

            </main>
        </div>
    </div>

    <DailyUpdateModal v-model:show="showModal" :date="todayStr" :phase-name="currentPhase" @saved="onSaved" />
</template>