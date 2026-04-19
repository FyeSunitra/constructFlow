<script lang="ts">
export default { name: 'ProjectDocumentsTab' }
</script>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

const mockDocs = [
    { name: 'แบบแปลนอาคาร_ชั้น1-5.pdf', uploaded: '15 ม.ค. 68', type: 'PDF', size: '12.4 MB' },
    { name: 'TOR_โครงการอาคารสำนักงาน.docx', uploaded: '10 ม.ค. 68', type: 'DOCX', size: '2.1 MB' },
    { name: 'BOQ_รายการวัสดุและราคา.xlsx', uploaded: '8 ม.ค. 68', type: 'XLSX', size: '890 KB' },
    { name: 'สัญญาจ้างก่อสร้าง.pdf', uploaded: '1 ม.ค. 68', type: 'PDF', size: '3.7 MB' },
]

const TYPE_ICON: Record<string, string> = {
    PDF: 'lucide:file-text',
    DOCX: 'lucide:file',
    XLSX: 'lucide:table',
    PNG: 'lucide:image',
    JPG: 'lucide:image',
}

const TYPE_COLOR: Record<string, string> = {
    PDF: '#A32D2D',
    DOCX: '#185FA5',
    XLSX: '#3B6D11',
    PNG: '#854F0B',
    JPG: '#854F0B',
}
</script>

<template>
    <div>
        <!-- File list -->
        <div v-if="mockDocs.length" class="bg-white rounded-xl overflow-hidden" style="border:0.5px solid #E3E1D8">
            <div v-for="(doc, i) in mockDocs" :key="i"
                class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                :style="i < mockDocs.length - 1 ? 'border-bottom:0.5px solid #F7F6F2' : ''">
                <!-- Type icon -->
                <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    :style="{ background: (TYPE_COLOR[doc.type] ?? '#888780') + '18' }">
                    <Icon :icon="TYPE_ICON[doc.type] ?? 'lucide:file'"
                        :style="{ width: '15px', height: '15px', color: TYPE_COLOR[doc.type] ?? '#888780' }" />
                </div>

                <!-- Name + meta -->
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-800 truncate">{{ doc.name }}</div>
                    <div class="text-xs text-gray-400 mt-0.5">
                        อัปโหลด {{ doc.uploaded }} · {{ doc.type }} {{ doc.size }}
                    </div>
                </div>

                <!-- Download button -->
                <button
                    class="flex-shrink-0 inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium text-gray-500 transition-all duration-150 hover:text-emerald-700"
                    style="border:0.5px solid #E3E1D8;background:#fff">
                    <Icon icon="lucide:download" style="width:12px;height:12px" />
                    ดาวน์โหลด
                </button>
            </div>
        </div>

        <!-- Empty -->
        <div v-else class="py-12 text-center text-gray-300 text-sm flex flex-col items-center gap-2">
            <Icon icon="lucide:file-x" style="width:32px;height:32px;opacity:0.4" />
            ยังไม่มีเอกสาร
        </div>
    </div>
</template>