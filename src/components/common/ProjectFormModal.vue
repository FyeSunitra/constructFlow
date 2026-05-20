<script lang="ts">
export default { name: 'ProjectFormModal' }
</script>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import {
    NModal, NForm, NFormItem, NInput, NSelect,
    NDatePicker, NButton, NDivider, NUpload,
    NInputNumber,
    type FormInst, type FormRules, type UploadFileInfo,
    useMessage,
} from 'naive-ui'
import { Icon } from '@iconify/vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { templateService } from '@/services/template.service'
import { userService } from '@/services/user.service'
import { projectService } from '@/services/project.service'
import type { Template } from '@/types/template'
import type { Project, PhaseDraft, ProjectForm, ProjectDocument } from '@/types/project'
import { buildProjectPayload, emptyProjectForm } from '@/lib/project'
import ProjectPhaseEditor from '@/components/common/ProjectPhaseEditor.vue'

const props = defineProps<{
    show: boolean
    editing: Project | null
}>()

const emit = defineEmits<{
    'update:show': [v: boolean]
    'saved': []
}>()

const { isMobile } = useBreakpoint()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const saving = ref(false)
const loadingForm = ref(false)

const templates = ref<Template[]>([])
const loadingTpls = ref(false)
const engineers = ref<{ id: string; first_name: string; last_name: string }[]>([])
const loadingEng = ref(false)

const form = reactive<ProjectForm>(emptyProjectForm())
const stagedFiles = ref<UploadFileInfo[]>([])

const isEdit = computed(() => props.editing !== null)
const modalTitle = computed(() => isEdit.value ? 'แก้ไขโครงการ' : 'สร้างโครงการใหม่')
const existingDocs = ref<ProjectDocument[]>([])

watch(() => props.show, async (visible) => {
    if (!visible) return
    existingDocs.value = []
    Object.assign(form, emptyProjectForm())
    stagedFiles.value = []
    formRef.value?.restoreValidation()

    const fetchDetail = isEdit.value && props.editing
        ? projectService.getOne(props.editing.id)
        : Promise.resolve(null)

    loadingForm.value = true
    try {
        const [, , detailRes] = await Promise.all([
            fetchTemplates(),
            fetchEngineers(),
            fetchDetail,
        ])

        if (detailRes) {
            const d = (detailRes as any)?.data ?? detailRes

            form.name = d.name ?? ''
            form.description = d.description ?? ''
            form.owner_name = d.owner_name ?? ''
            form.start_date = d.start_date ? d.start_date.split('T')[0] : ''
            form.end_date = d.end_date ? d.end_date.split('T')[0] : ''
            form.template_id = d.template_id ?? ''
            form.assignments = (d.assignments ?? []).map((a: any) => a.engineer_id)
            form.total_budget = Number(d.budget_total ?? 0)
            form.phases = (d.phases ?? [])
                .slice()
                .sort((a: any, b: any) => a.order_index - b.order_index)
                .map((p: any, i: number) => ({
                    name: p.name,
                    order_index: i + 1,
                    budget_estimate: Number(p.budget_estimate ?? 0),
                    start_date: p.start_date ? p.start_date.split('T')[0] : '',
                    end_date: p.end_date ? p.end_date.split('T')[0] : '',
                    checkpoints: (p.checkpoints ?? [])
                        .slice()
                        .sort((a: any, b: any) => a.order_index - b.order_index)
                        .map((c: any) => ({ name: c.name })),
                }))
            existingDocs.value = d.documents ?? []
        }
    } catch {
        message.error('โหลดข้อมูลไม่สำเร็จ')
    } finally {
        loadingForm.value = false
    }
})

async function fetchTemplates() {
    if (templates.value.length) return
    loadingTpls.value = true
    try {
        const res = await templateService.getTemplate()
        templates.value = (res as any)?.data?.data ?? (res as any)?.data ?? []
    } finally { loadingTpls.value = false }
}

const templateOptions = computed(() =>
    templates.value.map(t => ({ label: t.name, value: t.id })),
)

const initializingForm = ref(false)

watch(() => form.template_id, (id) => {
    if (initializingForm.value) return

    const tpl = templates.value.find(t => String(t.id) === String(id))

    if (!tpl) {
        form.phases = []
        return
    }

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

async function fetchEngineers() {
    if (engineers.value.length) return
    loadingEng.value = true
    try {
        const res = await userService.getUsers({ role: 'ENGINEER', is_active: true, limit: 100 })
        engineers.value = (res as any)?.data?.data ?? (res as any)?.data ?? []
    } finally { loadingEng.value = false }
}

const engineerOptions = computed(() =>
    engineers.value.map(u => ({
        label: `${u.first_name} ${u.last_name}`,
        value: u.id,
    })),
)

const totalBudget = computed(() =>
    form.phases.reduce((s, p) => s + Number(p.budget_estimate ?? 0), 0),
)

function formatLocalDate(ts: number) {
    const d = new Date(ts)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

const startTs = computed({
    get: () => form.start_date ? new Date(`${form.start_date}T00:00:00`).getTime() : null,
    set: (v) => {
        form.start_date = v ? formatLocalDate(v) : ''
    },
})

const endTs = computed({
    get: () => form.end_date ? new Date(`${form.end_date}T00:00:00`).getTime() : null,
    set: (v) => {
        form.end_date = v ? formatLocalDate(v) : ''
    },
})

function addPhase() {
    form.phases.push({
        name: '', order_index: form.phases.length + 1,
        budget_estimate: 0, start_date: '', end_date: '',
        checkpoints: [{ name: '' }],
    })
}
function removePhase(i: number) { form.phases.splice(i, 1) }
function updatePhase(i: number, phase: PhaseDraft) { form.phases.splice(i, 1, phase) }

function handleFileChange(data: { fileList: UploadFileInfo[] }) {
    stagedFiles.value = data.fileList
    form._files = data.fileList.map(f => f.file).filter((f): f is File => f !== undefined)
}

const rules: FormRules = {
    name: [{ required: true, trigger: ['blur', 'input'], message: 'กรุณากรอกชื่อโครงการ' }],
    owner_name: [{ required: true, trigger: ['blur', 'input'], message: 'กรุณากรอกเจ้าของโครงการ' }],
    template_id: [
        { required: true, trigger: 'change', message: 'กรุณาเลือก Template' }
    ],
    start_date: [
        { required: true, trigger: 'change', message: 'กรุณาเลือกวันเริ่ม', type: 'any' },
        {
            trigger: 'change',
            validator() {
                if (!form.start_date || !form.end_date) return true
                return form.start_date <= form.end_date
                    ? true
                    : new Error('วันเริ่มต้องไม่มากกว่าวันสิ้นสุด')
            },
        },
    ],

    end_date: [
        { required: true, trigger: 'change', message: 'กรุณาเลือกวันสิ้นสุด', type: 'any' },
        {
            trigger: 'change',
            validator() {
                if (!form.start_date || !form.end_date) return true
                return form.end_date >= form.start_date
                    ? true
                    : new Error('วันสิ้นสุดต้องไม่น้อยกว่าวันเริ่ม')
            },
        },
    ]
}

const totalPhaseBudget = computed(() =>
    form.phases.reduce((s, p) => s + Number(p.budget_estimate ?? 0), 0),
)

const isBudgetExceeded = computed(() =>
    form.total_budget > 0 && totalPhaseBudget.value > form.total_budget
)

async function handleSubmit() {
    try { await formRef.value?.validate() } catch { return }
    saving.value = true
    try {
        const payload = buildProjectPayload(form)
        let projectId: string

        if (isEdit.value && props.editing) {
            await projectService.update(props.editing.id, payload)
            projectId = props.editing.id
            message.success('บันทึกโครงการเรียบร้อย')
        } else {
            const res = await projectService.create(payload)
            projectId = (res as any)?.id as string
            message.success('สร้างโครงการสำเร็จ')
        }

        if (form._files.length && projectId) {
            await projectService.uploadDocuments(projectId, form._files)
        }

        emit('saved')
        emit('update:show', false)
    } catch (err) {
        message.error(isEdit.value ? 'บันทึกไม่สำเร็จ' : 'สร้างไม่สำเร็จ กรุณาลองใหม่')
        console.error('[ProjectFormModal]', err)
    } finally {
        saving.value = false
    }
}

async function removeExistingDoc(docId: string) {
    existingDocs.value = existingDocs.value.filter(d => d.id !== docId)
    await projectService.removeDocument(props.editing!.id, docId)
}

function close() { emit('update:show', false) }

const modalStyle = computed(() =>
    isMobile()
        ? 'width:100%;max-width:100%;height:100dvh;margin:0;border-radius:0;display:flex;flex-direction:column'
        : 'width:620px;max-height:88dvh;border-radius:16px;display:flex;flex-direction:column',
)
</script>

<template>
    <NModal :show="show" preset="card" :title="modalTitle" :style="modalStyle" :mask-closable="false"
        :segmented="{ content: true, footer: true }" :content-style="{ overflowY: 'auto', flex: '1', minHeight: '0' }"
        @update:show="emit('update:show', $event)">

        <!-- Loading overlay while fetching detail -->
        <div v-if="loadingForm" class="flex items-center justify-center py-16">
            <div class="flex flex-col items-center gap-3">
                <div class="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                <span class="text-sm text-gray-400">กำลังโหลดข้อมูล...</span>
            </div>
        </div>

        <NForm v-else ref="formRef" :model="form" :rules="rules" label-placement="top"
            require-mark-placement="right-hanging" size="medium">

            <div class="text-sm font-semibold uppercase tracking-wider mb-3 pb-2"
                style="border-bottom:0.5px solid #F1EFE8">ข้อมูลโครงการ</div>

            <NFormItem label="ชื่อโครงการ" path="name">
                <NInput v-model:value="form.name" placeholder="ระบุชื่อโครงการ" />
            </NFormItem>

            <div :class="isMobile() ? 'flex flex-col' : 'grid grid-cols-2 gap-x-4'">
                <NFormItem label="เจ้าของโครงการ" path="owner_name">
                    <NInput v-model:value="form.owner_name" placeholder="ชื่อหน่วยงาน / เจ้าของ" />
                </NFormItem>
                <NFormItem label="งบประมาณรวม (บาท)">
                    <NInputNumber v-model:value="form.total_budget" :min="0" :show-button="false" placeholder="0"
                        style="width:100%" />
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
                <NSelect v-model:value="form.assignments" multiple filterable clearable :options="engineerOptions"
                    :loading="loadingEng" placeholder="เลือกวิศวกร (เลือกได้หลายคน)" />
            </NFormItem>

            <NDivider style="margin:4px 0 16px" />

            <div class="text-sm font-semibold uppercase tracking-wider mb-3 pb-2"
                style="border-bottom:0.5px solid #F1EFE8">เลือก Template</div>

            <NFormItem label="Template โครงการ" path="template_id">
                <NSelect v-model:value="form.template_id" :options="templateOptions" :loading="loadingTpls"
                    placeholder="เลือกแม่แบบโครงการ (ถ้ามี)" clearable />
            </NFormItem>

            <div v-if="form.total_budget > 0" class="rounded-xl px-4 py-2.5 flex items-center justify-between mb-2"
                :style="isBudgetExceeded
                    ? 'background:#FCEBEB;border:0.5px solid #F5C6C6'
                    : 'background:#F7F6F2;border:0.5px solid #E3E1D8'">
                <span class="text-xs" :style="isBudgetExceeded ? 'color:#A32D2D' : 'color:#888780'">
                    งบ Phase รวม: ฿{{ totalPhaseBudget.toLocaleString('th-TH') }}
                    / ฿{{ form.total_budget.toLocaleString('th-TH') }}
                </span>
                <span v-if="isBudgetExceeded" class="text-xs font-semibold" style="color:#A32D2D">
                    เกินงบ ฿{{ (totalPhaseBudget - form.total_budget).toLocaleString('th-TH') }}
                </span>
                <span v-else class="text-xs font-semibold" style="color:#0F6E56">
                    คงเหลือ ฿{{ (form.total_budget - totalPhaseBudget).toLocaleString('th-TH') }}
                </span>
            </div>
            <!-- Phases -->
            <template v-if="form.phases.length > 0">
                <div class="text-sm font-semibold uppercase tracking-wider mb-3 pb-2"
                    style="border-bottom:0.5px solid #F1EFE8">กำหนด Phase และ Checkpoint</div>
                <div class="flex flex-col gap-3">
                    <ProjectPhaseEditor v-for="(phase, i) in form.phases" :key="i" :phase="phase" :index="i"
                        :can-delete="form.phases.length > 1" :project-budget="totalBudget || undefined"
                        @update:phase="updatePhase(i, $event)" @delete="removePhase(i)" />
                </div>
                <button type="button"
                    class="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-emerald-600 border border-dashed transition-all duration-150 hover:bg-emerald-50"
                    style="border-color:#9FE1CB" @click="addPhase">
                    <Icon icon="lucide:plus" style="width:14px;height:14px" />เพิ่ม Phase
                </button>
            </template>
            <template v-else>
                <button type="button"
                    class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-emerald-600 border border-dashed transition-all duration-150 hover:bg-emerald-50"
                    style="border-color:#9FE1CB" @click="addPhase">
                    <Icon icon="lucide:plus" style="width:14px;height:14px" />เพิ่ม Phase
                </button>
            </template>


            <!-- เอกสารแนบ — เปิดให้ทั้ง create และ edit -->
            <NDivider style="margin:16px 0 12px" />
            <div class="text-sm font-semibold uppercase tracking-wider mb-3 pb-2"
                style="border-bottom:0.5px solid #F1EFE8">
                เอกสารแนบ</div>

            <!-- แสดงเอกสารเดิม (edit mode) -->
            <div v-if="existingDocs.length" class="flex flex-col gap-1.5 mb-3">
                <div v-for="doc in existingDocs" :key="doc.id" class="flex items-center gap-2.5 rounded-lg px-3 py-2"
                    style="background:#F7F6F2;border:0.5px solid #E3E1D8">
                    <Icon icon="lucide:file-text" style="width:13px;height:13px;color:#888780;flex-shrink:0" />
                    <span class="flex-1 text-xs text-gray-600 truncate">{{ doc.name }}</span>
                    <button class="text-xs text-red-400 hover:text-red-600" @click="removeExistingDoc(doc.id)">
                        <Icon icon="lucide:x" style="width:13px;height:13px" />
                    </button>
                </div>
            </div>

            <NUpload multiple :file-list="stagedFiles" :default-upload="false"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" class="upload-full" @change="handleFileChange">
                <div class="flex flex-col items-center justify-center gap-2 py-5 rounded-xl border border-dashed cursor-pointer transition-all hover:border-emerald-400 hover:bg-emerald-50"
                    style="width:100%;border-color:#D3D1C7;text-align:center">
                    <div class="text-xs text-gray-400">คลิกหรือลากไฟล์มาวางที่นี่</div>
                    <div class="text-xs text-gray-300">PDF, Word, Excel, รูปภาพ</div>
                </div>
            </NUpload>

        </NForm>

        <template #footer>
            <div class="flex gap-2" :class="isMobile() ? 'flex-col' : 'justify-end'">
                <NButton :block="isMobile()" @click="close">ยกเลิก</NButton>
                <NButton type="primary" :block="isMobile()" :loading="saving || loadingForm"
                    :disabled="saving || loadingForm" style="background:#0F6E56;border:none" @click="handleSubmit">
                    <template #icon>
                        <Icon icon="lucide:check" style="width:14px;height:14px" />
                    </template>
                    {{ isEdit ? 'บันทึก' : 'สร้างโครงการ' }}
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