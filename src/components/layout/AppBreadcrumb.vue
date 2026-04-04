<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '../../store/auth.store'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isCEO = () => auth.user?.role === 'CEO'

// Route label map — shared routes
const routeLabels: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/template': 'Template',
    '/setting': 'Setting',
    '/project': 'Projects',
    '/project/phase': 'Phase',
    '/project/daily': 'Daily Update',
    '/project/timeline': 'Timeline',
    '/project/budget': 'Budget',
}

// Build breadcrumb segments from current path
const breadcrumbs = computed(() => {
    const path = route.path
    const segments: { label: string; path: string; clickable: boolean }[] = []

    segments.push({ label: 'Dashboard', path: '/dashboard', clickable: path !== '/dashboard' })

    if (path === '/dashboard') return segments

    if (path.startsWith('/project')) {
        segments.push({ label: 'Projects', path: '/project', clickable: path !== '/project' })
        if (path !== '/project') {
            const label = routeLabels[path]
            if (label) segments.push({ label, path, clickable: false })
        }
        return segments
    }

    if (isCEO()) {
        if (path === '/template') {
            segments.push({ label: 'Template', path, clickable: false })
            return segments
        }
        if (path === '/setting') {
            segments.push({ label: 'Setting', path, clickable: false })
            return segments
        }
    }

    const parts = path.split('/').filter(Boolean)
    let accumulated = ''
    parts.forEach((part, i) => {
        accumulated += '/' + part
        const label = routeLabels[accumulated] || part.charAt(0).toUpperCase() + part.slice(1)
        segments.push({ label, path: accumulated, clickable: i < parts.length - 1 })
    })

    return segments
})

const navigate = (path: string, clickable: boolean) => {
    if (clickable) router.push(path)
}
</script>

<template>
    <nav class="flex items-center gap-1.5 text-sm select-none" aria-label="Breadcrumb">
        <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
            <Icon v-if="index > 0" icon="mdi:chevron-right" width="15" class="text-gray-400 shrink-0" />

            <button v-if="crumb.clickable" @click="navigate(crumb.path, crumb.clickable)"
                class="flex items-center gap-1.5 px-2 py-1 rounded-md text-gray-500 hover:text-[var(--primary)] hover:bg-[var(--primary)]/8 transition-all duration-150 font-medium">
                <Icon v-if="index === 0" icon="mdi:view-dashboard-outline" width="14" class="shrink-0" />
                {{ crumb.label }}
            </button>

            <span v-else
                class="flex items-center gap-1.5 px-2 py-1 rounded-md text-[var(--primary)] font-semibold bg-[var(--primary)]/10 cursor-default">
                <Icon v-if="index === 0" icon="mdi:view-dashboard-outline" width="14" class="shrink-0" />
                {{ crumb.label }}
            </span>
        </template>
    </nav>
</template>