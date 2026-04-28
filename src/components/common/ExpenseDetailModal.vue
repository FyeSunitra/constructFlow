<script lang="ts">
export default { name: 'ExpenseDetailModal' }
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { NModal, NButton, NImage, NImageGroup } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { EXPENSE_STATUS_META, type ExpenseRequest } from '@/types/expense'

const props = defineProps<{
    show: boolean
    expense: ExpenseRequest | null
    phaseName: string
    projectName: string
    isCEO: boolean
}>()

const emit = defineEmits<{
    'update:show': [v: boolean]
    'approve': [id: string]
    'reject': [id: string, note?: string]
}>()

const { isMobile } = useBreakpoint()

const statusMeta = computed(() =>
    props.expense ? EXPENSE_STATUS_META[props.expense.status] : null,
)

const modalStyle = computed(() =>
    isMobile()
        ? 'width:100%;max-width:100%;margin:0;border-radius:0'
        : 'width:500px;border-radius:16px',
)

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric',
    })
}

function formatAmount(n: number) {
    return n.toLocaleString('th-TH')
}

const rejectNote = ref('')
const showRejectInput = ref(false)

</script>

<template>
    <NModal :show="show" preset="card" :style="modalStyle" :mask-closable="true"
        :segmented="{ content: true, footer: true }" :content-style="{ overflowY: 'auto', maxHeight: '75dvh' }"
        @update:show="emit('update:show', $event)">

        <template #header>
            <div>
                <div class="text-sm font-semibold text-gray-900">รายงานเบิก {{ phaseName }}</div>
                <div class="text-xs text-gray-400 mt-0.5" v-if="expense">
                    {{ expense.requester?.first_name }} {{ expense.requester?.last_name }} · {{ projectName }}
                </div>
            </div>
        </template>

        <div v-if="expense" class="flex flex-col gap-4">

            <!-- Status -->
            <span class="inline-flex items-center h-6 px-3 rounded-full text-xs font-semibold w-fit"
                :style="{ background: statusMeta?.bg, color: statusMeta?.color }">
                {{ statusMeta?.label }}
            </span>

            <!-- Meta grid -->
            <div class="grid grid-cols-2 gap-2">
                <div class="rounded-xl p-3" style="background:#F7F6F2">
                    <div class="text-[10px] text-gray-400 mb-1">โครงการ</div>
                    <div class="text-sm font-medium text-gray-800">{{ projectName }}</div>
                </div>
                <div class="rounded-xl p-3" style="background:#F7F6F2">
                    <div class="text-[10px] text-gray-400 mb-1">Phase</div>
                    <div class="text-sm font-medium text-gray-800">{{ phaseName }}</div>
                </div>
                <div class="rounded-xl p-3" style="background:#F7F6F2">
                    <div class="text-[10px] text-gray-400 mb-1">วันที่ยื่น</div>
                    <div class="text-sm font-medium text-gray-800">{{ formatDate(expense.created_at) }}</div>
                </div>
                <div class="rounded-xl p-3" style="background:#F7F6F2">
                    <div class="text-[10px] text-gray-400 mb-1">งบ Phase</div>
                    <div class="text-sm font-semibold" style="color:#0F6E56">
                        ฿{{ formatAmount(expense.amount) }}
                    </div>
                </div>
            </div>

            <!-- Description -->
            <div>
                <div class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">รายละเอียด</div>
                <div class="rounded-xl p-3 text-sm text-gray-700 leading-relaxed" style="background:#F7F6F2">
                    {{ expense.description }}
                </div>
            </div>

            <!-- Photos -->
            <div>
                <div class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">ภาพหน้างาน</div>
                <NImageGroup v-if="expense.images?.length">
                    <div class="grid grid-cols-3 gap-2">
                        <NImage v-for="img in expense.images" :key="img.id" :src="img.url" object-fit="cover"
                            class="rounded-xl overflow-hidden" style="aspect-ratio:4/3;width:100%" />
                    </div>
                </NImageGroup>
                <div v-else class="flex flex-col items-center justify-center py-8 rounded-xl gap-2"
                    style="background:#F7F6F2">
                    <Icon icon="lucide:image-off" style="width:24px;height:24px;color:#D3D1C7" />
                    <div class="text-xs text-gray-300">ไม่มีภาพหน้างาน</div>
                </div>
            </div>

            <!-- Documents -->
            <div v-if="expense.documents?.length">
                <div class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">ใบเบิกเงิน</div>
                <div class="flex flex-col gap-1.5">
                    <a v-for="doc in expense.documents" :key="doc.name" :href="(doc as any).url" target="_blank"
                        class="flex items-center gap-2.5 rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors"
                        style="background:#F7F6F2;text-decoration:none">
                        <Icon icon="lucide:file-text" style="width:14px;height:14px;color:#888780;flex-shrink:0" />
                        <span class="flex-1 text-sm text-gray-700 truncate">{{ doc.name }}</span>
                        <span v-if="doc.size" class="text-xs text-gray-400">{{ doc.size }}</span>
                        <Icon icon="lucide:download" style="width:12px;height:12px;color:#B4B2A9;flex-shrink:0" />
                    </a>
                </div>
            </div>

            <!-- Reviewer note -->
            <div v-if="expense.reviewer_note">
                <div class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">หมายเหตุผู้อนุมัติ
                </div>
                <div class="rounded-xl p-3 text-sm leading-relaxed" :style="expense.status === 'REJECTED'
                    ? 'background:#FCEBEB;color:#A32D2D'
                    : 'background:#F7F6F2;color:#5F5E5A'">
                    {{ expense.reviewer_note }}
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex items-center justify-between gap-2">
                <NButton @click="emit('update:show', false)">ปิด</NButton>
                <div v-if="isCEO && expense?.status === 'PENDING'" class="flex gap-2">
                    <NButton style="border-color:#A32D2D;color:#A32D2D" ghost
                        @click="showRejectInput = !showRejectInput">
                        ปฏิเสธ
                    </NButton>
                    <NButton type="primary" style="background:#0F6E56;border:none"
                        @click="emit('approve', expense.id); emit('update:show', false)">
                        อนุมัติ
                    </NButton>
                </div>
            </div>
            <div v-if="showRejectInput" class="mt-3 flex gap-2">
                <NInput v-model:value="rejectNote" placeholder="หมายเหตุ (ถ้ามี)" size="small" class="flex-1" />
                <NButton size="small" style="background:#A32D2D;color:#fff;border:none"
                    @click="emit('reject', expense!.id, rejectNote); emit('update:show', false)">
                    ยืนยัน
                </NButton>
            </div>
        </template>
    </NModal>
</template>