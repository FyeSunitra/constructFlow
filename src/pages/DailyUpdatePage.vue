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
import { dailyUpdateService } from '@/services/dailyUpdate.service'

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
    updates.value.some(u => u.date === todayStr.value)
)

function offsetDate(n: number) {
    const d = new Date(); d.setDate(d.getDate() + n)
    return d.toISOString().split('T')[0]
}

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
        const res = await dailyUpdateService.getAll(projectId.value)
        const raw: any[] = (res as any)?.data ?? res
        updates.value = raw.map(u => ({
            ...u,
            // ตัด timezone offset ออก ใช้แค่ date part จาก ISO string
            date: u.date?.slice(0, 10) ?? u.date,
        }))
    } catch {
        message.error('โหลดข้อมูลไม่สำเร็จ')
    } finally {
        loadingFeed.value = false
    }
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
        const res = await dailyUpdateService.create(projectId.value, {
            work_done: payload.work_done,
            issues: payload.issues,
        })
        const updateId = (res as any)?.id as string

        if (files.length && updateId) {
            await dailyUpdateService.uploadImages(projectId.value, updateId, files)
        }

        message.success('บันทึก Daily Update เรียบร้อย')
        await fetchUpdates()
    } catch {
        message.error('บันทึกไม่สำเร็จ')
    }
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