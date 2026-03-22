<template>
  <div class="summary-report-page">
    <Toast />

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <Button icon="pi pi-arrow-left" class="p-button-text p-button-rounded" @click="router.push({ name: 'mainmenu' })" v-tooltip.bottom="'กลับเมนูหลัก'" />
        <h1><i class="pi pi-chart-bar mr-2"></i>สรุปผลการดำเนินการ</h1>
      </div>
      <div class="header-right">
        <span class="doc-count" v-if="historyList.length > 0"> <i class="pi pi-file mr-1"></i>{{ historyList.length }} รายการ </span>
      </div>
    </div>

    <!-- Search Section -->
    <div class="search-section">
      <div class="search-row">
        <div class="search-field">
          <label>จากวันที่</label>
          <Calendar v-model="fromDate" dateFormat="dd/mm/yy" :showIcon="true" class="w-full" />
        </div>
        <div class="search-field">
          <label>ถึงวันที่</label>
          <Calendar v-model="toDate" dateFormat="dd/mm/yy" :showIcon="true" class="w-full" />
        </div>        <div class="search-field">
          <label>สถานะ</label>
          <Dropdown
            v-model="filterStatus"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>
        <div class="search-field search-field-grow">
          <label>ค้นหา</label>
          <InputText v-model="searchText" placeholder="ค้นหาเลขที่เอกสาร, ลูกค้า, ทะเบียน..." class="w-full" @keyup.enter="fetchDocHistory" />
        </div>
        <div class="search-field search-field-btn">
          <label>&nbsp;</label>
          <Button label="ค้นหา" icon="pi pi-search" @click="fetchDocHistory" class="w-full" />
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card card-pending">
        <div class="card-icon"><i class="pi pi-clock"></i></div>
        <div class="card-info">
          <div class="card-value">{{ countByStatus("pending") }}</div>
          <div class="card-label">รอดำเนินการ</div>
        </div>
      </div>
      <div class="summary-card card-inprogress">
        <div class="card-icon"><i class="pi pi-spin pi-spinner"></i></div>
        <div class="card-info">
          <div class="card-value">{{ countByStatus("in-progress") }}</div>
          <div class="card-label">กำลังดำเนินการ</div>
        </div>
      </div>
      <div class="summary-card card-complete">
        <div class="card-icon"><i class="pi pi-check-circle"></i></div>
        <div class="card-info">
          <div class="card-value">{{ countByStatus("completed") }}</div>
          <div class="card-label">ปิดงาน</div>
        </div>
      </div>
      <div class="summary-card card-closed">
        <div class="card-icon"><i class="pi pi-lock"></i></div>
        <div class="card-info">
          <div class="card-value">{{ countByStatus("closed") }}</div>
          <div class="card-label">ปิดงานแล้ว</div>
        </div>
      </div>
      <div class="summary-card card-all">
        <div class="card-icon"><i class="pi pi-list"></i></div>
        <div class="card-info">
          <div class="card-value">{{ historyList.length }}</div>
          <div class="card-label">ทั้งหมด</div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-section">
      <DataTable
        :value="historyList"
        :loading="loading"
        stripedRows
        :rowHover="true"
        responsiveLayout="scroll"
        class="history-table"
        :paginator="true"
        :rows="15"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        :rowsPerPageOptions="[10, 15, 25, 50]"
      >
        <template #empty>
          <div class="text-center p-4">
            <i class="pi pi-inbox" style="font-size: 2.5rem; color: #ccc"></i>
            <p class="mt-2" style="color: #999">ไม่พบข้อมูล</p>
          </div>
        </template>

        <Column header="ลำดับ" style="width: 60px; text-align: center">
          <template #body="slotProps">
            <div class="text-center">{{ slotProps.index + 1 }}</div>
          </template>
        </Column>

        <Column field="status" header="สถานะ" style="min-width: 130px">
          <template #body="slotProps">
            <Tag :value="getStatusText(slotProps.data.status)" :severity="getStatusSeverity(slotProps.data.status)" :icon="getStatusIcon(slotProps.data.status)" />
          </template>
        </Column>
        <Column field="remark" header="หมายเหตุ" style="min-width: 120px">
          <template #body="slotProps">
            <span class="text-color-secondary">{{ slotProps.data.remark || "—" }}</span>
          </template>
        </Column>

        <Column field="doc_no" header="เลขที่เอกสาร" style="min-width: 150px">
          <template #body="slotProps">
            <span class="font-semibold" style="color: #1e40af">{{ slotProps.data.doc_no }}</span>
          </template>
        </Column>

        <Column field="doc_date" header="วันที่/เวลา" style="min-width: 110px">
          <template #body="slotProps">
            <div>{{ slotProps.data.doc_date }}</div>
            <small class="text-color-secondary">{{ slotProps.data.doc_time }} น.</small>
          </template>
        </Column>

        <Column field="cust_name" header="ลูกค้า" style="min-width: 180px">
          <template #body="slotProps">
            <div class="font-medium">{{ slotProps.data.cust_name }}</div>
            <small class="text-color-secondary">{{ slotProps.data.cust_code }}</small>
          </template>
        </Column>

        <Column field="car_brand" header="ยี่ห้อรถ" style="min-width: 100px" />

        <Column field="car_code" header="ทะเบียนรถ" style="min-width: 130px">
          <template #body="slotProps">
            <span class="car-plate-tag">{{ slotProps.data.car_code }}</span>
          </template>
        </Column>

        <Column field="emp_open_job" header="ผู้รับงาน" style="min-width: 120px">
          <template #body="slotProps">
            <span v-if="slotProps.data.emp_open_job" class="emp-name"> <i class="pi pi-user mr-1" style="font-size: 0.75rem"></i>{{ slotProps.data.emp_open_job }} </span>
            <span v-else class="text-color-secondary" style="font-size: 0.85rem">—</span>
          </template>
        </Column>

        <Column field="emp_close_job" header="ผู้ปิดงาน" style="min-width: 120px">
          <template #body="slotProps">
            <span v-if="slotProps.data.emp_close_job" class="emp-name"> <i class="pi pi-user mr-1" style="font-size: 0.75rem"></i>{{ slotProps.data.emp_close_job }} </span>
            <span v-else class="text-color-secondary" style="font-size: 0.85rem">—</span>
          </template>
        </Column>

        <Column field="remark_summary" header="สรุปผล" style="min-width: 150px">
          <template #body="slotProps">
            <span v-if="slotProps.data.remark_summary" class="remark-summary-text">{{ slotProps.data.remark_summary }}</span>
            <span v-else class="text-color-secondary">—</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import MasterdataService from "@/services/MasterdataService";
import Utils from "@/utils/";
import Tag from "primevue/tag";

const router = useRouter();
const toast = useToast();

// Search
const fromDate = ref(null);
const toDate = ref(null);
const searchText = ref("");
const filterStatus = ref("");
const loading = ref(false);

// Status filter options
const statusOptions = [
  { label: "ทุกสถานะ", value: "" },
  { label: "รอดำเนินการ", value: "pending" },
  { label: "กำลังดำเนินการ", value: "in-progress" },
  { label: "ปิดงาน", value: "completed" },
  { label: "จบงาน", value: "close" },
];

// Data
const historyList = ref([]);

// Init dates
onMounted(() => {
  const now = new Date();
  fromDate.value = now;
  toDate.value = now;
  fetchDocHistory();
});

// Fetch history list
const fetchDocHistory = async () => {
  loading.value = true;
  try {
    const from = Utils.getDateFormatPG(fromDate.value);
    const to = Utils.getDateFormatPG(toDate.value);
    const res = await MasterdataService.getDocHistoryList(from, to, searchText.value, filterStatus.value);
    if (res.success) {
      historyList.value = res.data || [];
    } else {
      historyList.value = [];
    }
  } catch (err) {
    console.error(err);
    toast.add({ severity: "error", summary: "ผิดพลาด", detail: "ไม่สามารถโหลดข้อมูลได้", life: 3000 });
  } finally {
    loading.value = false;
  }
};

// Count by status
const countByStatus = (status) => {
  return historyList.value.filter((d) => d.status === status).length;
};

// Status helpers
const getStatusText = (status) => {
  switch (status) {
    case "pending":
      return "รอดำเนินการ";
    case "in-progress":
      return "กำลังดำเนินการ";
    case "completed":
      return "ปิดงาน";
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
    case "completed":
      return "success";
    case "closed":
      return "secondary";
    default:
      return "secondary";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "pending":
      return "pi pi-clock";
    case "in-progress":
      return "pi pi-spin pi-spinner";
    case "completed":
      return "pi pi-check";
    case "closed":
      return "pi pi-lock";
    default:
      return "";
  }
};
</script>

<style scoped>
.summary-report-page {
  min-height: 100vh;
  background: #f0f2f5;
  padding: 1rem 1.5rem;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  background: #fff;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-left h1 {
  font-size: 1.25rem;
  color: #1e293b;
  margin: 0;
  font-weight: 700;
}

.header-right .doc-count {
  font-size: 0.85rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
}

/* Search */
.search-section {
  background: #fff;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 1rem;
}

.search-row {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.search-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 160px;
}

.search-field-grow {
  flex: 1;
  min-width: 200px;
}

.search-field-btn {
  min-width: 100px;
}

.search-field label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
}

/* Summary Cards */
.summary-cards {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.summary-card {
  flex: 1;
  min-width: 140px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #fff;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
  border-left: 4px solid transparent;
}

.card-pending {
  border-left-color: #f59e0b;
}
.card-inprogress {
  border-left-color: #3b82f6;
}
.card-complete {
  border-left-color: #10b981;
}
.card-closed {
  border-left-color: #6b7280;
}
.card-all {
  border-left-color: #8b5cf6;
}

.card-icon {
  font-size: 1.3rem;
}
.card-pending .card-icon {
  color: #f59e0b;
}
.card-inprogress .card-icon {
  color: #3b82f6;
}
.card-complete .card-icon {
  color: #10b981;
}
.card-closed .card-icon {
  color: #6b7280;
}
.card-all .card-icon {
  color: #8b5cf6;
}

.card-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.card-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
}

/* Table */
.table-section {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.car-plate-tag {
  display: inline-block;
  background: #eef2ff;
  color: #4338ca;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.82rem;
  white-space: nowrap;
}

.emp-name {
  font-size: 0.85rem;
  color: #334155;
}

.remark-summary-text {
  font-size: 0.85rem;
  color: #0f766e;
  background: #f0fdfa;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

:deep(.history-table .p-datatable-thead > tr > th) {
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
  font-size: 0.82rem;
  padding: 0.65rem 0.75rem;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

:deep(.history-table .p-datatable-tbody > tr > td) {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  vertical-align: middle;
}

:deep(.history-table .p-datatable-tbody > tr:hover) {
  background: #f8fafc !important;
}

:deep(.history-table .p-paginator) {
  padding: 0.5rem;
  border-top: 1px solid #f1f5f9;
}

/* Tag severity overrides */
:deep(.p-tag.p-tag-warning) {
  background: linear-gradient(135deg, #f59e0b, #d97706) !important;
  color: white;
}

:deep(.p-tag.p-tag-info) {
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  color: white;
}

:deep(.p-tag.p-tag-success) {
  background: linear-gradient(135deg, #22c55e, #16a34a) !important;
  color: white;
}

:deep(.p-tag.p-tag-secondary) {
  background: linear-gradient(135deg, #6b7280, #4b5563) !important;
  color: white;
}
</style>
