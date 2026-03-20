<script setup>
import { RouterLink, RouterView } from "vue-router";
import HelloWorld from "@/components/HelloWorld.vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import { onMounted } from "vue";

onMounted(() => {
  document.title = "CarServiceDiaplay";
});
</script>

<template>
  <RouterView />
</template>

<style lang="scss">
@import "./assets/styles/app.scss";
</style>
