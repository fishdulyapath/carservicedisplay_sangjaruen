<template>
  <div class="status-manage-page">
    <Toast />
    <ConfirmDialog />

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <Button
          icon="pi pi-arrow-left"
          class="p-button-text p-button-rounded"
          @click="router.push({ name: 'mainmenu' })"
          v-tooltip.bottom="'กลับเมนูหลัก'"
        />
        <h1><i class="pi pi-cog mr-2"></i>จัดการสถานะ</h1>
      </div>
    </div>

    <!-- Search Section -->
    <div class="search-section">
      <div class="flex align-items-end gap-3 flex-wrap">
        <div class="field">
          <label>จากวันที่</label>
          <Calendar v-model="fromDate" dateFormat="dd/mm/yy" :showIcon="true" />
        </div>
        <div class="field">
          <label>ถึงวันที่</label>
          <Calendar v-model="toDate" dateFormat="dd/mm/yy" :showIcon="true" />
        </div>
        <div class="field">
          <label>ค้นหา</label>
          <InputText v-model="searchText" placeholder="ค้นหา..." @keyup.enter="fetchDocList" />
        </div>
        <Button label="ค้นหา" icon="pi pi-search" @click="fetchDocList" />
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-section">
      <DataTable
        :value="docList"
        :loading="loading"
        stripedRows
        :rowHover="true"
        responsiveLayout="scroll"
        class="doc-table"
        :paginator="true"
        :rows="15"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        :rowsPerPageOptions="[10, 15, 25, 50]"
      >
        <template #empty>
          <div class="text-center p-4">
            <i class="pi pi-inbox" style="font-size: 2rem; color: #ccc"></i>
            <p class="mt-2" style="color: #999">ไม่พบข้อมูล</p>
          </div>
        </template>

        <Column header="ลำดับ" style="width: 5%; text-align: center">
          <template #body="slotProps">
            <div class="text-center">{{ slotProps.index + 1 }}</div>
          </template>
        </Column>

        <Column field="doc_no" header="เลขที่เอกสาร" style="width: 14%">
          <template #body="slotProps">
            <span class="font-semibold">{{ slotProps.data.doc_no }}</span>
          </template>
        </Column>

        <Column field="doc_date" header="วันที่" style="width: 10%">
          <template #body="slotProps">
            <span>{{ slotProps.data.doc_date }}</span>
            <br />
            <small class="text-color-secondary">{{ slotProps.data.doc_time }}</small>
          </template>
        </Column>

        <Column field="cust_name" header="ลูกค้า" style="width: 16%">
          <template #body="slotProps">
            <div>{{ slotProps.data.cust_name }}</div>
            <small class="text-color-secondary">{{ slotProps.data.cust_code }}</small>
          </template>
        </Column>

        <Column field="car_brand" header="ยี่ห้อรถ" style="width: 10%" />

        <Column field="car_code" header="ทะเบียนรถ" style="width: 10%">
          <template #body="slotProps">
            <span class="car-plate-tag">{{ slotProps.data.car_code }}</span>
          </template>
        </Column>

        <Column field="emp_open_job" header="ผู้รับงาน" style="width: 10%">
          <template #body="slotProps">
            <span v-if="slotProps.data.emp_open_job">
              <i class="pi pi-user mr-1"></i>{{ slotProps.data.emp_open_job }}
            </span>
            <span v-else class="text-color-secondary">-</span>
          </template>
        </Column>

        <Column field="emp_close_job" header="ผู้ปิดงาน" style="width: 10%">
          <template #body="slotProps">
            <span v-if="slotProps.data.emp_close_job">
              <i class="pi pi-user mr-1"></i>{{ slotProps.data.emp_close_job }}
            </span>
            <span v-else class="text-color-secondary">-</span>
          </template>
        </Column>

        <Column field="status" header="สถานะ" style="width: 8%">
          <template #body="slotProps">
            <Tag
              :value="getStatusText(slotProps.data.status)"
              :severity="getStatusSeverity(slotProps.data.status)"
              :icon="getStatusIcon(slotProps.data.status)"
            />
          </template>
        </Column>

        <Column header="ดำเนินการ" style="width: 12%; text-align: center">
          <template #body="slotProps">
            <div class="flex justify-content-center gap-2">
              <!-- pending => รับงาน -->
              <Button
                v-if="slotProps.data.status === 'pending'"
                label="รับงาน"
                icon="pi pi-play"
                class="p-button-sm p-button-info"
                @click="openEmployeeDialog(slotProps.data, 'getjob')"
              />
              <!-- in-progress => ปิดงาน -->
              <Button
                v-if="slotProps.data.status === 'in-progress'"
                label="ปิดงาน"
                icon="pi pi-stop-circle"
                class="p-button-sm p-button-warning"
                @click="openEmployeeDialog(slotProps.data, 'complete')"
              />
              <!-- complete => เสร็จงาน -->
              <Button
                v-if="slotProps.data.status === 'complete'"
                label="เสร็จงาน"
                icon="pi pi-check-circle"
                class="p-button-sm p-button-success"
                @click="confirmCloseJob(slotProps.data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Employee Selection Dialog -->
    <Dialog
      v-model:visible="showEmployeeDialog"
      :header="dialogMode === 'getjob' ? 'เลือกผู้รับงาน' : 'เลือกผู้ปิดงาน'"
      :modal="true"
      :style="{ width: '450px' }"
      :closable="true"
    >
      <div class="p-fluid">
        <div class="field">
          <label class="font-semibold mb-2 block">เอกสาร: {{ selectedDoc?.doc_no }}</label>
        </div>
        <div class="field">
          <label class="font-semibold mb-2 block">ผู้ดำเนินการ</label>
          <Dropdown
            v-model="selectedEmployee"
            :options="filteredEmployees"
            optionLabel="label"
            :filter="true"
            filterPlaceholder="ค้นหาผู้ดำเนินการ..."
            placeholder="เลือกผู้ดำเนินการ"
            class="w-full"
            :showClear="true"
          >
            <template #option="slotProps">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-user"></i>
                <span>{{ slotProps.option.label }}</span>
              </div>
            </template>
          </Dropdown>
        </div>
      </div>

      <template #footer>
        <Button label="ยกเลิก" icon="pi pi-times" class="p-button-text" @click="showEmployeeDialog = false" />
        <Button
          label="บันทึก"
          icon="pi pi-check"
          class="p-button-primary"
          :disabled="!selectedEmployee"
          @click="confirmSaveEmployee"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import MasterdataService from "@/services/MasterdataService";
import Utils from "@/utils/";
import Tag from "primevue/tag";

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

// Search
const fromDate = ref(null);
const toDate = ref(null);
const searchText = ref("");
const loading = ref(false);

// Data
const docList = ref([]);
const employees = ref([]);

// Dialog
const showEmployeeDialog = ref(false);
const selectedDoc = ref(null);
const selectedEmployee = ref(null);
const dialogMode = ref("getjob"); // 'getjob' or 'complete'

// Get current logged-in usercode
const currentUserCode = computed(() => {
  return (localStorage.getItem("_usercode") || "").toUpperCase();
});

// Filtered employees for dropdown
const filteredEmployees = computed(() => {
  return employees.value;
});

// Init dates
onMounted(() => {
  const now = new Date();
  fromDate.value = new Date(now.getFullYear(), now.getMonth(), 1);
  toDate.value = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  fetchDocList();
  fetchEmployees();
});

// Fetch document list
const fetchDocList = async () => {
  loading.value = true;
  try {
    const from = Utils.getDateFormatPG(fromDate.value);
    const to = Utils.getDateFormatPG(toDate.value);
    const res = await MasterdataService.getDocList(from, to, searchText.value);
    if (res.success) {
      docList.value = res.data || [];
    } else {
      docList.value = [];
    }
  } catch (err) {
    console.error(err);
    toast.add({ severity: "error", summary: "ผิดพลาด", detail: "ไม่สามารถโหลดข้อมูลได้", life: 3000 });
  } finally {
    loading.value = false;
  }
};

// Fetch employees
const fetchEmployees = async () => {
  try {
    const res = await MasterdataService.getEmployee();
    if (res.success) {
      employees.value = res.data || [];
    }
  } catch (err) {
    console.error(err);
  }
};

// Status helpers
const getStatusText = (status) => {
  switch (status) {
    case "pending":
      return "รอดำเนินการ";
    case "in-progress":
      return "กำลังดำเนินการ";
    case "complete":
      return "ดำเนินการเสร็จ";
    case "closed":
      return "ปิดงานแล้ว";
    default:
      return status;
  }
};

const getStatusSeverity = (status) => {
  switch (status) {
    case "pending":
      return "warning";
    case "in-progress":
      return "info";
    case "complete":
      return "success";
    case "closed":
      return null;
    default:
      return null;
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "pending":
      return "pi pi-clock";
    case "in-progress":
      return "pi pi-spin pi-spinner";
    case "complete":
      return "pi pi-check";
    case "closed":
      return "pi pi-lock";
    default:
      return "";
  }
};

// Open employee dialog
const openEmployeeDialog = (doc, mode) => {
  selectedDoc.value = doc;
  dialogMode.value = mode;

  // Default: match current usercode
  const matchedEmp = employees.value.find(
    (emp) => emp.code.toUpperCase() === currentUserCode.value
  );
  selectedEmployee.value = matchedEmp || null;

  showEmployeeDialog.value = true;
};

// Confirm save employee
const confirmSaveEmployee = () => {
  const actionText = dialogMode.value === "getjob" ? "รับงาน" : "ปิดงาน";
  confirm.require({
    message: `ยืนยัน${actionText}เอกสาร ${selectedDoc.value.doc_no} โดย ${selectedEmployee.value.name_1} ?`,
    header: "ยืนยันการดำเนินการ",
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "ตกลง",
    rejectLabel: "ยกเลิก",
    accept: async () => {
      await saveEmployeeAction();
    },
  });
};

// Save action
const saveEmployeeAction = async () => {
  try {
    let res;
    if (dialogMode.value === "getjob") {
      res = await MasterdataService.updateGetJob(selectedDoc.value.doc_no, selectedEmployee.value.code);
    } else {
      res = await MasterdataService.updateCompleteJob(selectedDoc.value.doc_no, selectedEmployee.value.code);
    }

    if (res.success) {
      const actionText = dialogMode.value === "getjob" ? "รับงาน" : "ปิดงาน";
      toast.add({ severity: "success", summary: "สำเร็จ", detail: `${actionText}เรียบร้อยแล้ว`, life: 3000 });
      showEmployeeDialog.value = false;
      await fetchDocList();
    } else {
      toast.add({ severity: "error", summary: "ผิดพลาด", detail: res.message || "ดำเนินการไม่สำเร็จ", life: 3000 });
    }
  } catch (err) {
    console.error(err);
    toast.add({ severity: "error", summary: "ผิดพลาด", detail: "เกิดข้อผิดพลาดในการดำเนินการ", life: 3000 });
  }
};

// Confirm close job (เสร็จงาน)
const confirmCloseJob = (doc) => {
  confirm.require({
    message: `ยืนยันเสร็จงานเอกสาร ${doc.doc_no} ?`,
    header: "ยืนยันเสร็จงาน",
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "ตกลง",
    rejectLabel: "ยกเลิก",
    accept: async () => {
      try {
        const res = await MasterdataService.updateCloseJob(doc.doc_no);
        if (res.success) {
          toast.add({ severity: "success", summary: "สำเร็จ", detail: "เสร็จงานเรียบร้อยแล้ว", life: 3000 });
          await fetchDocList();
        } else {
          toast.add({ severity: "error", summary: "ผิดพลาด", detail: res.message || "ดำเนินการไม่สำเร็จ", life: 3000 });
        }
      } catch (err) {
        console.error(err);
        toast.add({ severity: "error", summary: "ผิดพลาด", detail: "เกิดข้อผิดพลาดในการดำเนินการ", life: 3000 });
      }
    },
  });
};
</script>

<style scoped>
.status-manage-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 1.5rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  background: #fff;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-left h1 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 700;
}

.search-section {
  background: #fff;
  padding: 1.2rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 1rem;
}

.search-section .field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.search-section label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
}

.table-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.car-plate-tag {
  background: #eef2ff;
  color: #4338ca;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
}

:deep(.doc-table .p-datatable-thead > tr > th) {
  background: #f1f5f9;
  color: #334155;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.75rem 1rem;
}

:deep(.doc-table .p-datatable-tbody > tr > td) {
  padding: 0.6rem 1rem;
  font-size: 0.88rem;
}

:deep(.doc-table .p-datatable-tbody > tr:hover) {
  background: #f8fafc !important;
}
</style>
