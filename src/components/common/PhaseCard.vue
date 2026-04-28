<script lang="ts">
export default { name: 'PhaseCard' }
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { CHECKPOINT_STATUS_META } from '@/types/checkpoint'
import type { ProjectPhase, ProjectCheckpoint } from '@/types/project'
import { TASK_STATUS_META } from '@/lib/project';

const props = defineProps<{
    phase: ProjectPhase
    defaultOpen?: boolean
}>()

const emit = defineEmits<{
    'update-checkpoint': [cp: ProjectCheckpoint]
    'view-checkpoint': [cp: ProjectCheckpoint]
}>()

const isOpen = ref(props.defaultOpen ?? false)

const phaseStyle = computed(() => {
    switch (props.phase.status) {
        case 'COMPLETED': return { header: '#1D9E75', border: '#9FE1CB' }
        case 'IN_PROGRESS': return { header: '#F09E26', border: '#EF9F27' }
        default: return { header: '#818181', border: '#E3E1D8' }
    }
})

const phaseMeta = TASK_STATUS_META[props.phase.status as keyof typeof TASK_STATUS_META]
    ?? { label: props.phase.status, color: '#818181', bg: '#F1EFE8' }

const cpDone = computed(() => props.phase.checkpoints.filter(c => c.status === 'COMPLETED').length)
const cpTotal = computed(() => props.phase.checkpoints.length)
const pct = computed(() => cpTotal.value ? Math.round((cpDone.value / cpTotal.value) * 100) : 0)

function formatDate(iso: string | null | undefined) {
    if (!iso) return null
    return new Date(iso).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric',
    })
}
</script>

<template>
    <div class="rounded-xl overflow-hidden" :style="{ border: `0.5px solid ${phaseStyle.border}` }">
        <div class="flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none transition-opacity hover:opacity-90"
            :style="{ background: phaseStyle.header }" @click="isOpen = !isOpen">
            <span class="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded"
                style="background:rgba(255,255,255,0.2);color:#fff">
                Phase {{ phase.order_index }}
            </span>

            <div class="flex-1 min-w-0">
                <div class="text-sm font-bold text-white truncate">{{ phase.name }}</div>
                <div class="text-[11px] mt-0.5" style="color:rgba(255,255,255,0.72)">
                    {{ pct }}% · {{ cpDone }}/{{ cpTotal }} Checkpoint
                </div>
            </div>

            <span class="flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full"
                style="background:rgba(255,255,255,0.2);color:#fff">
                {{ phaseMeta.label.toUpperCase() }}
            </span>

            <Icon icon="lucide:chevron-down" :style="{
                width: '17px', height: '17px', color: 'rgba(255,255,255,0.8)',
                transform: isOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
                flexShrink: '0',
            }" />
        </div>

        <!-- Checkpoint list -->
        <Transition name="collapse">
            <div v-if="isOpen" class="bg-white">
                <template v-if="phase.checkpoints.length">
                    <div v-for="(cp, ci) in phase.checkpoints" :key="cp.id"
                        class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50"
                        :style="ci < phase.checkpoints.length - 1 ? 'border-bottom:0.5px solid #F7F6F2' : ''"
                        :class="cp.status === 'IN_PROGRESS' ? 'bg-amber-50/40' : ''"
                        @click="cp.status === 'COMPLETED' ? emit('view-checkpoint', cp) : emit('update-checkpoint', cp)">
                        <!-- Status icon -->
                        <div class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                            :style="{ background: CHECKPOINT_STATUS_META[cp.status as keyof typeof CHECKPOINT_STATUS_META]?.bg ?? '#F1EFE8' }">
                            <template v-if="cp.status === 'COMPLETED'">
                                <Icon icon="lucide:check" style="width:11px;height:11px;color:#0F6E56" />
                            </template>
                            <template v-else-if="cp.status === 'IN_PROGRESS'">
                                <Icon icon="lucide:clock" style="width:11px;height:11px;color:#BA7517" />
                            </template>
                            <template v-else>
                                <div class="w-2 h-2 rounded-full" style="background:#D3D1C7" />
                            </template>
                        </div>

                        <!-- Name + date -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="text-sm font-medium truncate"
                                    :class="cp.status === 'COMPLETED' ? 'text-gray-400 line-through' : 'text-gray-800'">
                                    {{ cp.name }}
                                </span>
                                <!-- IN_PROGRESS badge -->
                                <span v-if="cp.status === 'IN_PROGRESS'"
                                    class="flex-shrink-0 text-sm font-semibold px-2 py-0.5 rounded-full"
                                    style="background:#FAEEDA;color:#854F0B">
                                    กำลังดำเนินการ
                                </span>
                            </div>
                            <div class="text-sm text-gray-400 mt-0.5">
                                <template v-if="cp.status === 'COMPLETED'">
                                    เสร็จ {{ formatDate(cp.completed_at) }}
                                </template>
                                <template v-else-if="cp.started_at">
                                    เริ่ม {{ formatDate(cp.started_at) }}
                                </template>
                                <template v-else>
                                    รอดำเนินการ
                                </template>
                            </div>
                        </div>

                        <!-- Action icon -->
                        <div class="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                            :style="{
                                border: cp.status === 'IN_PROGRESS'
                                    ? '0.5px solid #EF9F27'
                                    : '0.5px solid #E3E1D8',
                                background: '#fff',
                                color: cp.status === 'IN_PROGRESS' ? '#BA7517'
                                    : cp.status === 'COMPLETED' ? '#888780' : '#B4B2A9',
                            }">
                            <Icon :icon="cp.status === 'COMPLETED' ? 'lucide:eye' : 'lucide:pencil'"
                                style="width:13px;height:13px" />
                        </div>
                    </div>
                </template>
                <div v-else class="px-4 py-5 text-center text-sm text-gray-300">
                    ยังไม่มี Checkpoint ใน Phase นี้
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.collapse-enter-active,
.collapse-leave-active {
    transition: max-height 0.25s ease, opacity 0.2s ease;
    overflow: hidden;
    max-height: 800px;
}

.collapse-enter-from,
.collapse-leave-to {
    max-height: 0;
    opacity: 0;
}
</style>