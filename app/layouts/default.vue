<script setup lang="ts">
const { loggedIn } = useUserSession();

// Sidebar reference for mobile menu toggle
const sidebarRef = ref<{ toggleMobileMenu: () => void } | null>(null);

// Listen for toggle event from AppHeader
onMounted(() => {
  window.addEventListener('toggle-mobile-menu', () => {
    sidebarRef.value?.toggleMobileMenu();
  });
});

onUnmounted(() => {
  window.removeEventListener('toggle-mobile-menu', () => {});
});
</script>

<template>
  <!-- Main layout when authenticated -->
  <div v-if="loggedIn" class="flex h-screen overflow-hidden bg-gray-100">
    <!-- Sidebar -->
    <AppSidebar ref="sidebarRef" />

    <!-- Main content -->
    <div class="flex flex-1 flex-col overflow-hidden lg:ml-0">
      <!-- Header -->
      <AppHeader />

      <!-- Page content -->
      <main class="flex-1 overflow-auto">
        <div class="mx-auto max-w-7xl px-4 py-5">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
