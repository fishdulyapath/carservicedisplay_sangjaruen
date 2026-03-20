<template>
  <div class="withdraw-container">
    <div class="header">
      <h1 class="title">เบิกสินค้า</h1>
    </div>

    <div class="search-section">
      <div class="p-inputgroup">
        <InputText
          v-model="searchDocNumber"
          placeholder="ค้นหาเลขที่เอกสาร"
          class="search-input"
        />
        <Button icon="pi pi-search" class="search-button" @click="searchDocument" />
      </div>
    </div>

    <div class="table-section">
      <DataTable
        :value="items"
        :paginator="true"
        :rows="10"
        stripedRows
        responsiveLayout="scroll"
        class="p-datatable-lg"
      >
        <Column field="index" header="#" style="width: 10%"></Column>
        <Column field="item_name" header="ชื่อสินค้า" style="width: 70%"></Column>
        <Column field="qty" header="จำนวน" style="width: 20%"></Column>
      </DataTable>
    </div>

    <div class="action-section">
      <div class="button-container">
        <Button 
          label="กลับหน้าหลัก" 
          icon="pi pi-arrow-left" 
          class="back-button p-button-outlined p-button-lg"
          @click="goToMainMenu"
        />
        <Button 
          label="ยืนยันการจัดสินค้า" 
          icon="pi pi-check" 
          class="confirm-button p-button-lg"
          @click="  doc_no != ''
              ? (showConfirmDialog = true)
              : showError('กรุณาค้นหาเอกสารก่อนยืนยัน')"
        />
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <Dialog
      v-model:visible="showConfirmDialog"
      modal
      header="ยืนยันการจัดสินค้า"
      :closable="true"
      :style="{ width: '450px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span>คุณต้องการยืนยันการจัดสินค้าใช่หรือไม่?</span>
      </div>
      <template #footer>
        <Button
          label="ไม่"
          icon="pi pi-times"
          class="p-button-text"
          @click="cancelConfirmation"
        />
        <Button
          label="ใช่"
          icon="pi pi-check"
          class="p-button-success"
          @click="confirmWithdraw"
        />
      </template>
    </Dialog>

    <!-- Success Dialog -->
    <Dialog
      v-model:visible="showSuccessDialog"
      modal
      header="ดำเนินการสำเร็จ"
      :closable="true"
      :style="{ width: '450px' }"
    >
      <div class="success-content">
        <i class="pi pi-check-circle mr-3" style="font-size: 2rem; color: #22c55e" />
        <span>เบิกสินค้าเรียบร้อยแล้ว</span>
      </div>
      <template #footer>
        <Button label="ตกลง" class="p-button-success" @click="closeSuccessDialog" />
      </template>
    </Dialog>

    <!-- Error Dialog -->
    <Dialog
      v-model:visible="showErrorDialog"
      modal
      header="เกิดข้อผิดพลาด"
      :closable="true"
      :style="{ width: '450px' }"
    >
      <div class="error-content">
        <i
          class="pi pi-exclamation-circle mr-3"
          style="font-size: 2rem; color: #ef4444"
        />
        <span>{{ errorMessage }}</span>
      </div>
      <template #footer>
        <Button label="ตกลง" class="p-button-danger" @click="showErrorDialog = false" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

// PrimeVue components
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Dialog from "primevue/dialog";
import MasterdataService from "@/services/MasterdataService";
import { now } from "moment";

const router = useRouter();
const searchDocNumber = ref("");
const showConfirmDialog = ref(false);
const showSuccessDialog = ref(false);
const showErrorDialog = ref(false);
const errorMessage = ref("");
const doc_no = ref(""); // Document number for the search

// Mock data for items
const items = ref([]);

// Search for document
const searchDocument = async () => {
  // In a real app, this would call an API to search for the document
  console.log("Searching for document:", searchDocNumber.value);

  try {
    const res = await MasterdataService.getCarDocDetail(searchDocNumber.value);
    if (res.success) {
      doc_no.value = searchDocNumber.value;
      items.value = []; // Clear previous items
      if (res.data.length === 0) {
        showError("ไม่พบเอกสารที่ค้นหา");
        return;
      }
      res.data.forEach((item, index) => {
        // Fixed typo: foeEach -> forEach
        item.index = index + 1;
        items.value.push(item);
      });
    } else {
      showError(res.message);
    }
  } catch (error) {
    console.error("Error searching for document:", error);
    showError("เกิดข้อผิดพลาดในการค้นหา โปรดลองอีกครั้ง");
  }
};

const goToMainMenu = () => {
  router.push('/mainmenu');
};


// Confirmation handlers
const cancelConfirmation = () => {
  showConfirmDialog.value = false;
};

const confirmWithdraw = async () => {
  // In a real app, this would call an API to confirm the withdrawal
  console.log("Confirming withdrawal");
  showConfirmDialog.value = false;

  try {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    var times = `${hours}:${minutes}`;
    console.log(times);
    const res = await MasterdataService.updateCarDoc(doc_no.value, "1", times);
    if (res.success) {
      showSuccessDialog.value = true;
    } else {
      showError(res.message);
    }
  } catch (error) {
    console.error("Error searching for document:", error);
    showError("เกิดข้อผิดพลาด โปรดลองอีกครั้ง");
  }
  // Show success message
};

// Function to show error message
const showError = (message) => {
  errorMessage.value = message;
  showErrorDialog.value = true;
};

const closeSuccessDialog = async () => {
  showSuccessDialog.value = false;

  // Redirect to another page or perform any other action
  await router.push("/mainmenu");
};

onMounted(() => {
  // Any initialization code can go here
});
</script>

<style scoped>
.withdraw-container {
  font-family: "Prompt", "Sarabun", sans-serif;
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 2rem;
}

.title {
  color: #e84c10;
  font-size: 2.5rem;
  font-weight: bold;
}

.search-section {
  margin-bottom: 2rem;
  max-width: 600px;
}

.search-input {
  font-size: 1.1rem;
}

.search-button {
  background-color: #e84c10;
  border-color: #e84c10;
}

.search-button:hover {
  background-color: #d44000;
  border-color: #d44000;
}

.table-section {
  margin-bottom: 2rem;
  flex-grow: 1;
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.action-section {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.confirm-button {
  background-color: #22c55e;
  border-color: #22c55e;
  font-size: 1.2rem;
  padding: 0.75rem 2rem;
}

.confirm-button:hover {
  background-color: #16a34a;
  border-color: #16a34a;
}

.confirmation-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
}

.confirmation-content i {
  color: #f59e0b;
  margin-right: 0.5rem;
}

.success-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
}

.error-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
}

/* PrimeVue component styling */
:deep(.p-datatable-thead th) {
  background-color: #f4f4f4;
  color: #444;
  font-weight: bold;
  border-bottom: 2px solid #e84c10;
}

:deep(.p-datatable-tbody tr:nth-child(even)) {
  background-color: #f9f9f9;
}

:deep(.p-datatable-tbody tr:hover) {
  background-color: #fff3ed !important;
}

/* Responsive styles */
@media (max-width: 768px) {
  .withdraw-container {
    padding: 1rem;
  }

  .title {
    font-size: 2rem;
  }

  .search-section {
    max-width: 100%;
  }
}
.button-container {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.back-button {
  color: #e84c10;
  border-color: #e84c10;
  font-size: 1.2rem;
  padding: 0.75rem 1.5rem;
}

.back-button:hover {
  background-color: #fff3ed;
  border-color: #d44000;
  color: #d44000;
}
</style>
