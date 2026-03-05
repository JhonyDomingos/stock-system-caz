<script setup lang="ts">
const { settings } = useSettings();

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - ${settings.value?.businessName || 'ZOE Stock System'}` : settings.value?.businessName || 'ZOE Stock System';
  }
});
</script>

<template>
  <div class="min-h-screen bg-background">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Toast notification system -->
    <UiToastContainer />
  </div>
</template>
