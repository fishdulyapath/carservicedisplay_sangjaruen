<script setup>
import { ref, onMounted } from "vue";
const textLabel = ref("");


const props = defineProps({
    textLabel: String,
});


onMounted(() => {
    textLabel.value = props.textLabel;
});

</script>

<template>
<span class="text-orange-500">* </span>     <span class="font-medium text-900">{{ textLabel }} </span>
</template>
