<script lang="ts">
export default { name: 'DailyUpdateCard' }
</script>

<script setup lang="ts">
import { NImage, NImageGroup } from 'naive-ui'
import { Icon } from '@iconify/vue'

export interface DailyUpdateItem {
    id: string
    date: string
    engineer_id: string
    engineer: { id: string; first_name: string; last_name: string }
    work_done: string
    issues: string
    image_url: string | null
    created_at: string
}

const props = defineProps<{
    update: DailyUpdateItem
    phase: string
    avatarBg: string
    avatarFg: string
}>()

function initials() {
    return `${props.update.engineer.first_name[0]}${props.update.engineer.last_name[0]}`.toUpperCase()
}
</script>

<template>
    <div class="bg-white rounded-xl p-4" style="border:0.5px solid #E3E1D8">

        <!-- Engineer -->
        <div class="flex items-center gap-2.5 mb-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                :style="{ background: avatarBg, color: avatarFg }">
                {{ initials() }}
            </div>
            <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-800">
                    {{ update.engineer.first_name }} {{ update.engineer.last_name }}
                </div>
                <span class="inline-flex items-center h-4 px-1.5 rounded-full text-[9px] font-medium mt-0.5"
                    style="background:#E1F5EE;color:#0F6E56">
                    {{ phase }}
                </span>
            </div>
        </div>

        <!-- Work done -->
        <div class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">สิ่งที่ทำ</div>
        <div class="text-sm text-gray-700 leading-relaxed" :class="update.issues ? 'mb-3' : ''">
            {{ update.work_done }}
        </div>

        <!-- Issues -->
        <div v-if="update.issues" class="flex items-start gap-2 rounded-lg p-2.5 mt-2" style="background:#FCEBEB">
            <Icon icon="lucide:alert-triangle"
                style="width:13px;height:13px;color:#A32D2D;margin-top:1px;flex-shrink:0" />
            <div class="text-xs leading-relaxed" style="color:#A32D2D">{{ update.issues }}</div>
        </div>

        <!-- Photos -->
        <div v-if="update.image_url" class="mt-3">
            <NImageGroup>
                <div class="flex gap-2 flex-wrap">
                    <NImage :src="update.image_url" width="80" height="60" object-fit="cover"
                        class="rounded-lg overflow-hidden cursor-pointer" />
                </div>
            </NImageGroup>
        </div>
    </div>
</template>