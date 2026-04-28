<script lang="ts">
export default { name: 'BudgetPage' }
</script>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, useMessage } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '@/store/auth.store'
import { projectService } from '@/services/project.service'
import ProjectDetailCard from '@/components/common/ProjectDetailCard.vue'
import ExpenseDetailModal from '@/components/common/ExpenseDetailModal.vue'
import ExpenseRequestModal from '@/components/common/ExpenseRequestModal.vue'
import { EXPENSE_STATUS_META, type ExpenseRequest, type ExpenseStatus } from '@/types/expense'
import { type ProjectDetail, type ProjectPhase } from '@/types/project'
import { expenseService } from '@/services/expense.service'

const route = useRoute()
const message = useMessage()
const auth = useAuthStore()

const isCEO = computed(() => auth.user?.role === 'CEO')
const projectId = computed(() => route.params.id as string)

const project = ref<ProjectDetail | null>(null)
const loadingProject = ref(false)
const expenses = ref<ExpenseRequest[]>([])
const loadingExpenses = ref(false)
const openPhases = ref<Set<string>>(new Set())

const showDetail = ref(false)
const showRequest = ref(false)
const activeExpense = ref<ExpenseRequest | null>(null)
const activePhase = ref<ProjectPhase | null>(null)

async function fetchProject() {
    const id = projectId.value
    if (!id) return
    loadingProject.value = true
    try {
        const res = await projectService.getOne(id)
        project.value = (res as any)?.data ?? res as ProjectDetail
        if (project.value) {
            route.meta.projectName = project.value.name
            project.value.phases.forEach(p => {
                if (p.status === 'COMPLETED') openPhases.value.add(p.id)
            })
        }
    } catch { message.error('โหลดข้อมูลโปรเจ็คไม่สำเร็จ') }
    finally { loadingProject.value = false }
}

async function fetchExpenses() {
    loadingExpenses.value = true
    try {
        const res = await expenseService.getAll(projectId.value)
        expenses.value = (res as any)?.data ?? res
    } catch { message.error('โหลดข้อมูลการเบิกจ่ายไม่สำเร็จ') }
    finally { loadingExpenses.value = false }
}

onMounted(() => {
    fetchProject()
    fetchExpenses()
})

// ─── Budget stats ─────────────────────────────────────────────────────────────

const totalBudget = computed(() =>
    project.value?.phases.reduce((s, p) => s + Number(p.budget_estimate ?? 0), 0) ?? 0,
)

const paidAmount = computed(() =>
    expenses.value.filter(e => e.status === 'APPROVED').reduce((s, e) => s + Number(e.amount), 0),
)

const pendingAmount = computed(() =>
    expenses.value.filter(e => e.status === 'PENDING').reduce((s, e) => s + Number(e.amount), 0),
)

const remaining = computed(() => totalBudget.value - paidAmount.value - pendingAmount.value)

// ─── Phase helpers ────────────────────────────────────────────────────────────

function togglePhase(id: string) {
    if (openPhases.value.has(id)) openPhases.value.delete(id)
    else openPhases.value.add(id)
}

function phaseExpenses(phaseId: string): ExpenseRequest[] {
    return expenses.value.filter(e => e.phase_id === phaseId)
}

function phaseStyle(phase: ProjectPhase) {
    switch (phase.status) {
        case 'COMPLETED': return { header: '#1D9E75', border: '#9FE1CB' }
        case 'IN_PROGRESS': return { header: '#BA7517', border: '#EF9F27' }
        default: return { header: '#888780', border: '#E3E1D8' }
    }
}

const PHASE_STATUS_LABEL: Record<string, string> = {
    COMPLETED: 'COMPLETED',
    IN_PROGRESS: 'IN PROGRESS',
    PENDING: 'PENDING',
}

function phaseProgress(phase: ProjectPhase) {
    const total = phase.checkpoints.length
    const done = phase.checkpoints.filter(c => c.status === 'COMPLETED').length
    return { done, total, pct: total ? Math.round(done / total * 100) : 0 }
}

function formatAmount(n: number) {
    return n.toLocaleString('th-TH')
}

function formatDate(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

function openDetail(expense: ExpenseRequest) {
    activeExpense.value = expense
    showDetail.value = true
}

function openRequest(phase: ProjectPhase) {
    activePhase.value = phase
    showRequest.value = true
}

async function onRequestSaved(
    payload: { amount: number; description: string },
    docs: File[],
    photos: File[],
) {
    if (!activePhase.value) return
    try {
        const res = await expenseService.create(projectId.value, {
            phase_id: activePhase.value.id,
            amount: payload.amount,
            description: payload.description,
        })
        const reqId = (res as any)?.id as string

        if (reqId) {
            if (photos.length) await expenseService.uploadImages(projectId.value, reqId, photos)
            if (docs.length) await expenseService.uploadDocuments(projectId.value, reqId, docs)
        }

        message.success('ยื่นคำขอเบิกจ่ายเรียบร้อย')
        await fetchExpenses()
    } catch { message.error('เกิดข้อผิดพลาด') }
}

async function onApprove(reqId: string) {
    try {
        await expenseService.approve(projectId.value, reqId)
        message.success('อนุมัติเรียบร้อย')
        showDetail.value = false
        await fetchExpenses()
    } catch { message.error('เกิดข้อผิดพลาด') }
}

async function onReject(reqId: string, note?: string) {
    try {
        await expenseService.reject(projectId.value, reqId, note)
        message.success('ปฏิเสธเรียบร้อย')
        showDetail.value = false
        await fetchExpenses()
    } catch { message.error('เกิดข้อผิดพลาด') }
}
</script>

<template>
    <div class="flex h-screen overflow-hidden">
        <AppSidebar />

        <div class="flex-1 flex flex-col overflow-hidden" style="background:#F7F6F2">
            <header class="shrink-0 bg-white border-b border-gray-100 px-4 md:px-6 py-3">
                <AppBreadcrumb />
            </header>

            <main class="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">

                <template v-if="loadingProject">
                    <div class="h-44 rounded-2xl animate-pulse" style="background:#F1EFE8" />
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div v-for="i in 4" :key="i" class="h-24 rounded-xl animate-pulse" style="background:#F1EFE8" />
                    </div>
                </template>

                <template v-else-if="project">
                    <ProjectDetailCard :project="project" />

                    <!-- Stat cards -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div class="rounded-xl p-4 flex flex-col gap-1" style="background:#0F6E56">
                            <div class="text-xs font-medium" style="color:rgba(255,255,255,0.7)">งบประมาณรวม</div>
                            <div class="text-xl font-bold text-white">฿{{ formatAmount(totalBudget) }}</div>
                        </div>
                        <div class="rounded-xl p-4 flex flex-col gap-1" style="background:#EF9F27">
                            <div class="text-xs font-medium" style="color:rgba(255,255,255,0.8)">เบิกจ่ายแล้ว</div>
                            <div class="text-xl font-bold text-white">฿{{ formatAmount(paidAmount) }}</div>
                        </div>
                        <div class="rounded-xl p-4 flex flex-col gap-1" style="background:#534AB7">
                            <div class="text-xs font-medium" style="color:rgba(255,255,255,0.8)">รออนุมัติ</div>
                            <div class="text-xl font-bold text-white">฿{{ formatAmount(pendingAmount) }}</div>
                        </div>
                        <div class="rounded-xl p-4 flex flex-col gap-1" style="background:#185FA5">
                            <div class="text-xs font-medium" style="color:rgba(255,255,255,0.8)">คงเหลือ</div>
                            <div class="text-xl font-bold text-white">฿{{ formatAmount(remaining) }}</div>
                        </div>
                    </div>

                    <!-- Phase accordion -->
                    <div class="flex flex-col gap-3">
                        <div v-for="phase in project.phases" :key="phase.id" class="rounded-xl overflow-hidden"
                            :style="{ border: `0.5px solid ${phaseStyle(phase).border}` }">

                            <!-- Phase header -->
                            <div class="flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none"
                                :style="{ background: phaseStyle(phase).header }" @click="togglePhase(phase.id)">
                                <span class="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded"
                                    style="background:rgba(255,255,255,0.2);color:#fff">
                                    Phase {{ phase.order_index }}
                                </span>
                                <div class="flex-1 min-w-0">
                                    <div class="text-sm font-bold text-white truncate">{{ phase.name }}</div>
                                    <div class="text-[11px] mt-0.5" style="color:rgba(255,255,255,0.72)">
                                        {{ phaseProgress(phase).pct }}% · {{ phaseProgress(phase).done }}/{{
                                            phaseProgress(phase).total }} Checkpoint
                                    </div>
                                </div>
                                <span class="flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full"
                                    style="background:rgba(255,255,255,0.2);color:#fff">
                                    {{ PHASE_STATUS_LABEL[phase.status ?? 'PENDING'] ?? 'PENDING' }}
                                </span>
                                <Icon icon="lucide:chevron-down" :style="{
                                    width: '17px', height: '17px', color: 'rgba(255,255,255,0.8)',
                                    transform: openPhases.has(phase.id) ? 'rotate(180deg)' : 'none',
                                    transition: 'transform 0.2s', flexShrink: '0',
                                }" />
                            </div>

                            <!-- Phase body -->
                            <div v-if="openPhases.has(phase.id)" class="bg-white p-4 flex flex-col gap-3">

                                <div v-if="phase.status !== 'COMPLETED'" class="rounded-xl p-4 text-sm text-center"
                                    style="background:#F7F6F2;color:#B4B2A9">
                                    ยังไม่สามารถเบิกได้ — Phase ยังไม่เสร็จสิ้น
                                </div>

                                <template v-else>
                                    <!-- Expense list -->
                                    <div v-if="loadingExpenses" class="h-12 rounded-xl animate-pulse"
                                        style="background:#F1EFE8" />

                                    <template v-else>
                                        <div v-for="expense in phaseExpenses(phase.id)" :key="expense.id"
                                            class="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50"
                                            style="border:0.5px solid #E3E1D8" @click="openDetail(expense)">
                                            <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                                style="background:#E1F5EE">
                                                <Icon icon="lucide:receipt"
                                                    style="width:14px;height:14px;color:#0F6E56" />
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <div class="text-sm font-medium text-gray-800">
                                                    {{ expense.requester?.first_name }} {{ expense.requester?.last_name
                                                    }}
                                                </div>
                                                <div class="text-xs text-gray-400 mt-0.5">
                                                    {{ formatDate(expense.created_at) }} · ฿{{
                                                        formatAmount(Number(expense.amount)) }}
                                                </div>
                                            </div>
                                            <span
                                                class="flex-shrink-0 inline-flex items-center h-5 px-2 rounded-full text-[10px] font-semibold"
                                                :style="{
                                                    background: EXPENSE_STATUS_META[expense.status as ExpenseStatus].bg,
                                                    color: EXPENSE_STATUS_META[expense.status as ExpenseStatus].color,
                                                }">
                                                {{ EXPENSE_STATUS_META[expense.status as ExpenseStatus].label }}
                                            </span>
                                            <Icon icon="lucide:chevron-right"
                                                style="width:14px;height:14px;color:#D3D1C7;flex-shrink:0" />
                                        </div>

                                        <div v-if="!phaseExpenses(phase.id).length"
                                            class="rounded-xl p-4 text-sm text-center"
                                            style="background:#F7F6F2;color:#B4B2A9">
                                            ยังไม่มีรายการเบิกจ่าย
                                        </div>
                                    </template>

                                    <!-- Request button (engineer only) -->
                                    <NButton v-if="!isCEO" dashed class="w-full"
                                        style="border-color:#9FE1CB;color:#0F6E56" @click.stop="openRequest(phase)">
                                        <template #icon>
                                            <Icon icon="lucide:plus" style="width:14px;height:14px" />
                                        </template>
                                        ยื่นคำขอเบิกจ่าย
                                    </NButton>
                                </template>
                            </div>
                        </div>
                    </div>
                </template>

                <div v-else class="py-16 text-center text-gray-300 text-sm">ไม่พบข้อมูลโปรเจ็ค</div>
            </main>
        </div>
    </div>

    <ExpenseDetailModal v-model:show="showDetail" :expense="activeExpense"
        :phase-name="activeExpense?.phase?.name ?? activePhase?.name ?? ''" :project-name="project?.name ?? ''"
        :is-c-e-o="isCEO" @approve="onApprove" @reject="onReject" />

    <ExpenseRequestModal v-model:show="showRequest" :phase-name="activePhase?.name ?? ''"
        :project-name="project?.name ?? ''" :phase-date="formatDate(activePhase?.end_date ?? null)"
        :phase-budget="Number(activePhase?.budget_estimate ?? 0)" @saved="onRequestSaved" />
</template>