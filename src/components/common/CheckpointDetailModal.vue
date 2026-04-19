<script lang="ts">
export default { name: 'CheckpointDetailModal' }
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { NModal, NButton, NImage, NImageGroup } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { CHECKPOINT_STATUS_META } from '@/types/checkpoint'
import type { ProjectCheckpoint } from '@/types/project'

const props = defineProps<{
    show: boolean
    checkpoint: ProjectCheckpoint | null
}>()

const emit = defineEmits<{
    'update:show': [v: boolean]
    'edit': [checkpoint: ProjectCheckpoint]
}>()

const { isMobile } = useBreakpoint()

const statusMeta = computed(() =>
    props.checkpoint
        ? CHECKPOINT_STATUS_META[props.checkpoint.status as keyof typeof CHECKPOINT_STATUS_META]
        : null,
)

const modalStyle = computed(() =>
    isMobile()
        ? 'width:100%;max-width:100%;margin:0;border-radius:0'
        : 'width:460px;border-radius:16px',
)

function formatDate(iso: string | null | undefined) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric',
    })
}

function close() { emit('update:show', false) }
</script>

<template>
    <NModal :show="show" preset="card" :style="modalStyle" :mask-closable="true"
        :segmented="{ content: true, footer: true }" :content-style="{ overflowY: 'auto', maxHeight: '70dvh' }"
        @update:show="emit('update:show', $event)">
        <template #header>
            <div>
                <div class="text-sm font-semibold text-gray-900">รายละเอียด Checkpoint</div>
                <div class="text-xs text-gray-400 mt-0.5">{{ checkpoint?.name }}</div>
            </div>
        </template>

        <div v-if="checkpoint" class="flex flex-col gap-4">

            <!-- Status badge -->
            <div>
                <span class="inline-flex items-center gap-1.5 h-6 px-3 rounded-full text-xs font-semibold"
                    :style="{ background: statusMeta?.bg, color: statusMeta?.color }">
                    {{ statusMeta?.label }}
                </span>
            </div>

            <!-- Meta grid -->
            <div class="grid grid-cols-2 gap-2">
                <div class="rounded-xl p-3" style="background:#F7F6F2">
                    <div class="text-[10px] text-gray-400 mb-1">วันที่เสร็จ</div>
                    <div class="text-sm font-medium text-gray-800">{{ formatDate(checkpoint.completed_at) }}</div>
                </div>
                <div class="rounded-xl p-3" style="background:#F7F6F2">
                    <div class="text-[10px] text-gray-400 mb-1">เริ่มดำเนินการ</div>
                    <div class="text-sm font-medium text-gray-800">{{ formatDate(checkpoint.started_at) }}</div>
                </div>
            </div>

            <!-- Note -->
            <div v-if="checkpoint.note_text">
                <div class="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">หมายเหตุ</div>
                <div class="rounded-xl p-3 text-sm text-gray-600 leading-relaxed" style="background:#F7F6F2">
                    {{ checkpoint.note_text }}
                </div>
            </div>
            <div v-else>
                <div class="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">หมายเหตุ</div>
                <div class="text-sm text-gray-300 italic">ไม่มีหมายเหตุ</div>
            </div>

            <!-- Photos -->
            <div>
                <div class="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">ภาพหน้างาน</div>
                <template v-if="checkpoint.image_url">
                    <NImageGroup>
                        <div class="grid grid-cols-3 gap-2">
                            <NImage :src="checkpoint.image_url" object-fit="cover" class="rounded-xl overflow-hidden"
                                style="aspect-ratio:4/3;width:100%" />
                        </div>
                    </NImageGroup>
                </template>
                <div v-else class="flex flex-col items-center justify-center py-8 rounded-xl gap-2"
                    style="background:#F7F6F2">
                    <Icon icon="lucide:image-off" style="width:24px;height:24px;color:#D3D1C7" />
                    <div class="text-xs text-gray-300">ไม่มีภาพหน้างาน</div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex items-center justify-between">
                <NButton @click="close">ปิด</NButton>
                <NButton v-if="checkpoint && checkpoint.status !== 'COMPLETED'" type="primary"
                    style="background:#0F6E56;border:none" @click="checkpoint && emit('edit', checkpoint); close()">
                    <template #icon>
                        <Icon icon="lucide:pencil" style="width:14px;height:14px" />
                    </template>
                    แก้ไข
                </NButton>
            </div>
        </template>
    </NModal>
</template>