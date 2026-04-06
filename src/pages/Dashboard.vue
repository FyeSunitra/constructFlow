<script lang="ts">
export default { name: 'DashboardPage' }
</script>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { projectService } from '@/services/project.service'
import NewProjectModal from '@/components/common/NewProjectModal.vue'
import ProjectList from '@/components/common/ProjectList.vue'
import type { Project } from '@/types/project'
import type { buildProjectPayload } from '@/lib/project'

const message = useMessage()

const projects = ref<Project[]>([])
const loadingList = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(9)
const search = ref('')
const statusFilter = ref('all')

const stats = computed(() => [
  { label: 'All Projects', value: total.value, icon: 'lucide:layers', bg: '#F1EFE8', color: '#5F5E5A' },
  { label: 'In Progress', value: projects.value.filter(p => p.status === 'IN_PROGRESS').length, icon: 'lucide:loader', bg: '#E1F5EE', color: '#0F6E56' },
  { label: 'Delayed', value: projects.value.filter(p => p.status === 'DELAYED').length, icon: 'lucide:alert-circle', bg: '#FCEBEB', color: '#A32D2D' },
  { label: 'Completed', value: projects.value.filter(p => p.status === 'COMPLETED').length, icon: 'lucide:check-circle', bg: '#EAF3DE', color: '#3B6D11' },
])

async function fetchProjects() {
  loadingList.value = true
  try {
    const res = await projectService.getAll({
      page: page.value,
      limit: pageSize.value,
      searchKeyword: search.value || undefined,
      status: statusFilter.value !== 'all' ? statusFilter.value : undefined,
    })
    projects.value = res.data
    // const data = (res as any)?.data
    // projects.value = data?.data ?? []
    // total.value = data?.meta?.total ?? 0
  } catch (err) {
    message.error('โหลดโปรเจ็คไม่สำเร็จ')
    console.error('[Dashboard] fetchProjects error', err)
  } finally {
    loadingList.value = false
  }
}

watch([page, search, statusFilter], fetchProjects)

watch([search, statusFilter], () => { page.value = 1 })

onMounted(fetchProjects)

const showNewProjectModal = ref(false)
const savingProject = ref(false)

async function onProjectSaved(
  payload: ReturnType<typeof buildProjectPayload>,
  files: File[],
) {
  savingProject.value = true
  try {
    const res = await projectService.create(payload)
    const projectId = (res as any)?.data?.id as string | undefined

    // if (files.length && projectId) {
    //   await projectService.uploadDocuments(projectId, files)
    // }

    message.success('สร้างโครงการสำเร็จ')
    await fetchProjects()
  } catch (err) {
    message.error('สร้างโครงการไม่สำเร็จ กรุณาลองใหม่')
    console.error('[Dashboard] create project error', err)
  } finally {
    savingProject.value = false
  }
}

function onSelectProject(project: Project) {
  // router.push(`/project/${project.id}`)
  console.log('select project', project.id)
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

        <!-- Stats row -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard v-for="stat in stats" :key="stat.label" :label="stat.label" :value="stat.value" :icon="stat.icon"
            :bg="stat.bg" :color="stat.color" />
        </div>

        <!-- Project list -->
        <ProjectList :projects="projects" :loading="loadingList" :total="total" :page="page" :page-size="pageSize"
          :search="search" :status-filter="statusFilter" @new-project="showNewProjectModal = true"
          @update:page="page = $event" @update:search="search = $event" @update:status-filter="statusFilter = $event"
          @select="onSelectProject" />
      </main>
    </div>
  </div>

  <NewProjectModal v-model:show="showNewProjectModal" @saved="onProjectSaved" />
</template>