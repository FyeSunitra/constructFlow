<script lang="ts">
// Named export so TypeScript resolves props correctly even with auto-import
export default { name: 'UserAvatar' }
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { NAvatar } from 'naive-ui'
import { avatarBg, avatarFg, getInitials } from '@/lib/user';

const props = defineProps<{
    firstName: string
    lastName: string
    username?: string
    size?: number
}>()

const seed = computed(() => props.username || props.firstName || '?')
const initials = computed(() => getInitials(props.firstName, props.lastName))
const bg = computed(() => avatarBg(seed.value))
const fg = computed(() => avatarFg(seed.value))
const fontSize = computed(() => `${Math.round((props.size ?? 36) * 0.36)}px`)
</script>

<template>
    <NAvatar round :size="size ?? 36" :style="{
        background: bg,
        color: fg,
        fontSize,
        fontWeight: '500',
        flexShrink: '0',
    }">
        {{ initials }}
    </NAvatar>
</template>