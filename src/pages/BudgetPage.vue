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

// ─── State ────────────────────────────────────────────────────────────────────

const route = useRoute()
const message = useMessage()
const auth = useAuthStore()

const isCEO = computed(() => auth.user?.role === 'CEO')

const project = ref<ProjectDetail | null>(null)
const loadingProject = ref(false)
const openPhases = ref<Set<string>>(new Set())

// modals
const showDetail = ref(false)
const showRequest = ref(false)
const activeExpense = ref<ExpenseRequest | null>(null)
const activePhase = ref<ProjectPhase | null>(null)

// ─── Mock expense data ────────────────────────────────────────────────────────

const MOCK_EXPENSES: Record<string, ExpenseRequest[]> = {
    'phase-1': [
        {
            id: 'e1', project_id: 'p1', phase_id: 'phase-1',
            requester_id: 'u1',
            requester: { id: 'u1', first_name: 'สมชาย', last_name: 'ใจดี' },
            amount: 1200000, description: 'งาน Preparation Phase เสร็จ 2 Checkpoint ทั้งหมดเสร็จตามแผนและผ่านมาตรฐาน',
            status: 'APPROVED',
            approved_by: 'ceo1', approved_at: '2025-01-14T00:00:00Z',
            rejected_by: null, rejected_at: null, reviewer_note: null,
            created_at: '2025-01-12T00:00:00Z',
            documents: [
                { name: 'receipt_excavation.pdf', size: '250KB' },
                { name: 'receipt_rebar.pdf', size: '180KB' },
            ],
        },
    ],
    'phase-2': [
        {
            id: 'e2', project_id: 'p1', phase_id: 'phase-2',
            requester_id: 'u1',
            requester: { id: 'u1', first_name: 'สมชาย', last_name: 'ใจดี' },
            amount: 3800000, description: 'ขึ้นรายงานค่าใช้จ่าย Foundation phase',
            status: 'PENDING',
            approved_by: null, approved_at: null,
            rejected_by: null, rejected_at: null, reviewer_note: null,
            created_at: '2025-02-09T00:00:00Z',
            documents: [],
        },
    ],
}

// ─── Fetch project ────────────────────────────────────────────────────────────

async function fetchProject() {
    const id = route.params.id as string
    if (!id) return
    loadingProject.value = true
    try {
        const res = await projectService.getOne(id)
        project.value = (res as any)?.data ?? res as ProjectDetail
        if (project.value) {
            route.meta.projectName = project.value.name
            // auto-open completed phases
            project.value.phases.forEach(p => {
                if (p.status === 'COMPLETED') openPhases.value.add(p.id)
            })
        }
    } catch { message.error('โหลดข้อมูลโปรเจ็คไม่สำเร็จ') }
    finally { loadingProject.value = false }
}

onMounted(fetchProject)

// ─── Budget stats ─────────────────────────────────────────────────────────────

const totalBudget = computed(() =>
    project.value?.phases.reduce((s, p) => s + Number(p.budget_estimate ?? 0), 0) ?? 0,
)

const allExpenses = computed(() =>
    Object.values(MOCK_EXPENSES).flat(),
)

const paidAmount = computed(() =>
    allExpenses.value.filter(e => e.status === 'APPROVED').reduce((s, e) => s + e.amount, 0),
)

const pendingAmount = computed(() =>
    allExpenses.value.filter(e => e.status === 'PENDING').reduce((s, e) => s + e.amount, 0),
)

const remaining = computed(() => totalBudget.value - paidAmount.value - pendingAmount.value)

// ─── Phase helpers ────────────────────────────────────────────────────────────

function togglePhase(id: string) {
    if (openPhases.value.has(id)) openPhases.value.delete(id)
    else openPhases.value.add(id)
}

function phaseExpenses(phaseId: string): ExpenseRequest[] {
    return MOCK_EXPENSES[phaseId] ?? []
}

function canRequest(phase: ProjectPhase): boolean {
    return phase.status === 'COMPLETED'
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

// ─── Modal openers ────────────────────────────────────────────────────────────

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
    try {
        // TODO: await expenseService.create(projectId, phaseId, payload, docs, photos)
        message.success('ยื่นคำขอเบิกจ่ายเรียบร้อย')
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

                <!-- Loading -->
                <template v-if="loadingProject">
                    <div class="h-44 rounded-2xl animate-pulse" style="background:#F1EFE8" />
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div v-for="i in 4" :key="i" class="h-24 rounded-xl animate-pulse" style="background:#F1EFE8" />
                    </div>
                </template>

                <template v-else-if="project">

                    <!-- Project card -->
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

                                <!-- Cannot request yet -->
                                <div v-if="!canRequest(phase)" class="rounded-xl p-4 text-sm text-center"
                                    style="background:#F7F6F2;color:#B4B2A9">
                                    ยังไม่สามารถเบิกได้ — Phase ยังไม่เสร็จสิ้น
                                </div>

                                <!-- Expense requests list -->
                                <template v-else>
                                    <div v-for="expense in phaseExpenses(phase.id)" :key="expense.id"
                                        class="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50"
                                        style="border:0.5px solid #E3E1D8" @click="openDetail(expense)">
                                        <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                            style="background:#E1F5EE">
                                            <Icon icon="lucide:receipt" style="width:14px;height:14px;color:#0F6E56" />
                                        </div>

                                        <div class="flex-1 min-w-0">
                                            <div class="text-sm font-medium text-gray-800">
                                                {{ expense.requester.first_name }} {{ expense.requester.last_name }}
                                            </div>
                                            <div class="text-xs text-gray-400 mt-0.5">
                                                {{ formatDate(expense.created_at) }} · ฿{{ formatAmount(expense.amount)
                                                }}
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

                                    <!-- No requests yet -->
                                    <div v-if="!phaseExpenses(phase.id).length"
                                        class="rounded-xl p-4 text-sm text-center"
                                        style="background:#F7F6F2;color:#B4B2A9">
                                        ยังไม่มีรายการเบิกจ่าย
                                    </div>

                                    <!-- Request button -->
                                    <NButton dashed class="w-full" style="border-color:#9FE1CB;color:#0F6E56"
                                        @click.stop="openRequest(phase)">
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

                <!-- Not found -->
                <div v-else class="py-16 text-center text-gray-300 text-sm">
                    ไม่พบข้อมูลโปรเจ็ค
                </div>

            </main>
        </div>
    </div>

    <!-- Expense detail modal -->
    <ExpenseDetailModal v-model:show="showDetail" :expense="activeExpense"
        :phase-name="activePhase?.name ?? activeExpense?.phase_id ?? ''" :project-name="project?.name ?? ''" />

    <!-- Expense request modal -->
    <ExpenseRequestModal v-model:show="showRequest" :phase-name="activePhase?.name ?? ''"
        :project-name="project?.name ?? ''" :phase-date="formatDate(activePhase?.end_date ?? null)"
        :phase-budget="Number(activePhase?.budget_estimate ?? 0)" @saved="onRequestSaved" />
</template>