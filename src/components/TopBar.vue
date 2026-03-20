<script setup>
import { useApp } from "@/stores/app.js";
const storeApp = useApp();
</script>

<template>
  <div
    class="flex justify-content-start align-items-center px-3 surface-section shadow-2 relative lg:static border-bottom-1 surface-border animation-duration-200 animation-ease-in-out"
    style="height: 5vh">
    <a class="cursor-pointer block text-700 p-ripple" @click="storeApp.setActivedToggle();">
      <i class="pi pi-bars"></i>
    </a>
    <span class="mb-1 ml-2"> {{ storeApp.PageTitle }}</span>
  </div>
</template>
