<script lang="ts">
export default { name: "ProjectDocumentsTab" };
</script>

<script setup lang="ts">
import type { ProjectDocument } from "@/types/project";
import { Icon } from "@iconify/vue";

const props = defineProps<{
    documents: ProjectDocument[];
}>();

function fileType(name: string): string {
    return name.split(".").pop()?.toUpperCase() ?? "FILE";
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

const TYPE_ICON: Record<string, string> = {
    PDF: "lucide:file-text",
    DOCX: "lucide:file",
    DOC: "lucide:file",
    XLSX: "lucide:table",
    XLS: "lucide:table",
    PNG: "lucide:image",
    JPG: "lucide:image",
    JPEG: "lucide:image",
};

const TYPE_COLOR: Record<string, string> = {
    PDF: "#A32D2D",
    DOCX: "#185FA5",
    DOC: "#185FA5",
    XLSX: "#3B6D11",
    XLS: "#3B6D11",
    PNG: "#854F0B",
    JPG: "#854F0B",
    JPEG: "#854F0B",
};
</script>

<template>
    <div>
        <div
            v-if="documents.length"
            class="bg-white rounded-xl overflow-hidden"
            style="border: 0.5px solid #e3e1d8"
        >
            <div
                v-for="(doc, i) in documents"
                :key="doc.id"
                class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                :style="
                    i < documents.length - 1
                        ? 'border-bottom:0.5px solid #F7F6F2'
                        : ''
                "
            >
                <div
                    class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    :style="{
                        background:
                            (TYPE_COLOR[fileType(doc.name)] ?? '#888780') +
                            '18',
                    }"
                >
                    <Icon
                        :icon="TYPE_ICON[fileType(doc.name)] ?? 'lucide:file'"
                        :style="{
                            width: '15px',
                            height: '15px',
                            color: TYPE_COLOR[fileType(doc.name)] ?? '#888780',
                        }"
                    />
                </div>

                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-800 truncate">
                        {{ doc.name }}
                    </div>
                    <div class="text-xs text-gray-400 mt-0.5">
                        อัปโหลด {{ formatDate(doc.created_at) }} ·
                        {{ fileType(doc.name) }}
                    </div>
                </div>

                <a
                    :href="doc.url"
                    target="_blank"
                    download
                    class="flex-shrink-0 inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium text-gray-500 transition-all duration-150 hover:text-emerald-700"
                    style="border: 0.5px solid #e3e1d8; background: #fff"
                >
                    <Icon
                        icon="lucide:download"
                        style="width: 12px; height: 12px"
                    />
                    ดาวน์โหลด
                </a>
            </div>
        </div>

        <div
            v-else
            class="py-12 text-center text-gray-400 text-sm flex flex-col items-center gap-2"
        >
            <Icon
                icon="lucide:file-x"
                style="width: 32px; height: 32px; opacity: 0.4"
            />
            ยังไม่มีเอกสาร
        </div>
    </div>
</template>
