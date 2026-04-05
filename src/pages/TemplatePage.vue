<script lang="ts">
export default { name: 'TemplatePage' }
</script>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { NButton, NInput, NEmpty, useMessage } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import type { Template } from '@/types/template'
import { buildPayload } from '@/lib/template'
import { templateService } from '@/services/template.service'

const message = useMessage()
const { isMobile } = useBreakpoint()

const showModal = ref(false)
const templates = ref<Template[]>([])
const editingTpl = ref<Template | null>(null)
const search = ref('')
const saving = ref(false)

const perPage = 9
const currentPage = ref(1)

const fetchTemplates = async () => {
    try {
        const res = await templateService.getTemplate()
        templates.value = res.data
    } catch (err: any) {
        message.error(err?.message || 'เกิดข้อผิดพลาด')
    }
}

const filtered = computed(() => {
    const q = search.value.toLowerCase()
    return q
        ? templates.value.filter(t =>
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q),
        )
        : templates.value
})

function openCreate() {
    editingTpl.value = null
    showModal.value = true
}

function openEdit(tpl: Template) {
    editingTpl.value = tpl
    showModal.value = true
}

function deleteTpl(tpl: Template) {
    templates.value = templates.value.filter(t => t.id !== tpl.id)
    message.success('ลบ Template เรียบร้อย')
}

async function onSaved(
    payload: ReturnType<typeof buildPayload>,
    id: string | null,
) {
    saving.value = true

    try {
        if (id) {
            message.success('บันทึก Template เรียบร้อย')

        } else {
            await templateService.createTemplate(payload)
            message.success('สร้าง Template สำเร็จ')
            fetchTemplates()
        }
    } catch (err) {
        message.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
        console.error('[TemplatePage] onSaved error', err)
    } finally {
        saving.value = false
    }
}

onMounted(fetchTemplates)

watch(currentPage, () => {
    fetchTemplates()
})

watch([search], () => {
    currentPage.value = 1
    fetchTemplates()
})
</script>

<template>
    <div class="flex h-screen overflow-hidden">
        <AppSidebar />

        <div class="flex-1 flex flex-col overflow-hidden bg-[--body]">
            <header class="shrink-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3">
                <AppBreadcrumb />
            </header>

            <main class="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">

                <!-- Page header -->
                <div class="flex items-center justify-between gap-3">
                    <div>
                        <h1 class="text-base md:text-lg font-medium text-gray-900 mb-0.5">จัดการแม่แบบโครงการ</h1>
                        <p class="text-xs md:text-sm text-gray-400 hidden sm:block">เพิ่ม แก้ไข
                            และจัดการแม่แบบสำหรับสร้างโปรเจ็ค</p>
                    </div>
                    <NButton type="primary" :size="isMobile() ? 'small' : 'medium'"
                        style="background:#0F6E56;border:none;flex-shrink:0" :loading="saving" @click="openCreate">
                        <template #icon>
                            <Icon icon="lucide:plus" style="width:14px;height:14px" />
                        </template>
                        <span class="hidden sm:inline">เพิ่มแม่แบบ</span>
                        <span class="sm:hidden">เพิ่ม</span>
                    </NButton>
                </div>

                <template v-if="filtered.length > 0">
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <TemplateCard v-for="tpl in filtered" :key="tpl.id" :template="tpl" @edit="openEdit"
                            @delete="deleteTpl" />
                    </div>
                </template>

                <NEmpty v-else
                    :description="search ? 'ไม่พบแม่แบบที่ตรงกับการค้นหา' : 'ยังไม่มีแม่แบบ กด เพิ่มแม่แบบ เพื่อเริ่มต้น'"
                    style="padding:48px 0" />

                <AppPagination v-model:page="currentPage" :total="filtered.length" :page-size="perPage" />
            </main>
        </div>
    </div>

    <TemplateFormModal v-model:show="showModal" :editing="editingTpl" :saving="saving" @saved="onSaved" />
</template>