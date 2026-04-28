<script lang="ts">
export default { name: 'ProjectDetailCard' }
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { ProjectDetail } from '@/types/project';
import { computeProgress, formatDate, STATUS_META } from '@/lib/project';


const props = defineProps<{ project: ProjectDetail }>()

const statusMeta = computed(() => STATUS_META[props.project.status] ?? STATUS_META.PLANNING)

const progress = computed(() =>
    props.project.progress_percentage ?? computeProgress(props.project.phases),
)

const currentPhase = computed(() =>
    props.project.phases.find(p => p.status === 'IN_PROGRESS')
    ?? props.project.phases[0]
    ?? null,
)

const totalBudget = computed(() =>
    props.project.phases.reduce((s, p) => s + Number(p.budget_estimate ?? 0), 0),
)

const engineers = computed(() =>
    props.project.assignments.map(a => a.engineer),
)
</script>

<template>
    <div class="bg-white rounded-2xl p-6 flex flex-col gap-5" style="border:0.5px solid #E3E1D8">
        <!-- Title row -->
        <div class="flex items-start justify-between gap-3 flex-wrap">
            <div class="flex-1 min-w-0">
                <h1 class="text-xl font-bold text-[--primary] leading-tight">{{ project.name }}</h1>
                <p v-if="project.description" class="text-sm text-gray-400 mt-1">{{ project.description }}</p>
            </div>
            <span class="flex-shrink-0 inline-flex items-center h-6 px-3 rounded-full text-sm font-semibold"
                :style="{ background: statusMeta.bg, color: statusMeta.color }">
                {{ statusMeta.label }}
            </span>
        </div>

        <!-- Meta grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <!-- Owner -->
            <div>
                <div class="text-xs text-gray-400 uppercase tracking-wider mb-1">เจ้าของโครงการ</div>
                <div class="text-md font-medium">{{ project.owner_name ?? '—' }}</div>
            </div>
            <!-- Duration -->
            <div>
                <div class="text-xs text-gray-400 uppercase tracking-wider mb-1">ระยะเวลา</div>
                <div class="text-md font-medium">
                    {{ formatDate(project.start_date) }} – {{ formatDate(project.end_date) }}
                </div>
            </div>
            <!-- Current phase -->
            <div>
                <div class="text-xs text-gray-400 uppercase tracking-wider mb-1">Phase ปัจจุบัน</div>
                <div class="text-md font-medium">
                    {{ currentPhase ? currentPhase.name : '—' }}
                </div>
            </div>
            <!-- Budget -->
            <div>
                <div class="text-xs text-gray-400 uppercase tracking-wider mb-1">งบประมาณรวม</div>
                <div class="text-md font-medium">
                    ฿{{ totalBudget.toLocaleString('th-TH') }}
                </div>
            </div>
        </div>

        <!-- Engineers -->
        <div v-if="engineers.length" class="flex items-center gap-2 flex-wrap">
            <div class="text-md uppercase tracking-wider mr-1">ผู้รับผิดชอบ</div>
            <div v-for="eng in engineers" :key="eng.id" class="inline-flex items-center gap-1.5 h-6 px-2.5"
                style="background:#E1F5EE;color:#0F6E56">
                <Icon icon="lucide:user" style="width:12px;height:12px" />
                {{ eng.first_name }} {{ eng.last_name }}
            </div>
        </div>

        <!-- Progress bar -->
        <div>
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm">ความคืบหน้าโครงการ</span>
                <span class="text-sm font-semibold" style="color:#0F6E56">{{ progress }}%</span>
            </div>
            <div class="h-2.5 rounded-full overflow-hidden" style="background:#F1EFE8">
                <div class="h-full rounded-full transition-all duration-500" :style="{
                    width: `${progress}%`,
                    background: progress >= 100 ? '#3B6D11' : progress > 50 ? '#1D9E75' : '#EF9F27',
                }" />
            </div>
        </div>
    </div>
</template>