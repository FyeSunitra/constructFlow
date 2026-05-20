<script lang="ts">
export default { name: "TemplateViewModal" };
</script>

<script setup lang="ts">
import { computed } from "vue";
import { NModal, NButton } from "naive-ui";
import { Icon } from "@iconify/vue";
import type { Template } from "@/types/template";
import { useBreakpoint } from "@/composables/useBreakpoint";
import { totalBudget, totalCheckpoints } from "@/lib/template";

const props = defineProps<{
    show: boolean;
    template: Template | null;
}>();

const emit = defineEmits<{
    "update:show": [v: boolean];
}>();

const { isMobile } = useBreakpoint();

const modalStyle = computed(() =>
    isMobile()
        ? "width:100%;max-width:100%;height:100dvh;margin:0;border-radius:0;display:flex;flex-direction:column"
        : "width:580px;max-height:85dvh;border-radius:16px;display:flex;flex-direction:column",
);

const cpCount = computed(() => props.template ? totalCheckpoints(props.template) : 0);
const budgetTotal = computed(() =>
    props.template ? totalBudget(props.template).toLocaleString('th-TH') : "0"
);

function close() {
    emit("update:show", false);
}
</script>

<template>
    <NModal
        :show="show"
        preset="card"
        title="รายละเอียดแม่แบบโครงการ"
        :style="modalStyle"
        :segmented="{ content: true, footer: true }"
        :content-style="{ overflowY: 'auto', flex: '1', minHeight: '0' }"
        @update:show="emit('update:show', $event)"
    >
        <div v-if="template" class="flex flex-col gap-4">
            <!-- Header Section: Title & Description -->
            <div class="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-1.5">
                <div class="text-base font-semibold text-gray-800 leading-snug">
                    {{ template.name }}
                </div>
                <div v-if="template.description" class="text-xs text-gray-500 whitespace-pre-wrap">
                    {{ template.description }}
                </div>
                <div v-else class="text-xs text-gray-400 italic">
                    ไม่มีคำอธิบายสำหรับแม่แบบนี้
                </div>
            </div>

            <!-- Stats Chips -->
            <div class="flex flex-wrap gap-2">
                <!-- Phases -->
                <span class="inline-flex items-center gap-1.5 h-6 px-3 rounded-full text-xs font-medium"
                    style="background:#E1F5EE;color:#0F6E56">
                    <Icon icon="lucide:layers" style="width:12px;height:12px" />
                    {{ template.phases.length }} Phase
                </span>
                <!-- Checkpoints -->
                <span class="inline-flex items-center gap-1.5 h-6 px-3 rounded-full text-xs font-medium"
                    style="background:#E6F1FB;color:#185FA5">
                    <Icon icon="lucide:check-square" style="width:12px;height:12px" />
                    {{ cpCount }} Checkpoint
                </span>
                <!-- Budget -->
                <span class="inline-flex items-center gap-1.5 h-6 px-3 rounded-full text-xs font-medium"
                    style="background:#FAEEDA;color:#854F0B">
                    <Icon icon="lucide:banknote" style="width:12px;height:12px" />
                    ฿{{ budgetTotal }}
                </span>
            </div>

            <div
                class="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2 pb-1"
                style="border-bottom: 0.5px solid #f1efe8"
            >
                ลำดับ Phase และ Checkpoint
            </div>

            <!-- Phases List -->
            <div class="flex flex-col gap-4">
                <div v-for="(phase, i) in template.phases" :key="i" 
                    class="rounded-xl overflow-hidden" 
                    style="border: 0.5px solid #e3e1d8"
                >
                    <!-- Phase Header -->
                    <div class="flex items-center justify-between gap-2 px-3 py-2.5" 
                        style="background: #f7f6f2; border-bottom: 0.5px solid #e3e1d8"
                    >
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-semibold px-2 py-0.5 rounded"
                                style="background: #e1f5ee; color: #0f6e56"
                            >
                                Phase {{ i + 1 }}
                            </span>
                            <span class="text-sm font-medium text-gray-700">{{ phase.name }}</span>
                        </div>
                        <div class="text-xs text-gray-500 font-medium">
                            ฿{{ (phase.budget_estimate ?? 0).toLocaleString('th-TH') }}
                        </div>
                    </div>

                    <!-- Checkpoints Body -->
                    <div class="p-3 bg-white">
                        <div class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                            Checkpoints
                        </div>
                        <div v-if="phase.checkpoints && phase.checkpoints.length > 0" class="flex flex-col gap-2">
                            <div v-for="(cp, ci) in phase.checkpoints" :key="ci" class="flex items-start gap-2.5">
                                <span class="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-semibold mt-0.5">
                                    {{ ci + 1 }}
                                </span>
                                <div class="text-xs text-gray-600 pt-0.5 break-words flex-1">
                                    {{ cp.name }}
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-xs text-gray-400 italic py-1">
                            ไม่มี Checkpoint ใน Phase นี้
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div
                class="flex gap-2"
                :class="isMobile() ? 'flex-col' : 'justify-end'"
            >
                <NButton 
                    type="primary" 
                    :block="isMobile()" 
                    style="background: #0f6e56; border: none"
                    @click="close"
                >
                    ปิด
                </NButton>
            </div>
        </template>
    </NModal>
</template>
