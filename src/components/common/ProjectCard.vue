<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
    id: string | number
    name: string
    location: string
    startDate: string
    endDate: string
    status: 'IN PROGRESS' | 'DELAYED' | 'COMPLETED' | string
    phase?: string
    area?: string
}>()

const router = useRouter()

const statusStyle: Record<string, string> = {
    'IN PROGRESS': 'bg-orange-400 text-white',
    'DELAYED': 'bg-red-400 text-white',
    'COMPLETED': 'bg-emerald-500 text-white',
}

const go = () => router.push(`/project/${props.id}`)
</script>

<template>
    <div class="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
        @click="go">
        <!-- Header -->
        <div class="flex items-start justify-between gap-2">
            <h3 class="text-sm font-semibold text-gray-800 leading-snug">{{ name }}</h3>
            <span class="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                :class="statusStyle[status] ?? 'bg-gray-200 text-gray-600'">
                {{ status }}
            </span>
        </div>

        <!-- Location -->
        <div class="flex items-center gap-1.5 text-xs text-gray-500">
            <Icon icon="mdi:account-outline" width="13" class="shrink-0" />
            {{ location }}
        </div>

        <!-- Date -->
        <div class="flex items-center gap-1.5 text-xs text-gray-500">
            <Icon icon="mdi:calendar-outline" width="13" class="shrink-0" />
            {{ startDate }} – {{ endDate }}
        </div>

        <!-- Phase tag -->
        <div v-if="phase" class="flex items-center gap-2">
            <span
                class="text-[10px] font-semibold bg-blue-100 text-blue-600 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                {{ phase }}
            </span>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between mt-1 pt-2 border-t border-gray-100">
            <div class="flex items-center gap-1.5 text-xs text-gray-500">
                <Icon icon="mdi:home-outline" width="13" class="shrink-0" />
                {{ area }}
            </div>
            <div class="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                <Icon icon="mdi:arrow-right" width="13" class="text-[var(--primary)]" />
            </div>
        </div>
    </div>
</template>