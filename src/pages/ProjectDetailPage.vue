<script lang="ts">
export default { name: 'ProjectDetailPage' }
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import { projectService } from '@/services/project.service'
import { type ProjectDetail } from '@/types/project'
import ProjectDetailCard from '@/components/common/ProjectDetailCard.vue'
import ProjectOverviewTab from '@/components/common/ProjectOverviewTab.vue'
import ProjectDocumentsTab from '@/components/common/ProjectDocumentsTab.vue'

const route = useRoute()
const message = useMessage()

const project = ref<ProjectDetail | null>(null)
const loading = ref(false)
const activeTab = ref<'overview' | 'documents'>('overview')

async function fetchProject() {
    const id = route.params.id as string
    if (!id) return
    loading.value = true
    try {
        const res = await projectService.getOne(id)
        project.value = (res as any)?.data ?? res as ProjectDetail
    } catch (err) {
        message.error('โหลดข้อมูลโปรเจ็คไม่สำเร็จ')
        console.error('[ProjectDetail] fetch error', err)
    } finally {
        loading.value = false
    }
}

onMounted(fetchProject)
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
                    <div class="h-48 rounded-2xl animate-pulse mb-5" style="background:#F1EFE8" />
                    <div class="h-8 rounded-xl animate-pulse mb-4 w-48" style="background:#F1EFE8" />
                    <div class="flex flex-col gap-3">
                        <div v-for="i in 3" :key="i" class="h-24 rounded-xl animate-pulse" style="background:#F1EFE8" />
                    </div>
                </template>

                <template v-else-if="project">
                    <ProjectDetailCard :project="project" class="mb-5" />

                    <div class="flex gap-0 mb-5" style="border-bottom:0.5px solid #E3E1D8">
                        <button class="px-5 py-2.5 text-sm border-b-2 -mb-px transition-all duration-150 font-medium"
                            :class="activeTab === 'overview'
                                ? 'border-emerald-700 text-emerald-700'
                                : 'border-transparent text-gray-400 hover:text-gray-700'"
                            @click="activeTab = 'overview'">
                            ภาพรวม
                        </button>
                        <button class="px-5 py-2.5 text-sm border-b-2 -mb-px transition-all duration-150 font-medium"
                            :class="activeTab === 'documents'
                                ? 'border-emerald-700 text-emerald-700'
                                : 'border-transparent text-gray-400 hover:text-gray-700'"
                            @click="activeTab = 'documents'">
                            เอกสาร
                        </button>
                    </div>

                    <ProjectOverviewTab v-if="activeTab === 'overview'" :phases="project.phases"
                        :project-id="project.id" />
                    <ProjectDocumentsTab v-if="activeTab === 'documents'" :documents="project.documents ?? []" />
                </template>

                <div v-else class="py-16 text-center text-gray-300 text-sm">
                    ไม่พบข้อมูลโปรเจ็ค
                </div>
            </main>
        </div>
    </div>
</template>