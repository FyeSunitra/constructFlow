<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NModal, NButton, NImage, NImageGroup } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { CHECKPOINT_STATUS_META } from '@/types/checkpoint'
import { checkpointService } from '@/services/checkpoint.service'
import type { ProjectCheckpoint } from '@/types/project'

const props = defineProps<{
    show: boolean
    checkpoint: ProjectCheckpoint | null
    projectId: string   // เพิ่ม
    phaseId: string     // เพิ่ม
}>()

const emit = defineEmits<{
    'update:show': [v: boolean]
    'edit': [checkpoint: ProjectCheckpoint]
}>()

const { isMobile } = useBreakpoint()

interface CheckpointLog {
    id: string
    old_status: string | null
    new_status: string | null
    note_text: string | null
    created_at: string
    creator: { id: string; first_name: string; last_name: string } | null
    images: { id: string; url: string }[]
}

const logs = ref<CheckpointLog[]>([])
const logsLoading = ref(false)

watch(() => props.show, async (v) => {
    if (!v || !props.checkpoint) return
    logsLoading.value = true
    try {
        const res = await checkpointService.getLogs(
            props.projectId,
            props.phaseId,
            props.checkpoint.id
        )
        logs.value = (res as any)?.data ?? res
    } catch {
        logs.value = []
    } finally {
        logsLoading.value = false
    }
})

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

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
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

            <!-- <div>
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
            </div> -->

            <!-- Logs -->
            <div>
                <div class="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">ประวัติการอัพเดท</div>

                <div v-if="logsLoading" class="flex flex-col gap-2">
                    <div v-for="i in 2" :key="i" class="h-14 rounded-xl animate-pulse" style="background:#F1EFE8" />
                </div>

                <div v-else-if="logs.length === 0" class="text-sm text-gray-300 italic">
                    ยังไม่มีประวัติการอัพเดท
                </div>

                <div v-else class="flex flex-col gap-2">
                    <div v-for="log in logs" :key="log.id" class="rounded-xl p-3 flex flex-col gap-1.5"
                        style="background:#F7F6F2">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-1.5">
                                <span v-if="log.old_status" class="text-xs px-2 py-0.5 rounded-full font-medium" :style="{
                                    background: CHECKPOINT_STATUS_META[log.old_status as keyof typeof CHECKPOINT_STATUS_META]?.bg,
                                    color: CHECKPOINT_STATUS_META[log.old_status as keyof typeof CHECKPOINT_STATUS_META]?.color,
                                }">
                                    {{ CHECKPOINT_STATUS_META[log.old_status as keyof typeof
                                        CHECKPOINT_STATUS_META]?.label }}
                                </span>
                                <Icon v-if="log.old_status && log.new_status" icon="lucide:arrow-right"
                                    style="width:12px;height:12px;color:#aaa" />
                                <span v-if="log.new_status" class="text-xs px-2 py-0.5 rounded-full font-medium" :style="{
                                    background: CHECKPOINT_STATUS_META[log.new_status as keyof typeof CHECKPOINT_STATUS_META]?.bg,
                                    color: CHECKPOINT_STATUS_META[log.new_status as keyof typeof CHECKPOINT_STATUS_META]?.color,
                                }">
                                    {{ CHECKPOINT_STATUS_META[log.new_status as keyof typeof
                                        CHECKPOINT_STATUS_META]?.label }}
                                </span>
                            </div>
                            <div class="text-right">
                                <div class="text-[10px] text-gray-400">{{ formatDateTime(log.created_at) }}</div>
                                <div v-if="log.creator" class="text-[10px] text-gray-400">
                                    {{ log.creator.first_name }} {{ log.creator.last_name }}
                                </div>
                            </div>
                        </div>

                        <div v-if="log.note_text && log.note_text !== 'Status changed'"
                            class="text-xs text-gray-500 leading-relaxed">
                            {{ log.note_text }}
                        </div>

                        <!-- รูปภาพใน log -->
                        <NImageGroup v-if="log.images?.length">
                            <div class="grid grid-cols-3 gap-1.5 mt-1">
                                <NImage v-for="img in log.images" :key="img.id" :src="img.url" object-fit="cover"
                                    class="rounded-lg overflow-hidden" style="aspect-ratio:4/3;width:100%" />
                            </div>
                        </NImageGroup>
                    </div>
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