<script setup lang="ts">

import { ref } from "vue";

const currentPage = ref(1);
const filtered = ref([]);

const stats = ref([
  { label: "All Projects", value: 24, accent: "default" },
  { label: "Ongoing", value: 12, accent: "orange" },
  { label: "Delayed", value: 2, accent: "red" },
  { label: "Completed", value: 10, accent: "green" },
]);

const showNewProjectModal = ref(false);
const handleNewProject = () => {
  showNewProjectModal.value = true;
};
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <AppSidebar />

    <div class="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <!-- Top bar -->
      <header class="shrink-0 bg-white border-b border-gray-100 px-6 py-3">
        <AppBreadcrumb />
      </header>

      <!-- Scrollable content -->
      <main class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Stats row -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard v-for="stat in stats" :key="stat.label" :label="stat.label" :value="stat.value" />
        </div>

        <ProjectList @new-project="handleNewProject" />
      </main>
    </div>
  </div>
</template>
