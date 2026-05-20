<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import { useAuthStore } from "../../store/auth.store";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const isCollapsed = ref(false);

const isCEO = () => auth.user?.role === "CEO";

const handleResize = () => {
    isCollapsed.value = window.innerWidth < 1024;
};
onMounted(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
});
onUnmounted(() => window.removeEventListener("resize", handleResize));

// Project mode: any path under /project (including /project/:id, /project/:id/phase etc.)
const isProjectMode = () => route.path.startsWith("/project");

const mainMenu = [
    {
        label: "Dashboard",
        path: "/dashboard",
        icon: "mdi:view-dashboard-outline",
    },
    ...(isCEO()
        ? [
              {
                  label: "Template",
                  path: "/template",
                  icon: "mdi:layers-outline",
              },
              {
                  label: "Users",
                  path: "/users",
                  icon: "mdi:account-group-outline",
              },
              // { label: 'Setting', path: '/setting', icon: 'mdi:cog-outline' },
          ]
        : []),
];

const projectMenu = [
    { label: "Projects", path: "detail", icon: "mdi:briefcase-outline" },
    { label: "Phase", path: "phase", icon: "mdi:format-list-checks" },
    { label: "Daily Update", path: "daily", icon: "mdi:file-document-outline" },
    { label: "Budget", path: "budget", icon: "mdi:currency-usd" },
];

function isActive(item: { path: string }) {
    const p = route.path;

    if (item.path === "detail") {
        return /^\/project\/[^/]+$/.test(p);
    }

    return p.endsWith(`/${item.path}`);
}

function go(path: string) {
    if (path.startsWith("/")) {
        router.push(path);
        return;
    }

    const match = route.path.match(/^\/project\/([^/]+)/);
    if (match) {
        const projectId = match[1];
        if (path === "detail") {
            router.push(`/project/${projectId}`);
        } else {
            router.push(`/project/${projectId}/${path}`);
        }
    } else {
        router.push(`/project`);
    }
}

const handleLogout = async () => {
    await auth.logout();
    router.push(`/`).then(() => {
        window.location.reload();
    });
};

const userInitials = () => {
    const name = auth.user?.full_name || auth.user?.username || "";
    return name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};
</script>

<template>
    <div
        class="sidebar h-screen bg-[var(--primary)] text-white flex flex-col transition-all duration-300 ease-in-out select-none"
        :class="isCollapsed ? 'w-[72px]' : 'w-64'"
    >
        <!-- Logo -->
        <div class="px-4 py-5 flex items-center justify-between shrink-0">
            <transition name="fade-slide">
                <div
                    v-if="!isCollapsed"
                    class="flex items-center gap-3 overflow-hidden"
                >
                    <img
                        src="/logoWhite.png"
                        class="w-9 h-9 shrink-0 object-contain"
                    />
                    <div
                        class="leading-tight overflow-hidden whitespace-nowrap"
                    >
                        <div class="text-[11px] font-medium opacity-70">
                            บริษัท
                        </div>
                        <div class="text-sm font-bold tracking-wide">
                            ปรมธร กรุ๊ป จำกัด
                        </div>
                    </div>
                </div>
            </transition>
            <button
                class="shrink-0 w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/20 transition-colors"
                @click="isCollapsed = !isCollapsed"
            >
                <Icon
                    :icon="isCollapsed ? 'mdi:menu-open' : 'mdi:menu'"
                    width="18"
                />
            </button>
        </div>

        <div class="mx-4 h-px bg-white/10 shrink-0" />

        <!-- Nav -->
        <div
            class="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-none"
        >
            <!-- Main menu -->
            <div v-if="!isProjectMode()">
                <div
                    v-for="item in mainMenu"
                    :key="item.path"
                    class="nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 mb-1"
                    :class="
                        route.path === item.path
                            ? 'bg-white/25 shadow-inner'
                            : 'hover:bg-white/15'
                    "
                    :title="isCollapsed ? item.label : ''"
                    @click="go(item.path)"
                >
                    <Icon :icon="item.icon" width="20" class="shrink-0" />
                    <span
                        v-if="!isCollapsed"
                        class="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                        {{ item.label }}
                    </span>
                    <div
                        v-if="route.path === item.path && !isCollapsed"
                        class="ml-auto w-1.5 h-1.5 rounded-full bg-white shrink-0"
                    />
                </div>
            </div>

            <!-- Project submenu -->
            <div v-else>
                <div
                    class="nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/15 transition-all duration-150 mb-2"
                    :title="isCollapsed ? 'กลับ' : ''"
                    @click="go('/dashboard')"
                >
                    <Icon icon="mdi:arrow-left" width="20" class="shrink-0" />
                    <span v-if="!isCollapsed" class="text-sm font-medium"
                        >กลับ</span
                    >
                </div>

                <div class="mx-1 h-px bg-white/10 mb-2" />

                <div
                    v-for="item in projectMenu"
                    :key="item.path"
                    class="nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 mb-1"
                    :class="
                        isActive(item)
                            ? 'bg-white/25 shadow-inner'
                            : 'hover:bg-white/15'
                    "
                    :title="isCollapsed ? item.label : ''"
                    @click="go(item.path)"
                >
                    <Icon :icon="item.icon" width="20" class="shrink-0" />
                    <span
                        v-if="!isCollapsed"
                        class="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                        {{ item.label }}
                    </span>
                    <div
                        v-if="isActive(item) && !isCollapsed"
                        class="ml-auto w-1.5 h-1.5 rounded-full bg-white shrink-0"
                    />
                </div>
            </div>
        </div>

        <!-- User row -->
        <div class="shrink-0 px-3 py-3 border-t border-white/10">
            <div
                class="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/10 cursor-default"
                :class="isCollapsed ? 'justify-center' : ''"
            >
                <div
                    class="shrink-0 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30 text-xs font-bold tracking-wide"
                >
                    {{ userInitials() }}
                </div>
                <transition name="fade-slide">
                    <div v-if="!isCollapsed" class="flex-1 overflow-hidden">
                        <div
                            class="text-sm font-semibold leading-tight truncate"
                        >
                            {{ auth.user?.full_name || auth.user?.username }}
                        </div>
                        <div class="text-xs opacity-50 truncate capitalize">
                            {{ auth.user?.role || "Member" }}
                        </div>
                    </div>
                </transition>
                <transition name="fade-slide">
                    <button
                        v-if="!isCollapsed"
                        class="shrink-0 w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/20 transition-colors opacity-60 hover:opacity-100"
                        title="Log out"
                        @click="handleLogout"
                    >
                        <Icon icon="mdi:logout" width="16" />
                    </button>
                </transition>
            </div>
            <div v-if="isCollapsed" class="flex justify-center mt-2">
                <button
                    class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/20 transition-colors opacity-50 hover:opacity-100"
                    title="Log out"
                    @click="handleLogout"
                >
                    <Icon icon="mdi:logout" width="16" />
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.scrollbar-none {
    scrollbar-width: none;
}

.scrollbar-none::-webkit-scrollbar {
    display: none;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateX(-6px);
}

.nav-item {
    position: relative;
}
</style>
