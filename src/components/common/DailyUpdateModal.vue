<script lang="ts">
export default { name: 'DailyUpdateModal' }
</script>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import {
    NModal, NForm, NFormItem, NInput, NButton, NUpload,
    type FormInst, type FormRules, type UploadFileInfo,
} from 'naive-ui'
import { Icon } from '@iconify/vue'
import { useBreakpoint } from '@/composables/useBreakpoint'

const props = defineProps<{
    show: boolean
    date: string
    phaseName: string
}>()

const emit = defineEmits<{
    'update:show': [v: boolean]
    'saved': [payload: { date: string; work_done: string; issues: string }, files: File[]]
}>()

const { isMobile } = useBreakpoint()
const formRef = ref<FormInst | null>(null)
const saving = ref(false)
const form = reactive({ work_done: '', issues: '' })
const staged = ref<UploadFileInfo[]>([])

watch(() => props.show, v => {
    if (!v) return
    form.work_done = ''
    form.issues = ''
    staged.value = []
    formRef.value?.restoreValidation()
})

const displayDate = computed(() =>
    props.date
        ? new Date(props.date + 'T00:00:00').toLocaleDateString('th-TH', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })
        : '',
)

const rules: FormRules = {
    work_done: [{ required: true, trigger: ['blur', 'input'], message: 'กรุณากรอกสิ่งที่ทำวันนี้' }],
}

async function submit() {
    try { await formRef.value?.validate() } catch { return }
    saving.value = true
    try {
        const files = staged.value.map(f => f.file).filter((f): f is File => !!f)
        emit('saved', { date: props.date, work_done: form.work_done, issues: form.issues }, files)
        emit('update:show', false)
    } finally { saving.value = false }
}

const modalStyle = computed(() =>
    isMobile()
        ? 'width:100%;max-width:100%;margin:0;border-radius:0'
        : 'width:480px;border-radius:16px',
)
</script>

<template>
    <NModal :show="show" preset="card" :style="modalStyle" :mask-closable="false"
        :segmented="{ content: true, footer: true }" :content-style="{ overflowY: 'auto', maxHeight: '70dvh' }"
        @update:show="emit('update:show', $event)">
        <template #header>
            <div>
                <div class="text-sm font-semibold text-gray-900">บันทึก Daily Update</div>
                <div class="text-xs text-gray-400 mt-0.5">{{ phaseName }} · {{ displayDate }}</div>
            </div>
        </template>

        <NForm ref="formRef" :model="form" :rules="rules" label-placement="top" require-mark-placement="right-hanging"
            size="medium">
            <NFormItem label="สิ่งที่ทำวันนี้" path="work_done">
                <NInput v-model:value="form.work_done" type="textarea" :rows="3"
                    placeholder="อธิบายงานที่ทำในวันนี้..." />
            </NFormItem>
            <NFormItem label="ปัญหา / อุปสรรค (ถ้ามี)">
                <NInput v-model:value="form.issues" type="textarea" :rows="2" placeholder="ปัญหาหรืออุปสรรคที่พบ..." />
            </NFormItem>
            <NFormItem label="แนบภาพหน้างาน">
                <NUpload multiple :file-list="staged" :default-upload="false" accept=".jpg,.jpeg,.png,.webp"
                    class="upload-full" @change="d => staged = d.fileList">
                    <div class="flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-dashed cursor-pointer transition-all hover:border-emerald-400 hover:bg-emerald-50"
                        style="border-color:#D3D1C7;text-align:center">
                        <div class="text-xs text-gray-400">คลิกหรือลากภาพมาวางที่นี่</div>
                        <div class="text-xs text-gray-300">JPG, PNG สูงสุด 10MB</div>
                    </div>
                </NUpload>
            </NFormItem>
        </NForm>

        <template #footer>
            <div class="flex gap-2 justify-end">
                <NButton @click="emit('update:show', false)">ยกเลิก</NButton>
                <NButton type="primary" :loading="saving" style="background:#0F6E56;border:none" @click="submit">
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