<script setup>
import { ref, onMounted } from "vue";
const textContent = ref("");


const props = defineProps({
    textContent: String,
    confirmSaveDialog: Boolean,
});


const emit = defineEmits(["close", "confirm"]);

onMounted(() => {
    textContent.value = props.textContent;
});
function onClose() {
    emit("close");
}

function onConfirm() {
    emit("confirm");
}

</script>

<template>
    <Dialog :visible="props.confirmSaveDialog" @update:visible="onClose" :style="{ width: '450px' }" header="Confirm"
        :modal="true">
        <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>ต้องการบันทึก {{ textContent }} ใช่หรือไม่ ?  </span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="onClose" />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="onConfirm" />
        </template>
    </Dialog>
</template>
