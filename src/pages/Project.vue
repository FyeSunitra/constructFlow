<script setup lang="ts">

</script>
<template>
    <div class="flex">
        <AppSidebar />
        <div class="flex-1 flex flex-col overflow-hidden bg-[--body]">
            <header class="shrink-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center">
                <AppBreadcrumb />
            </header>

            <main class="flex-1 overflow-y-auto p-6">
            </main>
        </div>
    </div>
</template>
