<script lang="ts">
export default { name: 'ProjectPhotoLightbox' }
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { NModal } from 'naive-ui'
import { Icon } from '@iconify/vue'

export interface SitePhoto {
    id: string
    url: string
    uploaded_at: string
    note?: string
}

const props = defineProps<{
    show: boolean
    photos: SitePhoto[]
    index: number
}>()

const emit = defineEmits<{
    'update:show': [v: boolean]
    'update:index': [i: number]
}>()

const current = computed(() => props.photos[props.index])
const hasPrev = computed(() => props.index > 0)
const hasNext = computed(() => props.index < props.photos.length - 1)
const counterTxt = computed(() => `${props.index + 1} / ${props.photos.length}`)

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric',
    })
}

function prev() { if (hasPrev.value) emit('update:index', props.index - 1) }
function next() { if (hasNext.value) emit('update:index', props.index + 1) }
function close() { emit('update:show', false) }

function onKeydown(e: KeyboardEvent) {
    if (!props.show) return
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
    if (e.key === 'Escape') close()
}
</script>

<template>
    <NModal :show="show" :mask-closable="true" style="background:transparent;box-shadow:none;max-width:800px;width:90vw"
        @update:show="emit('update:show', $event)" @keydown="onKeydown">
        <div class="relative flex flex-col items-center gap-4 rounded-2xl p-5" style="background:rgba(44,44,42,0.96)"
            tabindex="0" @keydown="onKeydown">
            <!-- Close -->
            <button class="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style="border:0.5px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.08);color:#D3D1C7"
                @click="close">
                <Icon icon="lucide:x" style="width:14px;height:14px" />
            </button>

            <!-- Image -->
            <div class="w-full flex items-center justify-center rounded-xl overflow-hidden"
                style="min-height:320px;background:#2C2C2A">
                <img v-if="current?.url" :src="current.url" :alt="`ภาพหน้างาน ${formatDate(current.uploaded_at)}`"
                    class="max-w-full max-h-[60vh] object-contain rounded-xl" />
                <!-- placeholder when no url -->
                <div v-else class="flex flex-col items-center gap-2">
                    <Icon icon="lucide:image" style="width:48px;height:48px;color:#444441" />
                    <span style="font-size:12px;color:#888780">ไม่มีรูปภาพ</span>
                </div>
            </div>

            <!-- Nav + info -->
            <div class="flex items-center gap-3 w-full">
                <button class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                    style="border:0.5px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.08);color:#D3D1C7"
                    :disabled="!hasPrev" :style="!hasPrev ? 'opacity:0.3;cursor:not-allowed' : ''" @click="prev">
                    <Icon icon="lucide:chevron-left" style="width:15px;height:15px" />
                </button>

                <div class="flex-1 text-center">
                    <div style="font-size:13px;color:#fff;margin-bottom:3px">
                        {{ current?.note ?? 'ภาพหน้างาน' }}
                    </div>
                    <div style="font-size:11px;color:#888780">
                        อัปโหลด {{ current ? formatDate(current.uploaded_at) : '—' }}
                    </div>
                </div>

                <button class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                    style="border:0.5px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.08);color:#D3D1C7"
                    :disabled="!hasNext" :style="!hasNext ? 'opacity:0.3;cursor:not-allowed' : ''" @click="next">
                    <Icon icon="lucide:chevron-right" style="width:15px;height:15px" />
                </button>
            </div>

            <!-- Counter -->
            <div style="font-size:11px;color:#5F5E5A">{{ counterTxt }}</div>
        </div>
    </NModal>
</template>