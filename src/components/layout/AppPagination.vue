<script setup lang="ts">
import { computed } from 'vue'
import { NPagination } from 'naive-ui'

const props = defineProps<{
  total: number
  page: number
  pageSize?: number
}>()

const emit = defineEmits<{
  'update:page': [page: number]
}>()

const currentPage = computed({
  get: () => props.page,
  set: (val) => emit('update:page', val),
})
</script>

<template>
  <div class="flex justify-center">
    <n-pagination v-model:page="currentPage" :item-count="total" :page-size="pageSize ?? 6" :page-slot="7"
      :simple="false" />
  </div>
</template>