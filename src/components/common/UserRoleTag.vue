<script setup lang="ts">
import { computed } from 'vue'
import { NTag } from 'naive-ui'
import type { UserRole } from '@/types/user';
import { ROLE_META } from '@/lib/user';

const props = defineProps<{ role: UserRole }>()
const meta = computed(() => ROLE_META[props.role])
</script>

<template>
    <NTag :type="meta.type" size="small" round>
        {{ meta.label }}
    </NTag>
</template>