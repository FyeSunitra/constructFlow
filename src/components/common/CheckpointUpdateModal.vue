<script setup lang="ts">
import { ref, reactive, watch, computed } from "vue";
import {
    NModal,
    NForm,
    NFormItem,
    NInput,
    NButton,
    NUpload,
    NImage,
    NImageGroup,
    type UploadFileInfo,
} from "naive-ui";
import { Icon } from "@iconify/vue";
import { useBreakpoint } from "@/composables/useBreakpoint";
import {
    CHECKPOINT_STATUS_META,
    type CheckpointStatus,
} from "@/types/checkpoint";
import { checkpointService } from "@/services/checkpoint.service";
import type { ProjectCheckpoint } from "@/types/project";

const props = defineProps<{
    show: boolean;
    checkpoint: ProjectCheckpoint | null;
    projectId: string;
    phaseId: string;
}>();

const emit = defineEmits<{
    "update:show": [v: boolean];
    saved: [
        id: string,
        payload: { status: CheckpointStatus; note_text: string },
        files: File[],
    ];
}>();

const { isMobile } = useBreakpoint();

interface CheckpointLog {
    id: string;
    old_status: string | null;
    new_status: string | null;
    note_text: string | null;
    created_at: string;
    creator: { first_name: string; last_name: string } | null;
    images: { id: string; url: string }[];
}

const form = reactive({
    status: "PENDING" as CheckpointStatus,
    note_text: "",
});
const stagedFiles = ref<UploadFileInfo[]>([]);
const saving = ref(false);
const logs = ref<CheckpointLog[]>([]);
const logsLoading = ref(false);
const showLogs = ref(false);

watch(
    () => props.show,
    async (v) => {
        if (!v || !props.checkpoint) return;
        form.status = props.checkpoint.status as CheckpointStatus;
        form.note_text = ""; // clear note ทุกครั้ง
        stagedFiles.value = [];
        showLogs.value = false;
        logs.value = [];

        // โหลด logs
        logsLoading.value = true;
        try {
            const res = await checkpointService.getLogs(
                props.projectId,
                props.phaseId,
                props.checkpoint.id,
            );
            logs.value = (res as any)?.data ?? res;
        } catch {
            logs.value = [];
        } finally {
            logsLoading.value = false;
        }
    },
);

const modalStyle = computed(() =>
    isMobile()
        ? "width:100%;max-width:100%;margin:0;border-radius:0"
        : "width:500px;border-radius:16px",
);

function setStatus(s: CheckpointStatus) {
    form.status = s;
}
function handleFileChange(data: { fileList: UploadFileInfo[] }) {
    stagedFiles.value = data.fileList;
}

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

async function handleSubmit() {
    if (!props.checkpoint) return;
    saving.value = true;
    try {
        const files = stagedFiles.value
            .map((f) => f.file)
            .filter((f): f is File => !!f);
        emit(
            "saved",
            props.checkpoint.id,
            { status: form.status, note_text: form.note_text },
            files,
        );
        // clear form
        form.note_text = "";
        stagedFiles.value = [];
        emit("update:show", false);
    } finally {
        saving.value = false;
    }
}

function close() {
    emit("update:show", false);
}
</script>

<template>
    <NModal
        :show="show"
        preset="card"
        :style="modalStyle"
        :mask-closable="false"
        :segmented="{ content: true, footer: true }"
        :content-style="{ overflowY: 'auto', maxHeight: '75dvh' }"
        @update:show="emit('update:show', $event)"
    >
        <template #header>
            <div>
                <div class="text-sm font-semibold text-gray-900">
                    อัปเดต Checkpoint
                </div>
                <div class="text-sm text-gray-400 mt-0.5">
                    {{ checkpoint?.name }}
                </div>
            </div>
        </template>

        <div class="flex flex-col gap-5">
            <!-- Status -->
            <div>
                <div
                    class="text-sm font-semibold uppercase tracking-wider mb-3"
                >
                    สถานะ
                </div>
                <div class="grid grid-cols-3 gap-2">
                    <button
                        v-for="(meta, key) in CHECKPOINT_STATUS_META"
                        :key="key"
                        class="flex flex-col items-center gap-2 py-3 px-2 rounded-xl border transition-all duration-150"
                        :style="{
                            background: form.status === key ? meta.bg : '#fff',
                            borderColor:
                                form.status === key ? meta.border : '#E3E1D8',
                            borderWidth:
                                form.status === key ? '1.5px' : '0.5px',
                        }"
                        @click="setStatus(key as CheckpointStatus)"
                    >
                        <div
                            class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            :style="{ background: meta.bg }"
                        >
                            <template v-if="key === 'COMPLETED'">
                                <Icon
                                    icon="lucide:check"
                                    :style="{
                                        width: '14px',
                                        height: '14px',
                                        color: meta.color,
                                    }"
                                />
                            </template>
                            <template v-else-if="key === 'IN_PROGRESS'">
                                <Icon
                                    icon="lucide:clock"
                                    :style="{
                                        width: '14px',
                                        height: '14px',
                                        color: meta.color,
                                    }"
                                />
                            </template>
                            <template v-else>
                                <div
                                    class="w-2.5 h-2.5 rounded-full"
                                    :style="{
                                        background: meta.color,
                                        opacity: '0.5',
                                    }"
                                />
                            </template>
                        </div>
                        <div
                            class="text-xs font-medium leading-tight text-center"
                            :style="{ color: meta.color }"
                        >
                            {{ meta.label }}
                        </div>
                    </button>
                </div>
            </div>

            <!-- Note -->
            <div>
                <div
                    class="text-sm font-semibold uppercase tracking-wider mb-2"
                >
                    หมายเหตุ
                </div>
                <NInput
                    v-model:value="form.note_text"
                    type="textarea"
                    :rows="3"
                    placeholder="รายละเอียดเพิ่มเติม เช่น ความคืบหน้า ปัญหาที่พบ..."
                />
            </div>

            <!-- Upload -->
            <div>
                <div
                    class="text-sm font-semibold uppercase tracking-wider mb-2"
                >
                    แนบภาพหน้างาน
                </div>
                <NUpload
                    multiple
                    :file-list="stagedFiles"
                    :default-upload="false"
                    accept=".jpg,.jpeg,.png,.webp"
                    class="upload-full"
                    @change="handleFileChange"
                >
                    <div
                        class="flex flex-col items-center justify-center gap-2 py-5 rounded-xl border border-dashed cursor-pointer transition-all hover:border-emerald-400 hover:bg-emerald-50"
                        style="border-color: #d3d1c7; text-align: center"
                    >
                        <div class="text-xs text-gray-600">
                            คลิกหรือลากภาพมาวางที่นี่
                        </div>
                        <div class="text-xs text-gray-500">
                            JPG, PNG สูงสุด 10MB
                        </div>
                    </div>
                </NUpload>
            </div>

            <!-- Logs toggle -->
            <div>
                <button
                    class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors"
                    @click="showLogs = !showLogs"
                >
                    <Icon
                        icon="lucide:history"
                        style="width: 13px; height: 13px"
                    />
                    ประวัติการอัพเดท
                    <Icon
                        :icon="
                            showLogs
                                ? 'lucide:chevron-up'
                                : 'lucide:chevron-down'
                        "
                        style="width: 12px; height: 12px"
                    />
                </button>

                <div v-if="showLogs" class="mt-2 flex flex-col gap-2">
                    <div v-if="logsLoading" class="flex flex-col gap-2">
                        <div
                            v-for="i in 2"
                            :key="i"
                            class="h-12 rounded-xl animate-pulse"
                            style="background: #f1efe8"
                        />
                    </div>
                    <div
                        v-else-if="!logs.length"
                        class="text-xs text-gray-300 italic py-2"
                    >
                        ยังไม่มีประวัติ
                    </div>
                    <div
                        v-else
                        v-for="log in logs"
                        :key="log.id"
                        class="rounded-xl p-3 flex flex-col gap-2"
                        style="background: #f7f6f2"
                    >
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-1.5">
                                <span
                                    v-if="log.old_status"
                                    class="text-xs px-2 py-0.5 rounded-full font-medium"
                                    :style="{
                                        background:
                                            CHECKPOINT_STATUS_META[
                                                log.old_status as keyof typeof CHECKPOINT_STATUS_META
                                            ]?.bg,
                                        color: CHECKPOINT_STATUS_META[
                                            log.old_status as keyof typeof CHECKPOINT_STATUS_META
                                        ]?.color,
                                    }"
                                >
                                    {{
                                        CHECKPOINT_STATUS_META[
                                            log.old_status as keyof typeof CHECKPOINT_STATUS_META
                                        ]?.label
                                    }}
                                </span>
                                <Icon
                                    v-if="log.old_status && log.new_status"
                                    icon="lucide:arrow-right"
                                    style="
                                        width: 11px;
                                        height: 11px;
                                        color: #ccc;
                                    "
                                />
                                <span
                                    v-if="log.new_status"
                                    class="text-xs px-2 py-0.5 rounded-full font-medium"
                                    :style="{
                                        background:
                                            CHECKPOINT_STATUS_META[
                                                log.new_status as keyof typeof CHECKPOINT_STATUS_META
                                            ]?.bg,
                                        color: CHECKPOINT_STATUS_META[
                                            log.new_status as keyof typeof CHECKPOINT_STATUS_META
                                        ]?.color,
                                    }"
                                >
                                    {{
                                        CHECKPOINT_STATUS_META[
                                            log.new_status as keyof typeof CHECKPOINT_STATUS_META
                                        ]?.label
                                    }}
                                </span>
                            </div>
                            <div class="text-right">
                                <div class="text-xs text-gray-500">
                                    {{ formatDateTime(log.created_at) }}
                                </div>
                                <div
                                    v-if="log.creator"
                                    class="text-xs text-gray-500"
                                >
                                    {{ log.creator.first_name }}
                                    {{ log.creator.last_name }}
                                </div>
                            </div>
                        </div>
                        <div
                            v-if="
                                log.note_text &&
                                log.note_text !== 'Status changed'
                            "
                            class="text-xs text-gray-500"
                        >
                            {{ log.note_text }}
                        </div>
                        <!-- รูปภาพใน log -->
                        <NImageGroup v-if="log.images?.length">
                            <div class="flex gap-1.5 flex-wrap">
                                <NImage
                                    v-for="img in log.images"
                                    :key="img.id"
                                    :src="img.url"
                                    width="60"
                                    height="48"
                                    object-fit="cover"
                                    class="rounded-lg overflow-hidden cursor-pointer"
                                />
                            </div>
                        </NImageGroup>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex gap-2 justify-end">
                <NButton @click="close">ยกเลิก</NButton>
                <NButton
                    type="primary"
                    :loading="saving"
                    style="background: #0f6e56; border: none"
                    @click="handleSubmit"
                >
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
