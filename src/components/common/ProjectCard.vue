<script lang="ts">
export default { name: 'ProjectCard' }
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '@/store/auth.store'
import type { Project } from '@/types/project'
import { STATUS_META, formatDate } from '@/lib/project'

const props = defineProps<{ project: Project }>()
const emit = defineEmits<{
    select: [project: Project]
    edit: [project: Project]
}>()

const auth = useAuthStore()
const isCEO = computed(() => auth.user?.role === 'CEO')
const meta = STATUS_META[props.project.status] ?? { label: props.project.status, color: '#5F5E5A', bg: '#F1EFE8' }
</script>

<template>
    <div class="bg-white rounded-xl p-4 flex flex-col gap-3 transition-all duration-150 hover:-translate-y-0.5 relative"
        style="border:0.5px solid #E3E1D8;cursor:pointer" @click="emit('select', project)">
        <!-- Edit button — always visible, CEO only -->
        <button v-if="isCEO"
            class="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center z-10 transition-colors hover:border-emerald-500 hover:text-emerald-700"
            style="border:0.5px solid #E3E1D8;background:#fff;color:#888780" title="แก้ไขโปรเจ็ค"
            @click.stop="emit('edit', project)">
            <Icon icon="lucide:pencil" style="width:13px;height:13px" />
        </button>

        <!-- Status badge + name (pad right when CEO to avoid overlap with edit btn) -->
        <div class="flex items-start justify-between gap-2" :class="isCEO ? 'pr-8' : ''">
            <div class="text-sm font-semibold text-gray-800 leading-snug flex-1">{{ project.name }}</div>
            <span class="flex-shrink-0 inline-flex items-center h-5 px-2 rounded-full text-xs font-medium"
                :style="{ background: meta.bg, color: meta.color }">
                {{ meta.label }}
            </span>
        </div>

        <!-- Owner -->
        <div class="flex items-center gap-1.5 text-xs text-gray-400">
            <Icon icon="lucide:user" style="width:11px;height:11px" />
            {{ project.owner_name ?? '—' }}
        </div>

        <!-- Dates -->
        <div class="flex items-center gap-1.5 text-xs text-gray-400">
            <Icon icon="lucide:calendar" style="width:11px;height:11px" />
            {{ formatDate(project.start_date) }} – {{ formatDate(project.end_date) }}
        </div>

        <!-- Meta chips -->
        <div class="flex gap-1.5 flex-wrap mt-auto">
            <span class="inline-flex items-center gap-1 h-5 px-2 rounded-full text-xs font-medium"
                style="background:#E1F5EE;color:#0F6E56">
                <Icon icon="lucide:layers" style="width:9px;height:9px" />
                {{ project._count.phases }} Phase
            </span>
            <span class="inline-flex items-center gap-1 h-5 px-2 rounded-full text-xs font-medium"
                style="background:#FAEEDA;color:#854F0B">
                <Icon icon="lucide:users" style="width:9px;height:9px" />
                {{ project._count.assignments }} คน
            </span>
        </div>
    </div>
</template>