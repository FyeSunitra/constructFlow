<script lang="ts">
export default { name: 'CheckpointUpdateModal' }
</script>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import {
    NModal, NForm, NFormItem, NInput, NButton, NUpload,
    type UploadFileInfo, useMessage,
} from 'naive-ui'
import { Icon } from '@iconify/vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { CHECKPOINT_STATUS_META, type CheckpointStatus } from '@/types/checkpoint'
import type { ProjectCheckpoint } from '@/types/project'

const props = defineProps<{
    show: boolean
    checkpoint: ProjectCheckpoint | null
}>()

const emit = defineEmits<{
    'update:show': [v: boolean]
    'saved': [id: string, payload: { status: CheckpointStatus; note_text: string }, files: File[]]
}>()

const { isMobile } = useBreakpoint()
const message = useMessage()

const form = reactive({
    status: 'PENDING' as CheckpointStatus,
    note_text: '',
})
const stagedFiles = ref<UploadFileInfo[]>([])
const saving = ref(false)

watch(() => props.show, (v) => {
    if (!v || !props.checkpoint) return
    form.status = props.checkpoint.status as CheckpointStatus
    form.note_text = props.checkpoint.note_text ?? ''
    stagedFiles.value = []
})

const modalStyle = computed(() =>
    isMobile()
        ? 'width:100%;max-width:100%;margin:0;border-radius:0'
        : 'width:460px;border-radius:16px',
)

function setStatus(s: CheckpointStatus) { form.status = s }

function handleFileChange(data: { fileList: UploadFileInfo[] }) {
    stagedFiles.value = data.fileList
}

async function handleSubmit() {
    if (!props.checkpoint) return
    saving.value = true
    try {
        const files = stagedFiles.value
            .map(f => f.file)
            .filter((f): f is File => !!f)
        emit('saved', props.checkpoint.id, { status: form.status, note_text: form.note_text }, files)
        emit('update:show', false)
    } finally {
        saving.value = false
    }
}

function close() { emit('update:show', false) }
</script>

<template>
    <NModal :show="show" preset="card" title="อัปเดต Checkpoint" :style="modalStyle" :mask-closable="false"
        :segmented="{ content: true, footer: true }" :content-style="{ overflowY: 'auto', maxHeight: '70dvh' }"
        @update:show="emit('update:show', $event)">
        <template #header>
            <div>
                <div class="text-sm font-semibold text-gray-900">อัปเดต Checkpoint</div>
                <div class="text-xs text-gray-400 mt-0.5">{{ checkpoint?.name }}</div>
            </div>
        </template>

        <div class="flex flex-col gap-5">
            <div>
                <div class="text-sm font-semibold uppercase tracking-wider mb-3">สถานะ</div>
                <div class="grid grid-cols-3 gap-2">
                    <button v-for="(meta, key) in CHECKPOINT_STATUS_META" :key="key"
                        class="flex flex-col items-center gap-2 py-3 px-2 rounded-xl border transition-all duration-150"
                        :style="{
                            background: form.status === key ? meta.bg : '#fff',
                            borderColor: form.status === key ? meta.border : '#E3E1D8',
                            borderWidth: form.status === key ? '1.5px' : '0.5px',
                        }" @click="setStatus(key as CheckpointStatus)">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            :style="{ background: meta.bg }">
                            <template v-if="key === 'COMPLETED'">
                                <Icon icon="lucide:check"
                                    :style="{ width: '14px', height: '14px', color: meta.color }" />
                            </template>
                            <template v-else-if="key === 'IN_PROGRESS'">
                                <Icon icon="lucide:clock"
                                    :style="{ width: '14px', height: '14px', color: meta.color }" />
                            </template>
                            <template v-else>
                                <div class="w-2.5 h-2.5 rounded-full"
                                    :style="{ background: meta.color, opacity: '0.5' }" />
                            </template>
                        </div>
                        <div class="text-xs font-medium leading-tight text-center" :style="{ color: meta.color }">
                            {{ meta.label }}
                        </div>
                    </button>
                </div>
            </div>

            <div>
                <div class="text-sm font-semibold uppercase tracking-wider mb-2">หมายเหตุ</div>
                <NInput v-model:value="form.note_text" type="textarea" :rows="3"
                    placeholder="รายละเอียดเพิ่มเติม เช่น ความคืบหน้า ปัญหาที่พบ..." />
            </div>

            <div>
                <div class="text-sm font-semibold uppercase tracking-wider mb-2">แนบภาพหน้างาน</div>
                <NUpload multiple :file-list="stagedFiles" :default-upload="false" accept=".jpg,.jpeg,.png,.webp"
                    class="upload-full" @change="handleFileChange">
                    <div class="flex flex-col items-center justify-center gap-2 py-5 rounded-xl border border-dashed cursor-pointer transition-all hover:border-emerald-400 hover:bg-emerald-50"
                        style="border-color:#D3D1C7;text-align:center">
                        <div class="text-xs text-gray-600">คลิกหรือลากภาพมาวางที่นี่</div>
                        <div class="text-xs text-gray-500">JPG, PNG สูงสุด 10MB</div>
                    </div>
                </NUpload>
            </div>
        </div>

        <template #footer>
            <div class="flex gap-2 justify-end">
                <NButton @click="close">ยกเลิก</NButton>
                <NButton type="primary" :loading="saving" style="background:#0F6E56;border:none" @click="handleSubmit">
                    <!-- <template #icon>
                        <Icon icon="lucide:check" style="width:14px;height:14px" />
                    </template> -->
                    บันทึก
                </NButton>
            </div>
        </template>
    </NModal>
</template>

<style scoped>
.upload-full,
.upload-full :deep(.n-upload-trigger),
.upload-full :deep(.n-upload-trigger > *) {
    width: 100%;
    display: block;
}
</style>