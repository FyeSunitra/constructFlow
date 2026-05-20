<script lang="ts">
export default { name: "ProjectPhaseEditor" };
</script>

<script setup lang="ts">
import { computed } from "vue";
import {
    NInput,
    NInputNumber,
    NDatePicker,
    NButton,
    NPopconfirm,
} from "naive-ui";
import { Icon } from "@iconify/vue";
import type { PhaseDraft } from "@/types/project";

const props = defineProps<{
    phase: PhaseDraft;
    index: number;
    canDelete: boolean;
    projectBudget?: number;
}>();

const emit = defineEmits<{
    "update:phase": [phase: PhaseDraft];
    delete: [];
}>();

function update(patch: Partial<PhaseDraft>) {
    emit("update:phase", { ...props.phase, ...patch });
}

function updateCheckpoint(i: number, name: string) {
    const checkpoints = props.phase.checkpoints.map((c, idx) =>
        idx === i ? { name } : c,
    );
    update({ checkpoints });
}

function addCheckpoint() {
    update({ checkpoints: [...props.phase.checkpoints, { name: "" }] });
}

function removeCheckpoint(i: number) {
    update({
        checkpoints: props.phase.checkpoints.filter((_, idx) => idx !== i),
    });
}

// % of total budget
const budgetPct = computed(() => {
    if (!props.projectBudget || !props.phase.budget_estimate) return "0%";
    return `${Math.round((Number(props.phase.budget_estimate) / props.projectBudget) * 100)}%`;
});

// NDatePicker uses timestamp (ms) internally
const startTs = computed({
    get: () =>
        props.phase.start_date
            ? new Date(props.phase.start_date).getTime()
            : null,
    set: (v) =>
        update({
            start_date: v ? new Date(v).toISOString().split("T")[0] : "",
        }),
});
const endTs = computed({
    get: () =>
        props.phase.end_date ? new Date(props.phase.end_date).getTime() : null,
    set: (v) =>
        update({ end_date: v ? new Date(v).toISOString().split("T")[0] : "" }),
});
</script>

<template>
    <div class="rounded-xl overflow-hidden" style="border: 0.5px solid #e3e1d8">
        <!-- Phase header -->
        <div
            class="flex items-center gap-2 px-3 py-2.5"
            style="background: #f7f6f2; border-bottom: 0.5px solid #e3e1d8"
        >
            <span
                class="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded"
                style="background: #e1f5ee; color: #0f6e56"
            >
                Phase {{ index + 1 }}
            </span>
            <NInput
                :value="phase.name"
                size="small"
                placeholder="ชื่อ Phase"
                class="flex-1"
                @update:value="update({ name: $event })"
            />
            <NPopconfirm
                v-if="canDelete"
                positive-text="ลบ"
                negative-text="ยกเลิก"
                :positive-button-props="{ type: 'error', size: 'small' }"
                @positive-click="emit('delete')"
            >
                <template #trigger>
                    <NButton quaternary circle size="tiny" type="error">
                        <template #icon>
                            <Icon
                                icon="lucide:trash-2"
                                style="width: 13px; height: 13px"
                            />
                        </template>
                    </NButton>
                </template>
                ลบ Phase นี้?
            </NPopconfirm>
        </div>

        <!-- Phase body -->
        <div class="p-3 flex flex-col gap-3">
            <!-- Budget + % -->
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <div class="text-xs text-gray-400 mb-1">
                        งบประมาณ Phase (บาท)
                    </div>
                    <NInputNumber
                        :value="phase.budget_estimate"
                        size="small"
                        :min="0"
                        :show-button="false"
                        placeholder="0"
                        style="width: 100%"
                        @update:value="update({ budget_estimate: $event ?? 0 })"
                    />
                </div>
                <div>
                    <div class="text-xs text-gray-400 mb-1">% จากงบรวม</div>
                    <div
                        class="h-8 flex items-center px-3 rounded-lg text-sm text-gray-500"
                        style="background: #f7f6f2; border: 0.5px solid #e3e1d8"
                    >
                        {{ budgetPct }}
                    </div>
                </div>
            </div>

            <!-- Phase dates -->
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <div class="text-xs text-gray-400 mb-1">
                        วันเริ่ม Phase
                    </div>
                    <NDatePicker
                        v-model:value="startTs"
                        type="date"
                        size="small"
                        placeholder="เลือกวันที่"
                        style="width: 100%"
                        clearable
                    />
                </div>
                <div>
                    <div class="text-xs text-gray-400 mb-1">
                        วันสิ้นสุด Phase
                    </div>
                    <NDatePicker
                        v-model:value="endTs"
                        type="date"
                        size="small"
                        placeholder="เลือกวันที่"
                        style="width: 100%"
                        clearable
                    />
                </div>
            </div>

            <!-- Checkpoints -->
            <div>
                <div
                    class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2"
                >
                    Checkpoints
                </div>
                <div class="flex flex-col gap-1.5">
                    <div
                        v-for="(cp, ci) in phase.checkpoints"
                        :key="ci"
                        class="flex items-center gap-2"
                    >
                        <span
                            class="text-xs text-gray-300 w-4 text-right flex-shrink-0"
                            >{{ ci + 1 }}</span
                        >
                        <NInput
                            :value="cp.name"
                            size="small"
                            placeholder="ชื่อ Checkpoint"
                            class="flex-1"
                            @update:value="updateCheckpoint(ci, $event)"
                        />
                        <NButton
                            quaternary
                            circle
                            size="tiny"
                            :disabled="phase.checkpoints.length === 1"
                            @click="removeCheckpoint(ci)"
                        >
                            <template #icon>
                                <Icon
                                    icon="lucide:x"
                                    style="width: 12px; height: 12px"
                                />
                            </template>
                        </NButton>
                    </div>
                </div>
                <button
                    class="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium hover:text-emerald-800 transition-colors"
                    @click="addCheckpoint"
                >
                    <Icon
                        icon="lucide:plus"
                        style="width: 12px; height: 12px"
                    />
                    เพิ่ม Checkpoint
                </button>
            </div>
        </div>
    </div>
</template>
