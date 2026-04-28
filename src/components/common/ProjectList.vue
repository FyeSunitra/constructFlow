<script lang="ts">
export default { name: 'ProjectList' }
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '@/store/auth.store'
import type { Project } from '@/types/project'
import ProjectCard from '@/components/common/ProjectCard.vue'

const props = defineProps<{
  projects: Project[]
  loading?: boolean
  total: number
  page: number
  pageSize: number
  search: string
  statusFilter: string
}>()

const emit = defineEmits<{
  'newProject': []
  'update:page': [page: number]
  'update:search': [v: string]
  'update:statusFilter': [v: string]
  'select': [project: Project]
  'edit': [project: Project]
}>()

const auth = useAuthStore()
const isCEO = computed(() => auth.user?.role === 'CEO')

const filterOptions = [
  { label: 'All Projects', value: 'all' },
  { label: 'Planning', value: 'PLANNING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Delayed', value: 'DELAYED' },
  { label: 'Completed', value: 'COMPLETED' },
]
</script>

<template>
  <div>
    <!-- Header row -->
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <h2 class="text-xl font-bold text-[var(--primary)] mr-auto">Projects</h2>

      <div
        class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-52 focus-within:border-[var(--primary)] transition-colors">
        <Icon icon="mdi:magnify" width="16" class="text-gray-400 shrink-0" />
        <input :value="search" placeholder="Search..."
          class="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400"
          @input="emit('update:search', ($event.target as HTMLInputElement).value)" />
      </div>

      <div class="relative">
        <select :value="statusFilter"
          class="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 outline-none cursor-pointer hover:border-gray-300 focus:border-[var(--primary)] transition-colors"
          @change="emit('update:statusFilter', ($event.target as HTMLSelectElement).value)">
          <option v-for="opt in filterOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <Icon icon="mdi:chevron-down" width="15"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      <button v-if="isCEO"
        class="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
        @click="emit('newProject')">
        <Icon icon="mdi:plus" width="16" />
        New Project
      </button>
    </div>

    <!-- Loading skeleton -->
    <template v-if="loading">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div v-for="i in pageSize" :key="i" class="h-40 rounded-xl animate-pulse" style="background:#F1EFE8" />
      </div>
    </template>

    <!-- Grid -->
    <template v-else-if="projects.length">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <ProjectCard v-for="project in projects" :key="project.id" :project="project" @select="emit('select', $event)"
          @edit="emit('edit', $event)" />
      </div>
    </template>

    <!-- Empty -->
    <div v-else class="flex flex-col items-center justify-center py-16 text-gray-400">
      <Icon icon="mdi:folder-open-outline" width="48" class="mb-3 opacity-40" />
      <p class="text-sm">ไม่พบโปรเจ็คที่ค้นหา</p>
    </div>

    <AppPagination :page="page" :total="total" :page-size="pageSize" @update:page="emit('update:page', $event)" />
  </div>
</template>