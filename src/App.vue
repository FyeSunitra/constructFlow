<script setup lang="ts">
import { NMessageProvider, NDialogProvider, NNotificationProvider } from 'naive-ui'
</script>

<template>
  <NMessageProvider>
    <NDialogProvider>
      <NNotificationProvider>
        <router-view />
      </NNotificationProvider>
    </NDialogProvider>
  </NMessageProvider>
</template>