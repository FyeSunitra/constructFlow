<script lang="ts">
export default { name: 'TemplateCard' }
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { NPopconfirm } from 'naive-ui'
import { Icon } from '@iconify/vue'
import type { Template } from '@/types/template';
import { totalBudget, totalCheckpoints } from '@/lib/template';

const props = defineProps<{ template: Template }>()

const emit = defineEmits<{
    edit: [template: Template]
    delete: [template: Template]
    view: [template: Template]
}>()

const cpCount = computed(() => totalCheckpoints(props.template))
const budgetTotal = computed(() =>
    totalBudget(props.template).toLocaleString('th-TH'),
)
</script>

<template>
    <div class="bg-white rounded-xl flex flex-col gap-3 p-4 transition-all duration-150 hover:border-emerald-500 hover:shadow-sm cursor-pointer"
        style="border:0.5px solid #E3E1D8" @click="emit('view', template)">
        <!-- Name -->
        <div>
            <div class="text-sm font-medium text-gray-800 leading-snug">{{ template.name }}</div>
            <div v-if="template.description" class="text-xs text-gray-400 mt-1 line-clamp-2">
                {{ template.description }}
            </div>
        </div>

        <!-- Meta chips -->
        <div class="flex flex-wrap gap-1.5">
            <!-- Phases -->
            <span class="inline-flex items-center gap-1 h-5 px-2 rounded-full text-xs font-medium"
                style="background:#E1F5EE;color:#0F6E56">
                <Icon icon="lucide:layers" style="width:9px;height:9px" />
                {{ template.phases.length }} Phase
            </span>
            <!-- Checkpoints -->
            <span class="inline-flex items-center gap-1 h-5 px-2 rounded-full text-xs font-medium"
                style="background:#E6F1FB;color:#185FA5">
                <Icon icon="lucide:check-square" style="width:9px;height:9px" />
                {{ cpCount }} Checkpoint
            </span>
            <!-- Budget -->
            <span class="inline-flex items-center gap-1 h-5 px-2 rounded-full text-xs font-medium"
                style="background:#FAEEDA;color:#854F0B">
                <Icon icon="lucide:banknote" style="width:9px;height:9px" />
                ฿{{ budgetTotal }}
            </span>
        </div>

        <!-- Phase preview (collapsed list) -->
        <div class="flex flex-col gap-1">
            <div v-for="(phase, i) in template.phases.slice(0, 3)" :key="i"
                class="flex items-center gap-2 text-xs text-gray-500">
                <span class="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center text-[9px] font-semibold"
                    style="background:#E1F5EE;color:#0F6E56">{{ i + 1 }}</span>
                <span class="truncate">{{ phase.name }}</span>
                <span class="flex-shrink-0 text-gray-300 text-xs">{{ phase.checkpoints.length }} cp</span>
            </div>
            <div v-if="template.phases.length > 3" class="text-xs text-gray-400 pl-6">
                +{{ template.phases.length - 3 }} phase เพิ่มเติม
            </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 pt-2" style="border-top:0.5px solid #F1EFE8;margin-top:auto" @click.stop>
            <button
                class="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium text-gray-500 bg-white border transition-all duration-150 hover:border-emerald-500 hover:text-emerald-700"
                style="border:0.5px solid #E3E1D8" @click="emit('edit', template)">
                <Icon icon="lucide:pencil" style="width:12px;height:12px" />
                แก้ไข
            </button>

            <NPopconfirm positive-text="ลบ" negative-text="ยกเลิก" :positive-button-props="{ type: 'error' }"
                @positive-click="emit('delete', template)">
                <template #trigger>
                    <button
                        class="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium text-gray-400 bg-white border transition-all duration-150 hover:border-red-400 hover:text-red-600"
                        style="border:0.5px solid #E3E1D8">
                        <Icon icon="lucide:trash-2" style="width:12px;height:12px" />
                        ลบ
                    </button>
                </template>
                ลบ Template "{{ template.name }}"?
            </NPopconfirm>
        </div>
    </div>
</template>