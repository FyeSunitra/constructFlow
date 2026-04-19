<script lang="ts">
export default { name: 'ProjectOverviewTab' }
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NButton } from 'naive-ui'
import { Icon } from '@iconify/vue'
import ProjectPhotoLightbox, { type SitePhoto } from '@/components/common/ProjectPhotoLightbox.vue'
import type { ProjectPhase } from '@/types/project';

const props = defineProps<{ phases: ProjectPhase[] }>()

// ─── Stat helpers ─────────────────────────────────────────────────────────────

const allCheckpoints = computed(() => props.phases.flatMap(p => p.checkpoints))
const doneCount = computed(() => allCheckpoints.value.filter(c => c.status === 'COMPLETED').length)
const cpProgress = computed(() => allCheckpoints.value.length
    ? Math.round((doneCount.value / allCheckpoints.value.length) * 100)
    : 0)
const currentPhase = computed(() =>
    props.phases.find(p => p.status === 'IN_PROGRESS') ?? props.phases[0] ?? null,
)
const currentPhaseIdx = computed(() =>
    currentPhase.value ? props.phases.indexOf(currentPhase.value) + 1 : 0,
)

// ─── Mock photos (replace with API data when ready) ───────────────────────────

const MOCK_PHOTOS: SitePhoto[] = Array.from({ length: 11 }, (_, i) => ({
    id: String(i + 1),
    url: '',                             // real url from API
    uploaded_at: new Date(Date.now() - i * 86400000).toISOString(),
    note: `ภาพหน้างาน ${i + 1}`,
}))

const photos = ref<SitePhoto[]>(MOCK_PHOTOS)   // swap with API response

// ─── Photo pagination ─────────────────────────────────────────────────────────

const PER_PAGE = 8
const photoPage = ref(1)
const totalPhotoPg = computed(() => Math.max(1, Math.ceil(photos.value.length / PER_PAGE)))
const pagedPhotos = computed(() => {
    const s = (photoPage.value - 1) * PER_PAGE
    return photos.value.slice(s, s + PER_PAGE)
})
const photoStart = computed(() => (photoPage.value - 1) * PER_PAGE)

// ─── Lightbox ─────────────────────────────────────────────────────────────────

const showLightbox = ref(false)
const lightboxIndex = ref(0)

function openPhoto(pagedIndex: number) {
    lightboxIndex.value = photoStart.value + pagedIndex
    showLightbox.value = true
}

function formatDateShort(iso: string) {
    return new Date(iso).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric',
    })
}
</script>

<template>
    <div class="flex flex-col gap-5">

        <!-- ── Stat tiles ── -->
        <div class="grid grid-cols-3 gap-3">

            <!-- Current phase -->
            <div class="bg-white rounded-xl p-4" style="border:0.5px solid #E3E1D8">
                <div class="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Phase ปัจจุบัน</div>
                <div class="text-sm font-semibold truncate" style="color:#0F6E56">
                    {{ currentPhase?.name ?? '—' }}
                </div>
                <div class="text-[10px] text-gray-400 mt-1">
                    Phase {{ currentPhaseIdx }} จาก {{ phases.length }}
                </div>
            </div>

            <!-- Checkpoint progress -->
            <div class="bg-white rounded-xl p-4" style="border:0.5px solid #E3E1D8">
                <div class="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Checkpoint สำเร็จ</div>
                <div class="text-sm font-semibold text-gray-800">
                    {{ doneCount }}
                    <span class="text-xs font-normal text-gray-400">/ {{ allCheckpoints.length }}</span>
                </div>
                <div class="mt-2 h-1.5 rounded-full overflow-hidden" style="background:#F1EFE8">
                    <div class="h-full rounded-full transition-all duration-500"
                        :style="{ width: `${cpProgress}%`, background: '#1D9E75' }" />
                </div>
            </div>

            <!-- Phase count -->
            <div class="bg-white rounded-xl p-4" style="border:0.5px solid #E3E1D8">
                <div class="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Phase ทั้งหมด</div>
                <div class="text-sm font-semibold text-gray-800">{{ phases.length }}</div>
                <div class="text-[10px] text-gray-400 mt-1">
                    {{phases.filter(p => p.status === 'IN_PROGRESS').length}} กำลังดำเนินการ
                </div>
            </div>
        </div>

        <!-- ── Photo section ── -->
        <div class="bg-white rounded-xl overflow-hidden" style="border:0.5px solid #E3E1D8">

            <!-- Section header -->
            <div class="flex items-center justify-between px-4 py-3" style="border-bottom:0.5px solid #F1EFE8">
                <div class="flex items-center gap-2">
                    <Icon icon="lucide:camera" style="width:14px;height:14px;color:#B4B2A9" />
                    <span class="text-xs font-medium text-gray-500 uppercase tracking-wider">ภาพหน้างานล่าสุด</span>
                </div>
                <span class="text-[10px] text-gray-300">{{ photos.length }} รูป</span>
            </div>

            <div class="p-4">

                <!-- Photo grid (4 per row) -->
                <div v-if="photos.length" class="grid gap-2 mb-4" style="grid-template-columns:repeat(4,minmax(0,1fr))">
                    <div v-for="(photo, i) in pagedPhotos" :key="photo.id"
                        class="relative cursor-pointer rounded-xl overflow-hidden group"
                        style="aspect-ratio:4/3;background:#F1EFE8;border:0.5px solid #E3E1D8" @click="openPhoto(i)">
                        <!-- Real image -->
                        <img v-if="photo.url" :src="photo.url" :alt="`ภาพหน้างาน ${formatDateShort(photo.uploaded_at)}`"
                            class="w-full h-full object-cover" />
                        <!-- Placeholder -->
                        <div v-else class="w-full h-full flex flex-col items-center justify-center gap-1">
                            <Icon icon="lucide:image" style="width:20px;height:20px;color:#D3D1C7" />
                            <span style="font-size:9px;color:#D3D1C7">{{ photo.note }}</span>
                        </div>

                        <!-- Hover overlay -->
                        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                            style="background:rgba(44,44,42,0.35)">
                            <Icon icon="lucide:zoom-in" style="width:20px;height:20px;color:#fff" />
                        </div>

                        <!-- Date badge -->
                        <div class="absolute bottom-1.5 left-1.5 right-1.5 text-center"
                            style="font-size:9px;color:#fff;background:rgba(44,44,42,0.55);padding:2px 5px;border-radius:4px">
                            {{ formatDateShort(photo.uploaded_at) }}
                        </div>
                    </div>
                </div>

                <!-- Empty photos -->
                <div v-else class="flex flex-col items-center justify-center py-10 gap-2">
                    <Icon icon="lucide:camera-off" style="width:28px;height:28px;color:#D3D1C7" />
                    <span class="text-xs text-gray-300">ยังไม่มีภาพหน้างาน</span>
                </div>

                <!-- Pagination -->
                <AppPagination v-if="totalPhotoPg > 1" :page="photoPage" :total="photos.length" :page-size="PER_PAGE"
                    @update:page="photoPage = $event" />
            </div>
        </div>

        <!-- Lightbox -->
        <ProjectPhotoLightbox v-model:show="showLightbox" v-model:index="lightboxIndex" :photos="photos" />
    </div>
</template>