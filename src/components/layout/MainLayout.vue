<template>
  <div class="main-layout">
    <main class="main-content">
      <slot></slot>
    </main>
    <Footer />
  </div>
</template>

<script>
export default {
  name: 'MainLayout'
}
</script>

<script setup>
import Footer from './Footer.vue'
</script>

<style lang="scss" scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}
</style> 