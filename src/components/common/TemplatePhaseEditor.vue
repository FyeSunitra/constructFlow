<script lang="ts">
export default { name: 'TemplatePhaseEditor' }
</script>

<script setup lang="ts">
import { NInput, NInputNumber, NButton, NPopconfirm } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { type PhaseDraft } from '@/types/template'

const props = defineProps<{
    phase: PhaseDraft
    index: number
    canDelete: boolean
}>()

const emit = defineEmits<{
    'update:phase': [phase: PhaseDraft]
    'delete': []
}>()

function update(patch: Partial<PhaseDraft>) {
    emit('update:phase', { ...props.phase, ...patch })
}

function updateCheckpoint(i: number, name: string) {
    const checkpoints = props.phase.checkpoints.map((c, idx) =>
        idx === i ? { name } : c,
    )
    update({ checkpoints })
}

function addCheckpoint() {
    update({ checkpoints: [...props.phase.checkpoints, { name: '' }] })
}

function removeCheckpoint(i: number) {
    update({ checkpoints: props.phase.checkpoints.filter((_, idx) => idx !== i) })
}
</script>

<template>
    <div class="rounded-xl overflow-hidden" style="border:0.5px solid #E3E1D8">

        <!-- Phase header -->
        <div class="flex items-center gap-2 px-3 py-2.5" style="background:#F7F6F2;border-bottom:0.5px solid #E3E1D8">
            <span class="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded"
                style="background:#E1F5EE;color:#0F6E56">
                Phase {{ index + 1 }}
            </span>
            <NInput :value="phase.name" size="small" placeholder="ชื่อ Phase" class="flex-1"
                @update:value="update({ name: $event })" />
            <NPopconfirm v-if="canDelete" positive-text="ลบ" negative-text="ยกเลิก"
                :positive-button-props="{ type: 'error', size: 'small' }" @positive-click="emit('delete')">
                <template #trigger>
                    <NButton quaternary circle size="tiny" type="error">
                        <template #icon>
                            <Icon icon="lucide:trash-2" style="width:13px;height:13px" />
                        </template>
                    </NButton>
                </template>
                ลบ Phase นี้?
            </NPopconfirm>
        </div>

        <!-- Phase body -->
        <div class="p-3 flex flex-col gap-3">

            <!-- Budget -->
            <div class="flex items-center gap-2">
                <span class="text-xs text-gray-400 flex-shrink-0">งบประมาณ Phase (บาท)</span>
                <NInputNumber :value="phase.budget_estimate" size="small" :min="0" :show-button="false" placeholder="0"
                    style="width:140px" @update:value="update({ budget_estimate: $event ?? 0 })" />
            </div>

            <!-- Checkpoints -->
            <div>
                <div class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Checkpoints
                </div>

                <div class="flex flex-col gap-1.5">
                    <div v-for="(cp, ci) in phase.checkpoints" :key="ci" class="flex items-center gap-2">
                        <span class="text-xs text-gray-300 w-4 text-right flex-shrink-0">{{ ci + 1 }}</span>
                        <NInput :value="cp.name" size="small" placeholder="ชื่อ Checkpoint" class="flex-1"
                            @update:value="updateCheckpoint(ci, $event)" />
                        <NButton quaternary circle size="tiny" :disabled="phase.checkpoints.length === 1"
                            @click="removeCheckpoint(ci)">
                            <template #icon>
                                <Icon icon="lucide:x" style="width:12px;height:12px" />
                            </template>
                        </NButton>
                    </div>
                </div>

                <!-- Add checkpoint -->
                <button
                    class="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium hover:text-emerald-800 transition-colors"
                    @click="addCheckpoint">
                    <Icon icon="lucide:plus" style="width:12px;height:12px" />
                    เพิ่ม Checkpoint
                </button>
            </div>
        </div>
    </div>
</template>