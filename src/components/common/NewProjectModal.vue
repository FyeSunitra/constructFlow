<script lang="ts">
export default { name: 'NewProjectModal' }
</script>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import {
    NModal, NForm, NFormItem, NInput, NInputNumber,
    NSelect, NDatePicker, NButton, NDivider, NUpload,
    type FormInst, type FormRules, type UploadFileInfo,
    useMessage,
} from 'naive-ui'
import { Icon } from '@iconify/vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { templateService } from '@/services/template.service'
import { userService } from '@/services/user.service'
import type { Template } from '@/types/template'
import ProjectPhaseEditor from '@/components/common/ProjectPhaseEditor.vue'
import { buildProjectPayload, emptyProjectForm } from '@/lib/project'
import type { PhaseDraft, ProjectForm } from '@/types/project'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{
    'update:show': [v: boolean]
    'saved': [payload: ReturnType<typeof buildProjectPayload>, files: File[]]
}>()

const { isMobile } = useBreakpoint()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const saving = ref(false)
const templates = ref<Template[]>([])
const loadingTpls = ref(false)
const engineers = ref<{ id: string; first_name: string; last_name: string }[]>([])
const loadingEng = ref(false)

const form = reactive<ProjectForm>(emptyProjectForm())

watch(() => props.show, async (visible) => {
    if (!visible) return
    Object.assign(form, emptyProjectForm())
    formRef.value?.restoreValidation()
    await Promise.all([fetchTemplates(), fetchEngineers()])
})

async function fetchTemplates() {
    if (templates.value.length) return
    loadingTpls.value = true
    try {
        const res = await templateService.getTemplate()
        templates.value = (res as any)?.data?.data ?? (res as any)?.data ?? []
    } catch {
        message.error('โหลด Template ไม่สำเร็จ')
    } finally {
        loadingTpls.value = false
    }
}

const templateOptions = computed(() =>
    templates.value.map(t => ({ label: t.name, value: t.id })),
)

async function fetchEngineers() {
    if (engineers.value.length) return
    loadingEng.value = true
    try {
        const res = await userService.getUsers({ role: 'ENGINEER', is_active: true, limit: 100 })
        engineers.value = (res as any)?.data?.data ?? (res as any)?.data ?? []
    } catch {
        message.error('โหลดรายชื่อวิศวกรไม่สำเร็จ')
    } finally {
        loadingEng.value = false
    }
}

const engineerOptions = computed(() =>
    engineers.value.map(u => ({
        label: `${u.first_name} ${u.last_name}`,
        value: u.id,
    })),
)

watch(() => form.template_id, (id) => {
    const tpl = templates.value.find(t => String(t.id) === String(id))
    if (!tpl) { form.phases = []; return }

    form.phases = tpl.phases
        .slice()
        .sort((a, b) => a.order_index - b.order_index)
        .map((p, i) => ({
            name: p.name,
            order_index: i + 1,
            budget_estimate: Number(p.budget_estimate ?? 0),
            start_date: '',
            end_date: '',
            checkpoints: p.checkpoints
                .slice()
                .sort((a, b) => a.order_index - b.order_index)
                .map(c => ({ name: c.name })),
        }))
})

const totalBudget = computed(() =>
    form.phases.reduce((s, p) => s + Number(p.budget_estimate ?? 0), 0),
)

const startTs = computed({
    get: () => form.start_date ? new Date(form.start_date).getTime() : null,
    set: (v) => { form.start_date = v ? new Date(v).toISOString().split('T')[0] : '' },
})
const endTs = computed({
    get: () => form.end_date ? new Date(form.end_date).getTime() : null,
    set: (v) => { form.end_date = v ? new Date(v).toISOString().split('T')[0] : '' },
})

function addPhase() {
    form.phases.push({
        name: '', order_index: form.phases.length + 1,
        budget_estimate: 0, start_date: '', end_date: '',
        checkpoints: [{ name: '' }],
    })
}

function removePhase(i: number) {
    form.phases.splice(i, 1)
}

function updatePhase(i: number, phase: PhaseDraft) {
    form.phases.splice(i, 1, phase)
}

const stagedFiles = ref<UploadFileInfo[]>([])

function handleFileChange(data: { fileList: UploadFileInfo[] }) {
    stagedFiles.value = data.fileList
    form._files = data.fileList
        .map(f => f.file)
        .filter((f): f is File => f !== undefined)
}

const rules: FormRules = {
    name: [{ required: true, trigger: ['blur', 'input'], message: 'กรุณากรอกชื่อโครงการ' }],
    owner_name: [{ required: true, trigger: ['blur', 'input'], message: 'กรุณากรอกเจ้าของโครงการ' }],
    start_date: [{ required: true, trigger: 'change', message: 'กรุณาเลือกวันเริ่ม', type: 'any' }],
    end_date: [{ required: true, trigger: 'change', message: 'กรุณาเลือกวันสิ้นสุด', type: 'any' }],
}

async function handleSubmit() {
    try { await formRef.value?.validate() } catch { return }
    saving.value = true
    try {
        const payload = buildProjectPayload(form)
        emit('saved', payload, form._files)
        emit('update:show', false)
    } finally {
        saving.value = false
    }
}

function close() { emit('update:show', false) }

const modalStyle = computed(() =>
    isMobile()
        ? 'width:100%;max-width:100%;height:100dvh;margin:0;border-radius:0;display:flex;flex-direction:column'
        : 'width:620px;max-height:88dvh;border-radius:16px;display:flex;flex-direction:column',
)
</script>

<template>
    <NModal :show="show" preset="card" title="สร้างโครงการใหม่" :style="modalStyle" :mask-closable="false"
        :segmented="{ content: true, footer: true }" :content-style="{ overflowY: 'auto', flex: '1', minHeight: '0' }"
        @update:show="emit('update:show', $event)">
        <NForm ref="formRef" :model="form" :rules="rules" label-placement="top" require-mark-placement="right-hanging"
            size="medium">
            <div class="text-sm font-semibold uppercase tracking-wider mb-3 pb-2"
                style="border-bottom:0.5px solid #F1EFE8">
                ข้อมูลโครงการ
            </div>

            <NFormItem label="ชื่อโครงการ" path="name">
                <NInput v-model:value="form.name" placeholder="ระบุชื่อโครงการ" />
            </NFormItem>

            <div :class="isMobile() ? 'flex flex-col' : 'grid grid-cols-2 gap-x-4'">
                <NFormItem label="เจ้าของโครงการ" path="owner_name">
                    <NInput v-model:value="form.owner_name" placeholder="ชื่อหน่วยงาน / เจ้าของ" />
                </NFormItem>
                <NFormItem label="งบประมาณรวม (บาท)">
                    <!-- read-only — sum of phases -->
                    <div class="w-full h-9 flex items-center px-3 rounded-lg text-sm"
                        style="background:#F7F6F2;border:0.5px solid #E3E1D8;color:#5F5E5A">
                        {{ totalBudget.toLocaleString('th-TH') }}
                    </div>
                </NFormItem>
            </div>

            <div :class="isMobile() ? 'flex flex-col' : 'grid grid-cols-2 gap-x-4'">
                <NFormItem label="วันเริ่ม" path="start_date">
                    <NDatePicker v-model:value="startTs" type="date" placeholder="เลือกวันที่" style="width:100%"
                        clearable />
                </NFormItem>
                <NFormItem label="วันสิ้นสุด" path="end_date">
                    <NDatePicker v-model:value="endTs" type="date" placeholder="เลือกวันที่" style="width:100%"
                        clearable />
                </NFormItem>
            </div>

            <NFormItem label="คำอธิบาย (ถ้ามี)">
                <NInput v-model:value="form.description" type="textarea" :rows="2" placeholder="รายละเอียดเพิ่มเติม" />
            </NFormItem>

            <NFormItem label="วิศวกรผู้รับผิดชอบ">
                <NSelect v-model:value="form.assignments" multiple :options="engineerOptions" :loading="loadingEng"
                    placeholder="เลือกวิศวกร (เลือกได้หลายคน)" clearable filterable />
            </NFormItem>

            <NDivider style="margin:4px 0 16px" />

            <div class="text-sm font-semibold uppercase tracking-wider mb-3 pb-2"
                style="border-bottom:0.5px solid #F1EFE8">
                เลือก Template
            </div>

            <NFormItem label="Template โครงการ">
                <NSelect v-model:value="form.template_id" :options="templateOptions" :loading="loadingTpls"
                    placeholder="เลือกแม่แบบโครงการ (ถ้ามี)" clearable />
            </NFormItem>

            <!-- ── Phases (auto-populated + editable) ── -->
            <template v-if="form.phases.length > 0">
                <div class="text-sm font-semibold uppercase tracking-wider mb-3 pb-2"
                    style="border-bottom:0.5px solid #F1EFE8">
                    กำหนด Phase และ Checkpoint
                </div>

                <div class="flex flex-col gap-3">
                    <ProjectPhaseEditor v-for="(phase, i) in form.phases" :key="i" :phase="phase" :index="i"
                        :can-delete="form.phases.length > 1" :project-budget="totalBudget || undefined"
                        @update:phase="updatePhase(i, $event)" @delete="removePhase(i)" />
                </div>

                <button type="button"
                    class="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-emerald-600 border border-dashed transition-all duration-150 hover:bg-emerald-50"
                    style="border-color:#9FE1CB" @click="addPhase">
                    <Icon icon="lucide:plus" style="width:14px;height:14px" />
                    เพิ่ม Phase
                </button>
            </template>

            <template v-else>
                <button type="button"
                    class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-emerald-600 border border-dashed transition-all duration-150 hover:bg-emerald-50"
                    style="border-color:#9FE1CB" @click="addPhase">
                    <Icon icon="lucide:plus" style="width:14px;height:14px" />
                    เพิ่ม Phase
                </button>
            </template>

            <NDivider style="margin:16px 0 12px" />

            <NDivider style="margin:4px 0 12px" />
            <div class="text-sm font-semibold uppercase tracking-wider mb-3 pb-2"
                style="border-bottom:0.5px solid #F1EFE8">
                เอกสารแนบ
            </div>

            <NUpload multiple :file-list="stagedFiles" :default-upload="false"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" class="upload-full" @change="handleFileChange">
                <div class="flex flex-col items-center justify-center gap-2 py-5 rounded-xl border border-dashed cursor-pointer transition-all hover:border-emerald-400 hover:bg-emerald-50"
                    style="width:100%;border-color:#D3D1C7;text-align:center">
                    <div class="text-xs text-gray-600">
                        คลิกหรือลากไฟล์มาวางที่นี่
                    </div>
                    <div class="text-[10px] text-gray-600">PDF, Word, Excel, รูปภาพ</div>
                </div>
            </NUpload>
        </NForm>

        <template #footer>
            <div class="flex gap-2" :class="isMobile() ? 'flex-col' : 'justify-end'">
                <NButton :block="isMobile()" @click="close">ยกเลิก</NButton>
                <NButton type="primary" :block="isMobile()" :loading="saving" :disabled="saving"
                    style="background:#0F6E56;border:none" @click="handleSubmit">
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