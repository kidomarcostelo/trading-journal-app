<script setup lang="ts">
definePageMeta({
  middleware: [
    () => navigateTo('/dashboard')
  ]
})
</script>

<template>
  <div>Redirecting to dashboard...</div>
</template>
