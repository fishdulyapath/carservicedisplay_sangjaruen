<template>
  <div class="summary-report-page">
    <Toast />

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <Button
          icon="pi pi-arrow-left"
          class="p-button-text p-button-rounded"
          @click="router.push({ name: 'mainmenu' })"
          v-tooltip.bottom="'กลับเมนูหลัก'"
        />
        <h1><i class="pi pi-chart-bar mr-2"></i>สรุปผลการดำเนินการ</h1>
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
          <InputText v-model="searchText" placeholder="ค้นหา..." @keyup.enter="fetchDocHistory" />
        </div>
        <Button label="ค้นหา" icon="pi pi-search" @click="fetchDocHistory" />
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
          <div class="card-value">{{ countByStatus("complete") }}</div>
          <div class="card-label">ดำเนินการเสร็จ</div>
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

        <Column field="car_code" header="ทะเบียนรถ" style="width: 12%">
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

        <Column field="status" header="สถานะ" style="width: 10%">
          <template #body="slotProps">
            <Tag
              :value="getStatusText(slotProps.data.status)"
              :severity="getStatusSeverity(slotProps.data.status)"
              :icon="getStatusIcon(slotProps.data.status)"
            />
          </template>
        </Column>

        <Column field="remark" header="หมายเหตุ" style="width: 10%">
          <template #body="slotProps">
            <span>{{ slotProps.data.remark || "-" }}</span>
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
const loading = ref(false);

// Data
const historyList = ref([]);

// Init dates
onMounted(() => {
  const now = new Date();
  fromDate.value = new Date(now.getFullYear(), now.getMonth(), 1);
  toDate.value = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  fetchDocHistory();
});

// Fetch history list
const fetchDocHistory = async () => {
  loading.value = true;
  try {
    const from = Utils.getDateFormatPG(fromDate.value);
    const to = Utils.getDateFormatPG(toDate.value);
    const res = await MasterdataService.getDocHistoryList(from, to, searchText.value);
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
</script>

<style scoped>
.summary-report-page {
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

.summary-cards {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.summary-card {
  flex: 1;
  min-width: 150px;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #fff;
  padding: 1rem 1.2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
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
  font-size: 1.5rem;
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
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.card-label {
  font-size: 0.8rem;
  color: #64748b;
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

:deep(.history-table .p-datatable-thead > tr > th) {
  background: #f1f5f9;
  color: #334155;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.75rem 1rem;
}

:deep(.history-table .p-datatable-tbody > tr > td) {
  padding: 0.6rem 1rem;
  font-size: 0.88rem;
}

:deep(.history-table .p-datatable-tbody > tr:hover) {
  background: #f8fafc !important;
}
</style>
