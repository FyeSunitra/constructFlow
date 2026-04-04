<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '../../store/auth.store'

const auth = useAuthStore()
const isCEO = computed(() => auth.user?.role === 'CEO')
const emit = defineEmits<{ newProject: [] }>()

// ---- Mock data ----
const allProjects = ref([
  { id: 1, name: 'Municipal Office Building', location: 'กรุงเทพมหานคร', startDate: 'Jan 2025', endDate: 'Dec 2025', status: 'IN PROGRESS', phase: 'PHASE', area: '2,500 ตร.ม.' },
  { id: 2, name: 'Municipal Office Building', location: 'กรุงเทพมหานคร', startDate: 'Jan 2025', endDate: 'Dec 2025', status: 'IN PROGRESS', phase: 'PHASE', area: '2,500 ตร.ม.' },
  { id: 3, name: 'Municipal Office Building', location: 'กรุงเทพมหานคร', startDate: 'Jan 2025', endDate: 'Dec 2025', status: 'IN PROGRESS', phase: 'PHASE', area: '2,500 ตร.ม.' },
  { id: 4, name: 'Riverside Condo Tower', location: 'เชียงใหม่', startDate: 'Mar 2025', endDate: 'Feb 2026', status: 'DELAYED', phase: 'PHASE', area: '4,100 ตร.ม.' },
  { id: 5, name: 'Industrial Warehouse', location: 'ระยอง', startDate: 'Jun 2024', endDate: 'Aug 2025', status: 'COMPLETED', phase: 'PHASE', area: '8,000 ตร.ม.' },
  { id: 6, name: 'Shopping Complex', location: 'ขอนแก่น', startDate: 'Jan 2025', endDate: 'Dec 2025', status: 'IN PROGRESS', phase: 'PHASE', area: '5,500 ตร.ม.' },
  { id: 7, name: 'Hospital Wing Extension', location: 'นนทบุรี', startDate: 'Feb 2025', endDate: 'Jan 2026', status: 'IN PROGRESS', phase: 'PHASE', area: '3,200 ตร.ม.' },
  { id: 8, name: 'Airport Terminal Upgrade', location: 'ภูเก็ต', startDate: 'Apr 2025', endDate: 'Mar 2026', status: 'DELAYED', phase: 'PHASE', area: '12,000 ตร.ม.' },
])

// ---- Filter ----
const filterOptions = ['All Projects', 'IN PROGRESS', 'DELAYED', 'COMPLETED']
const selectedFilter = ref('All Projects')
const search = ref('')

const filtered = computed(() =>
  allProjects.value.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.value.toLowerCase()) ||
      p.location.toLowerCase().includes(search.value.toLowerCase())
    const matchFilter = selectedFilter.value === 'All Projects' || p.status === selectedFilter.value
    return matchSearch && matchFilter
  })
)

// ---- Pagination ----
const perPage = 6
const currentPage = ref(1)

watch([search, selectedFilter], () => { currentPage.value = 1 })

const paginated = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filtered.value.slice(start, start + perPage)
})
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

    <!-- Header -->
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <h2 class="text-xl font-bold text-[var(--primary)] mr-auto">Projects</h2>

      <!-- Search -->
      <div
        class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-56 focus-within:border-[var(--primary)] transition-colors">
        <Icon icon="mdi:magnify" width="16" class="text-gray-400 shrink-0" />
        <input v-model="search" placeholder="Search..."
          class="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400" />
      </div>

      <!-- Filter -->
      <div class="relative">
        <select v-model="selectedFilter"
          class="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 outline-none cursor-pointer hover:border-gray-300 focus:border-[var(--primary)] transition-colors">
          <option v-for="opt in filterOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <Icon icon="mdi:chevron-down" width="15"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      <!-- New Project — CEO only -->
      <button v-if="isCEO" @click="emit('newProject')"
        class="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
        <Icon icon="mdi:plus" width="16" />
        New Project
      </button>
    </div>

    <!-- Grid -->
    <div v-if="paginated.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <ProjectCard v-for="project in paginated" :key="project.id" v-bind="project" />
    </div>

    <!-- Empty state -->
    <div v-else class="flex flex-col items-center justify-center py-16 text-gray-400">
      <Icon icon="mdi:folder-open-outline" width="48" class="mb-3 opacity-40" />
      <p class="text-sm">ไม่พบโปรเจ็คที่ค้นหา</p>
    </div>

    <!-- Pagination -->
    <AppPagination v-model:page="currentPage" :total="filtered.length" :page-size="perPage" />

  </div>
</template>