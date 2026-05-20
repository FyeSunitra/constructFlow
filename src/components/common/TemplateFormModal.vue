<script lang="ts">
export default { name: "TemplateFormModal" };
</script>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import {
    NModal,
    NForm,
    NFormItem,
    NInput,
    NButton,
    type FormInst,
    type FormRules,
} from "naive-ui";
import { Icon } from "@iconify/vue";
import {
    type Template,
    type TemplateForm,
    type PhaseDraft,
} from "@/types/template";
import TemplatePhaseEditor from "@/components/common/TemplatePhaseEditor.vue";
import { useBreakpoint } from "@/composables/useBreakpoint";
import {
    buildPayload,
    emptyForm,
    emptyPhaseDraft,
    templateToForm,
} from "@/lib/template";

const props = defineProps<{
    show: boolean;
    editing: Template | null;
    saving?: boolean;
}>();

const emit = defineEmits<{
    "update:show": [v: boolean];
    saved: [payload: ReturnType<typeof buildPayload>, id: string | null];
}>();

const { isMobile } = useBreakpoint();
const formRef = ref<FormInst | null>(null);

const form = reactive<TemplateForm>(emptyForm());

watch(
    () => props.editing,
    (t) => {
        const src = t ? templateToForm(t) : emptyForm();
        Object.assign(form, src);
        formRef.value?.restoreValidation();
    },
    { immediate: true },
);

watch(
    () => props.show,
    (visible) => {
        if (!visible) return;
        const src = props.editing ? templateToForm(props.editing) : emptyForm();
        Object.assign(form, src);
        formRef.value?.restoreValidation();
    },
);

const isEdit = computed(() => props.editing !== null);
const modalTitle = computed(() =>
    isEdit.value ? "แก้ไข Template" : "สร้าง Template ใหม่",
);

const modalStyle = computed(() =>
    isMobile()
        ? "width:100%;max-width:100%;height:100dvh;margin:0;border-radius:0;display:flex;flex-direction:column"
        : "width:580px;max-height:85dvh;border-radius:16px;display:flex;flex-direction:column",
);

const rules: FormRules = {
    name: [
        {
            required: true,
            trigger: ["blur", "input"],
            message: "กรุณากรอกชื่อ Template",
        },
    ],
};

function addPhase() {
    form.phases.push(emptyPhaseDraft());
}

function removePhase(i: number) {
    form.phases.splice(i, 1);
}

function updatePhase(i: number, phase: PhaseDraft) {
    form.phases[i] = phase;
}

async function handleSubmit() {
    try {
        await formRef.value?.validate();
    } catch {
        return;
    }
    emit("saved", buildPayload(form), props.editing?.id ?? null);
    emit("update:show", false);
}

function close() {
    emit("update:show", false);
}
</script>

<template>
    <NModal
        :show="show"
        preset="card"
        :title="modalTitle"
        :style="modalStyle"
        :mask-closable="false"
        :segmented="{ content: true, footer: true }"
        :content-style="{ overflowY: 'auto', flex: '1', minHeight: '0' }"
        @update:show="emit('update:show', $event)"
    >
        <NForm
            ref="formRef"
            :model="form"
            :rules="rules"
            label-placement="top"
            require-mark-placement="right-hanging"
            size="medium"
        >
            <NFormItem label="ชื่อ Template" path="name">
                <NInput
                    v-model:value="form.name"
                    placeholder="ระบุชื่อ Template"
                />
            </NFormItem>

            <NFormItem
                label="คำอธิบาย"
                path="description"
                style="margin-bottom: 8px"
            >
                <NInput
                    v-model:value="form.description"
                    type="textarea"
                    :rows="2"
                    placeholder="ระบุคำอธิบาย (ถ้ามี)"
                />
            </NFormItem>

            <div
                class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pb-2"
                style="border-bottom: 0.5px solid #f1efe8"
            >
                กำหนด Phase และ Checkpoint
            </div>

            <div class="flex flex-col gap-3">
                <TemplatePhaseEditor
                    v-for="(phase, i) in form.phases"
                    :key="i"
                    :phase="phase"
                    :index="i"
                    :can-delete="form.phases.length > 1"
                    @update:phase="updatePhase(i, $event)"
                    @delete="removePhase(i)"
                />
            </div>

            <button
                type="button"
                class="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-emerald-600 border border-dashed transition-all duration-150 hover:bg-emerald-50"
                style="border-color: #9fe1cb"
                @click="addPhase"
            >
                <Icon icon="lucide:plus" style="width: 14px; height: 14px" />
                เพิ่ม Phase
            </button>
        </NForm>

        <template #footer>
            <div
                class="flex gap-2"
                :class="isMobile() ? 'flex-col' : 'justify-end'"
            >
                <NButton :block="isMobile()" @click="close">ยกเลิก</NButton>
                <NButton
                    type="primary"
                    :block="isMobile()"
                    :loading="saving"
                    :disabled="saving"
                    style="background: #0f6e56; border: none"
                    @click="handleSubmit"
                >
                    <template #icon>
                        <Icon
                            icon="lucide:check"
                            style="width: 14px; height: 14px"
                        />
                    </template>
                    {{ isEdit ? "บันทึก" : "สร้าง Template" }}
                </NButton>
            </div>
        </template>
    </NModal>
</template>
