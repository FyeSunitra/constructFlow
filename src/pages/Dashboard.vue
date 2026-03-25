<template>
    <div class="flex">
        <AppSidebar />

        <div class="flex-1 p-6 bg-gray-100">
            <h1 class="text-2xl font-bold text-[var(--primary)] mb-6">
                Project Dashboard
            </h1>

            <div class="grid grid-cols-3 gap-4">
                <div class="bg-white p-4 rounded-xl shadow">All Projects: 24</div>
                <div class="bg-white p-4 rounded-xl shadow">Ongoing: 12</div>
                <div class="bg-white p-4 rounded-xl shadow">Completed: 8</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import AppSidebar from '@/components/layout/AppSidebar.vue'
</script>