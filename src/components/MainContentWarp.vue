<script setup></script>
<template>
  <div class="p-3 flex flex-column flex-auto main-div">
    <slot></slot>
  </div>
</template>
<style>
.main-div {
  height: 93vh;
  overflow-y: scroll;
}
</style>
