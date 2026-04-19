<script lang="ts">
export default { name: 'PhasePage' }
</script>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import { projectService } from '@/services/project.service'
import { checkpointService } from '@/services/checkpoint.service'
import { type ProjectDetail, type ProjectCheckpoint } from '@/types/project'
import { type CheckpointStatus } from '@/types/checkpoint'
import PhaseCard from '@/components/common/PhaseCard.vue'
import ProjectDetailCard from '@/components/common/ProjectDetailCard.vue'
import CheckpointUpdateModal from '@/components/common/CheckpointUpdateModal.vue'
import CheckpointDetailModal from '@/components/common/CheckpointDetailModal.vue'

const route = useRoute()
const message = useMessage()

const project = ref<ProjectDetail | null>(null)
const loading = ref(false)

const showUpdate = ref(false)
const showDetail = ref(false)
const activeCP = ref<ProjectCheckpoint | null>(null)

const autoOpenIdx = computed(() =>
    project.value?.phases.findIndex(p => p.status === 'IN_PROGRESS') ?? 0,
)

async function fetchProject() {
    const id = route.params.id as string
    if (!id) return
    loading.value = true
    try {
        const res = await projectService.getOne(id)
        project.value = (res as any)?.data ?? res as ProjectDetail
        if (project.value) {
            route.meta.projectName = project.value.name
        }
    } catch {
        message.error('โหลดข้อมูลโปรเจ็คไม่สำเร็จ')
    } finally {
        loading.value = false
    }
}

onMounted(fetchProject)

function openUpdate(cp: ProjectCheckpoint) {
    activeCP.value = cp
    showUpdate.value = true
}

function openDetail(cp: ProjectCheckpoint) {
    activeCP.value = cp
    showDetail.value = true
}

async function onCheckpointSaved(
    id: string,
    payload: { status: CheckpointStatus; note_text: string },
    files: File[],
) {
    try {
        await checkpointService.update(id, payload)

        // Upload photos if any
        if (files.length) {
            // await checkpointService.uploadImages(id, files)
        }

        message.success('อัปเดต Checkpoint เรียบร้อย')
        await fetchProject()
    } catch (err) {
        message.error('อัปเดตไม่สำเร็จ กรุณาลองใหม่')
        console.error('[PhasePage] checkpoint update error', err)
    }
}
</script>

<template>
    <div class="flex h-screen overflow-hidden">
        <AppSidebar />

        <div class="flex-1 flex flex-col overflow-hidden bg-[--body]">
            <header class="shrink-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3">
                <AppBreadcrumb />
            </header>

            <main class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

                <template v-if="loading">
                    <div class="h-44 rounded-2xl animate-pulse mb-5" style="background:#F1EFE8" />
                    <div v-for="i in 3" :key="i" class="h-14 rounded-xl animate-pulse mb-3"
                        style="background:#F1EFE8" />
                </template>

                <template v-else-if="project">
                    <ProjectDetailCard :project="project" />

                    <div class="bg-white rounded-2xl p-6 flex flex-col gap-5" style="border:0.5px solid #E3E1D8">
                        <div class="flex items-center gap-2">
                            <span class="text-xl font-bold text-[--primary]">Phase & Checkpoint</span>
                            <!-- <span class="text-md text-gray-400">{{ project.phases.length }} Phase</span> -->
                        </div>
                        <div class="flex flex-col gap-3">
                            <PhaseCard v-for="(phase, i) in project.phases" :key="phase.id" :phase="phase"
                                :default-open="i === autoOpenIdx" @update-checkpoint="openUpdate"
                                @view-checkpoint="openDetail" />
                        </div>
                    </div>
                </template>

                <!-- Not found -->
                <div v-else class="py-16 text-center text-gray-300 text-sm">
                    ไม่พบข้อมูลโปรเจ็ค
                </div>
            </main>
        </div>
    </div>

    <!-- Update modal -->
    <CheckpointUpdateModal v-model:show="showUpdate" :checkpoint="activeCP" @saved="onCheckpointSaved" />

    <!-- Detail modal -->
    <CheckpointDetailModal v-model:show="showDetail" :checkpoint="activeCP" @edit="openUpdate" />
</template>