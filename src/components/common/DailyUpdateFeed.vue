<script lang="ts">
export default { name: 'DailyUpdateFeed' }
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NTimeline, NTimelineItem, NDatePicker, NButton } from 'naive-ui'
import { Icon } from '@iconify/vue'
import DailyUpdateCard, { type DailyUpdateItem } from './DailyUpdateCard.vue'

// ─── Props / emits ────────────────────────────────────────────────────────────

const props = defineProps<{
    updates: DailyUpdateItem[]
    loading?: boolean
    currentPhase: string
    todayStr: string
    alreadyPostedToday: boolean
}>()

const emit = defineEmits<{
    'add': []
}>()

// ─── Date filter ──────────────────────────────────────────────────────────────

const startTs = ref<number | null>(Date.now() - 6 * 86400000)
const endTs = ref<number | null>(Date.now())

// ─── Avatar colors ────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
    { bg: '#E1F5EE', fg: '#0F6E56' },
    { bg: '#E6F1FB', fg: '#185FA5' },
    { bg: '#FAEEDA', fg: '#854F0B' },
    { bg: '#EEEDFE', fg: '#3C3489' },
]
const engColorMap = new Map<string, number>()
let colorIdx = 0

function avatarColor(id: string) {
    if (!engColorMap.has(id)) { engColorMap.set(id, colorIdx++ % AVATAR_COLORS.length) }
    return AVATAR_COLORS[engColorMap.get(id)!]
}

// ─── Filter + Group ───────────────────────────────────────────────────────────

interface DayGroup { date: string; displayDate: string; items: DailyUpdateItem[] }

const filtered = computed(() => {
    const s = startTs.value ? new Date(startTs.value).toISOString().split('T')[0] : null
    const e = endTs.value ? new Date(endTs.value).toISOString().split('T')[0] : null
    return props.updates.filter(u => (!s || u.date >= s) && (!e || u.date <= e))
})

const grouped = computed((): DayGroup[] => {
    const map = new Map<string, DailyUpdateItem[]>()
    filtered.value.forEach(u => {
        const list = map.get(u.date) ?? []
        list.push(u)
        map.set(u.date, list)
    })
    return [...map.entries()]
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([date, items]) => ({ date, displayDate: formatGroupDate(date), items }))
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isToday(d: string) { return d === props.todayStr }

function formatGroupDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00')
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const yest = new Date(today); yest.setDate(today.getDate() - 1)
    if (d.getTime() === today.getTime()) return 'วันนี้'
    if (d.getTime() === yest.getTime()) return 'เมื่อวาน'
    return d.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
}

function formatSubDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('th-TH', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}
</script>

<template>
    <div>
        <!-- Toolbar -->
        <div class="flex items-center gap-3 flex-wrap mb-5">
            <h2 class="text-xl font-bold text-[--primary] flex-1">Daily Update</h2>

            <!-- Date filters -->
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style="background:#fff;border:0.5px solid #E3E1D8">
                <!-- <Icon icon="lucide:calendar" style="width:13px;height:13px;color:#B4B2A9;flex-shrink:0" /> -->
                <span>เลือกช่วงวันที่</span>
                <NDatePicker v-model:value="startTs" type="date" clearable size="small" placeholder="วันเริ่ม"
                    style="width:120px" />
                <span style="color:#D3D1C7;font-size:12px">–</span>
                <NDatePicker v-model:value="endTs" type="date" clearable size="small" placeholder="วันสิ้นสุด"
                    style="width:120px" :is-date-disabled="(ts: number) => startTs != null && ts < startTs" />
            </div>

            <!-- Add button -->
            <NButton :disabled="alreadyPostedToday" style="background:#EF9F27;border:none;color:#fff"
                @click="emit('add')">
                <template #icon>
                    <Icon icon="lucide:plus" style="width:14px;height:14px" />
                </template>
                {{ alreadyPostedToday ? 'บันทึกแล้ววันนี้' : 'เพิ่มบันทึก' }}
            </NButton>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-20">
            <div class="w-7 h-7 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        </div>

        <!-- Timeline -->
        <template v-else-if="grouped.length">
            <NTimeline>
                <NTimelineItem v-for="group in grouped" :key="group.date"
                    :color="isToday(group.date) ? '#0F6E56' : '#9FE1CB'">
                    <template #icon>
                        <div :style="{
                            width: '15px',
                            height: '15px',
                            minWidth: '15px',
                            minHeight: '15px',
                            borderRadius: '50%',
                            flexShrink: '0',
                            position: 'relative',
                            zIndex: '1',
                            background: isToday(group.date) ? '#0F6E56' : '#1D9E75',
                            outline: `2.5px solid ${isToday(group.date) ? '#0F6E56' : '#1D9E75'}`,
                            outlineOffset: '3px',
                        }" />
                    </template>

                    <template #header>
                        <div class="flex items-baseline gap-2 mb-3">
                            <span class="font-semibold"
                                :style="{ fontSize: '14px', color: isToday(group.date) ? '#0F6E56' : '#2C2C2A' }">
                                {{ group.displayDate }}
                            </span>
                            <span v-if="isToday(group.date)" class="text-xs" style="color:#B4B2A9">
                                {{ formatSubDate(group.date) }}
                            </span>
                            <span class="text-xs" style="color:#B4B2A9">· {{ group.items.length }} รายการ</span>
                        </div>
                    </template>

                    <div class="flex flex-col gap-3 mb-4">
                        <DailyUpdateCard v-for="upd in group.items" :key="upd.id" :update="upd" :phase="currentPhase"
                            :avatar-bg="avatarColor(upd.engineer_id).bg" :avatar-fg="avatarColor(upd.engineer_id).fg" />
                    </div>
                </NTimelineItem>
            </NTimeline>
        </template>

        <!-- Empty -->
        <div v-else class="flex flex-col items-center justify-center py-20 gap-3">
            <Icon icon="lucide:calendar-x" style="width:36px;height:36px;color:#D3D1C7" />
            <div class="text-sm text-gray-300">ยังไม่มี Daily Update ในช่วงเวลานี้</div>
        </div>
    </div>
</template>

<style scoped>
:deep(.n-timeline-item-timeline__line) {
    background: #E3E1D8 !important;
}

:deep(.n-timeline-item-timeline) {
    z-index: 0;
}

:deep(.n-timeline-item__icon) {
    z-index: 1;
}
</style>