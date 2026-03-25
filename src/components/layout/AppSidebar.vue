<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const route = useRoute()
const router = useRouter()

// ✅ responsive collapse only
const isCollapsed = ref(false)

const handleResize = () => {
    // 👇 mobile = collapsed
    isCollapsed.value = window.innerWidth < 768
}

onMounted(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})

// menu mode
const isProjectMode = () => route.path.startsWith('/project')

// menu
const mainMenu = [
    { label: 'Dashboard', path: '/dashboard', icon: 'mdi:view-dashboard-outline' },
]

const projectMenu = [
    { label: 'Projects', path: '/project', icon: 'mdi:briefcase-outline' },
    { label: 'Phase', path: '/project/phase', icon: 'mdi:format-list-checks' },
    { label: 'Daily Update', path: '/project/daily', icon: 'mdi:file-document-outline' },
    { label: 'Timeline', path: '/project/timeline', icon: 'mdi:clock-outline' },
    { label: 'Budget', path: '/project/budget', icon: 'mdi:currency-usd' },
]

// active
const isActive = (path: string) => route.path === path

const go = (path: string) => {
    router.push(path)
}
</script>

<template>
    <div class="h-screen bg-[var(--primary)] text-white flex flex-col transition-all duration-300"
        :class="isCollapsed ? 'w-20' : 'w-64'">

        <!-- HEADER -->
        <div class="p-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <img src="/logoWhite.png" class="w-10" />
                <span v-if="!isCollapsed" class="text-sm font-semibold">
                    บริษัท<br />ปรมธร กรุ๊ป จำกัด
                </span>
            </div>

            <!-- toggle -->
            <button @click="isCollapsed = !isCollapsed">
                <Icon icon="mdi:menu" width="20" />
            </button>
        </div>

        <!-- MENU -->
        <div class="flex-1">

            <!-- MAIN -->
            <div v-if="!isProjectMode()">
                <div v-for="item in mainMenu" :key="item.path" @click="go(item.path)"
                    class="px-4 py-3 flex items-center gap-3 cursor-pointer"
                    :class="isActive(item.path) ? 'bg-white/30' : 'hover:bg-white/20'">
                    <Icon :icon="item.icon" width="20" />
                    <span v-if="!isCollapsed">{{ item.label }}</span>
                </div>
            </div>

            <!-- PROJECT -->
            <div v-else>
                <div class="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/20"
                    @click="go('/dashboard')">
                    <Icon icon="mdi:arrow-left" width="20" />
                    <span v-if="!isCollapsed">Back</span>
                </div>

                <div v-for="item in projectMenu" :key="item.path" @click="go(item.path)"
                    class="px-4 py-3 flex items-center gap-3 cursor-pointer"
                    :class="isActive(item.path) ? 'bg-white/30' : 'hover:bg-white/20'">
                    <Icon :icon="item.icon" width="20" />
                    <span v-if="!isCollapsed">{{ item.label }}</span>
                </div>
            </div>

        </div>

        <!-- FOOTER -->
        <div class="p-4 border-t border-white/20 flex items-center gap-3">
            <img src="/logoPNG.png" class="w-8 h-8 rounded-full" />

            <div v-if="!isCollapsed">
                <div class="text-sm">Admin Admin001</div>
                <div class="text-xs opacity-70 cursor-pointer">log out</div>
            </div>
        </div>

    </div>
</template>