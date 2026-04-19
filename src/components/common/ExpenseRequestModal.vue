<script lang="ts">
export default { name: 'ExpenseRequestModal' }
</script>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import {
    NModal, NForm, NFormItem, NInput, NInputNumber,
    NButton, NUpload, type FormInst, type FormRules, type UploadFileInfo,
} from 'naive-ui'
import { Icon } from '@iconify/vue'
import { useBreakpoint } from '@/composables/useBreakpoint'

const props = defineProps<{
    show: boolean
    phaseName: string
    projectName: string
    phaseDate: string   // completed date
    phaseBudget: number
}>()

const emit = defineEmits<{
    'update:show': [v: boolean]
    'saved': [payload: { amount: number; description: string }, docs: File[], photos: File[]]
}>()

const { isMobile } = useBreakpoint()
const formRef = ref<FormInst | null>(null)
const saving = ref(false)

const form = reactive({ amount: null as number | null, description: '' })
const stagedDocs = ref<UploadFileInfo[]>([])
const stagedPhotos = ref<UploadFileInfo[]>([])

watch(() => props.show, v => {
    if (!v) return
    form.amount = null
    form.description = ''
    stagedDocs.value = []
    stagedPhotos.value = []
    formRef.value?.restoreValidation()
})

const rules: FormRules = {
    amount: [{ required: true, type: 'number', trigger: ['blur', 'change'], message: 'กรุณากรอกจำนวนเงิน' }],
    description: [{ required: true, trigger: ['blur', 'input'], message: 'กรุณากรอกรายละเอียด' }],
}

async function handleSubmit() {
    try { await formRef.value?.validate() } catch { return }
    saving.value = true
    try {
        const docs = stagedDocs.value.map(f => f.file).filter((f): f is File => !!f)
        const photos = stagedPhotos.value.map(f => f.file).filter((f): f is File => !!f)
        emit('saved', { amount: form.amount!, description: form.description }, docs, photos)
        emit('update:show', false)
    } finally { saving.value = false }
}

const modalStyle = computed(() =>
    isMobile()
        ? 'width:100%;max-width:100%;margin:0;border-radius:0'
        : 'width:500px;border-radius:16px',
)

function formatAmount(n: number) {
    return n.toLocaleString('th-TH')
}
</script>

<template>
    <NModal :show="show" preset="card" :style="modalStyle" :mask-closable="false"
        :segmented="{ content: true, footer: true }" :content-style="{ overflowY: 'auto', maxHeight: '75dvh' }"
        @update:show="emit('update:show', $event)">

        <template #header>
            <div>
                <div class="text-sm font-semibold text-gray-900">ยื่นคำขอเบิกจ่าย</div>
                <div class="text-xs text-gray-400 mt-0.5">{{ projectName }} · {{ phaseName }}</div>
            </div>
        </template>

        <NForm ref="formRef" :model="form" :rules="rules" label-placement="top" require-mark-placement="right-hanging"
            size="medium">

            <!-- Meta -->
            <div class="grid grid-cols-2 gap-2 mb-4">
                <div class="rounded-xl p-3" style="background:#F7F6F2">
                    <div class="text-[10px] text-gray-400 mb-1">โครงการ</div>
                    <div class="text-sm font-medium text-gray-800 truncate">{{ projectName }}</div>
                </div>
                <div class="rounded-xl p-3" style="background:#F7F6F2">
                    <div class="text-[10px] text-gray-400 mb-1">Phase</div>
                    <div class="text-sm font-medium text-gray-800 truncate">{{ phaseName }}</div>
                </div>
                <div class="rounded-xl p-3" style="background:#F7F6F2">
                    <div class="text-[10px] text-gray-400 mb-1">วันที่ยื่น</div>
                    <div class="text-sm font-medium text-gray-800">{{ phaseDate }}</div>
                </div>
                <div class="rounded-xl p-3" style="background:#F7F6F2">
                    <div class="text-[10px] text-gray-400 mb-1">งบ Phase</div>
                    <div class="text-sm font-semibold" style="color:#0F6E56">
                        ฿{{ formatAmount(phaseBudget) }}
                    </div>
                </div>
            </div>

            <!-- Amount -->
            <NFormItem label="จำนวนเงินที่ขอเบิก (บาท)" path="amount">
                <NInputNumber v-model:value="form.amount" :min="0" :show-button="false" placeholder="0.00"
                    style="width:100%" />
            </NFormItem>

            <!-- Description -->
            <NFormItem label="รายละเอียด" path="description">
                <NInput v-model:value="form.description" type="textarea" :rows="3"
                    placeholder="อธิบายรายการค่าใช้จ่าย..." />
            </NFormItem>

            <!-- Documents + Photos side by side -->
            <div class="grid grid-cols-2 gap-3">
                <NFormItem label="เอกสารแนบ">
                    <NUpload multiple :file-list="stagedDocs" :default-upload="false"
                        accept=".pdf,.doc,.docx,.xls,.xlsx" class="upload-full" @change="d => stagedDocs = d.fileList">
                        <div class="flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border border-dashed cursor-pointer transition-all hover:border-emerald-400 hover:bg-emerald-50"
                            style="border-color:#D3D1C7;text-align:center">
                            <Icon icon="lucide:paperclip" style="width:18px;height:18px;color:#B4B2A9" />
                            <div class="text-[10px] text-gray-300">PDF, Word, Excel</div>
                        </div>
                    </NUpload>
                </NFormItem>

                <NFormItem label="แนบภาพหน้างาน">
                    <NUpload multiple :file-list="stagedPhotos" :default-upload="false" accept=".jpg,.jpeg,.png,.webp"
                        class="upload-full" @change="d => stagedPhotos = d.fileList">
                        <div class="flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border border-dashed cursor-pointer transition-all hover:border-emerald-400 hover:bg-emerald-50"
                            style="border-color:#D3D1C7;text-align:center">
                            <Icon icon="lucide:image" style="width:18px;height:18px;color:#B4B2A9" />
                            <div class="text-[10px] text-gray-300">JPG, PNG</div>
                        </div>
                    </NUpload>
                </NFormItem>
            </div>
        </NForm>

        <template #footer>
            <div class="flex gap-2 justify-end">
                <NButton @click="emit('update:show', false)">ยกเลิก</NButton>
                <NButton ghost style="border-color:#D3D1C7;color:#5F5E5A">
                    <template #icon>
                        <Icon icon="lucide:save" style="width:14px;height:14px" />
                    </template>
                    ร่าง
                </NButton>
                <NButton type="primary" :loading="saving" style="background:#EF9F27;border:none" @click="handleSubmit">
                    <template #icon>
                        <Icon icon="lucide:check" style="width:14px;height:14px" />
                    </template>
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