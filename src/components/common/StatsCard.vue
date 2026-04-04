<script setup lang="ts">
defineProps<{
    label: string
    value: number | string
    accent?: 'default' | 'orange' | 'red' | 'green'
}>()

const accentMap: Record<string, string> = {
    default: 'bg-[var(--primary)]',
    orange: 'bg-orange-400',
    red: 'bg-red-400',
    green: 'bg-emerald-400',
}
</script>

<template>
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1 rounded-t-xl" :class="accentMap[accent ?? 'default']" />
        <p class="text-xs font-semibold uppercase tracking-widest text-gray-400">{{ label }}</p>
        <p class="text-3xl font-bold text-gray-800">{{ value }}</p>
    </div>
</template>