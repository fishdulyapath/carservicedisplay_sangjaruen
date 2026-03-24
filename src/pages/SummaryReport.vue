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
        </div>
        <div class="search-field">
          <label>สถานะ</label>
          <Dropdown v-model="filterStatus" :options="statusOptions" optionLabel="label" optionValue="value" class="w-full" />
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
        v-model:expandedRows="expandedRows"
        @rowExpand="onRowExpand"
        dataKey="doc_no"
      >
        <template #empty>
          <div class="text-center p-4">
            <i class="pi pi-inbox" style="font-size: 2.5rem; color: #ccc"></i>
            <p class="mt-2" style="color: #999">ไม่พบข้อมูล</p>
          </div>
        </template>

        <template #expansion="slotProps">
          <div class="expansion-content">
            <div class="expansion-header">
              <i class="pi pi-box mr-2"></i>
              <span class="font-bold">รายละเอียดสินค้า — {{ slotProps.data.doc_no }}</span>
            </div>
            <div v-if="loadingDetail[slotProps.data.doc_no]" class="text-center p-3">
              <i class="pi pi-spin pi-spinner" style="font-size: 1.5rem; color: #6366f1"></i>
              <p class="mt-2" style="color: #999; font-size: 0.85rem">กำลังโหลดข้อมูล...</p>
            </div>
            <DataTable v-else :value="docDetails[slotProps.data.doc_no] || []" class="detail-table" responsiveLayout="scroll">
              <template #empty>
                <div class="text-center p-3" style="color: #999; font-size: 0.85rem">ไม่พบรายละเอียดสินค้า</div>
              </template>
              <Column header="ลำดับ" style="width: 60px; text-align: center">
                <template #body="sp">
                  <div class="text-center">{{ sp.index + 1 }}</div>
                </template>
              </Column>
              <Column field="item_code" header="รหัสสินค้า" style="min-width: 120px">
                <template #body="sp">
                  <span class="font-semibold" style="color: #6366f1">{{ sp.data.item_code }}</span>
                </template>
              </Column>
              <Column field="item_name" header="ชื่อสินค้า" style="min-width: 250px" />
              <Column field="qty" header="จำนวน" style="min-width: 100px; text-align: right">
                <template #body="sp">
                  <div class="text-right">{{ formatNumber(sp.data.qty) }}</div>
                </template>
              </Column>
              <Column field="unit_name" header="หน่วย" style="min-width: 80px" />
              <Column field="price" header="ราคา" style="min-width: 120px; text-align: right">
                <template #body="sp">
                  <div class="text-right">{{ formatNumber(sp.data.price) }}</div>
                </template>
              </Column>
              <Column field="sum_amount" header="รวม" style="min-width: 120px; text-align: right">
                <template #body="sp">
                  <div class="text-right font-bold" style="color: #0f766e">{{ formatNumber(sp.data.sum_amount) }}</div>
                </template>
              </Column>
            </DataTable>
          </div>
        </template>

        <Column :expander="true" style="width: 3rem" />

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

        <Column header="พิมพ์" style="width: 60px; text-align: center" frozen alignFrozen="right">
          <template #body="slotProps">
            <Button icon="pi pi-print" class="p-button-sm p-button-rounded p-button-text print-btn" v-tooltip.top="'พิมพ์เอกสาร'" @click="printDoc(slotProps.data)" />
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
        <Column field="remark" header="หมายเหตุ" style="min-width: 120px">
          <template #body="slotProps">
            <span class="text-color-secondary">{{ slotProps.data.remark || "—" }}</span>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Print Area (hidden, shown only on print) -->
    <div id="print-area">
      <div class="slip-doc" v-if="printData">
        <div class="slip-shop-name">ใบงานจัดรถ</div>
        <div class="slip-divider-dash"></div>

        <div class="slip-row">
          <span class="slip-label">เลขที่ :</span><strong>{{ printData.doc_no }}</strong>
        </div>
        <div class="slip-row"><span class="slip-label">วันที่ :</span>{{ printData.doc_date }} {{ printData.doc_time }} น.</div>
        <div class="slip-divider-dot"></div>
        <div class="slip-row"><span class="slip-label">ลูกค้า :</span>{{ printData.cust_name }}</div>
        <div class="slip-row" v-if="printData.cust_code"><span class="slip-label">รหัส :</span>{{ printData.cust_code }}</div>
        <div class="slip-row"><span class="slip-label">ยี่ห้อ :</span>{{ printData.car_brand }}</div>
        <div class="slip-row">
          <span class="slip-label">ทะเบียน :</span><strong>{{ printData.car_code }}</strong>
        </div>
        <div class="slip-row"><span class="slip-label">สถานะ :</span>{{ getStatusText(printData.status) }}</div>
        <div class="slip-row" v-if="printData.emp_open_job"><span class="slip-label">ผู้รับงาน :</span>{{ printData.emp_open_job }}</div>
        <div class="slip-row" v-if="printData.emp_close_job"><span class="slip-label">ผู้ปิดงาน :</span>{{ printData.emp_close_job }}</div>
        <div class="slip-row" v-if="printData.remark_summary"><span class="slip-label">สรุปผล :</span>{{ printData.remark_summary }}</div>

        <div class="slip-divider-dash"></div>
        <div class="slip-section-title">รายละเอียดรายการ</div>
        <div class="slip-divider-dot"></div>

        <template v-if="printDetails && printDetails.length > 0">
          <div class="slip-item" v-for="(item, idx) in printDetails" :key="idx">
            <div class="slip-item-name">{{ idx + 1 }}. [{{ item.item_code }}] {{ item.item_name }}</div>
            <div class="slip-item-qty"><strong>{{ formatNumber(item.qty) }} {{ item.unit_name }}</strong></div>
          </div>
        </template>
        <div v-else class="slip-empty">-- ไม่พบรายละเอียด --</div>

        <div class="slip-divider-dash"></div>
      </div>
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
const expandedRows = ref([]);
const docDetails = ref({});
const loadingDetail = ref({});

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

// Row expand — fetch doc detail
const onRowExpand = async (event) => {
  const docNo = event.data.doc_no;
  if (docDetails.value[docNo]) return; // already loaded

  loadingDetail.value[docNo] = true;
  try {
    const res = await MasterdataService.getCarDocDetail(docNo);
    if (res.success) {
      docDetails.value[docNo] = res.data || [];
    } else {
      docDetails.value[docNo] = [];
    }
  } catch (err) {
    console.error(err);
    docDetails.value[docNo] = [];
  } finally {
    loadingDetail.value[docNo] = false;
  }
};

// Print
const printData = ref(null);
const printDetails = ref([]);

const printDoc = async (doc) => {
  printData.value = doc;
  if (!docDetails.value[doc.doc_no]) {
    try {
      const res = await MasterdataService.getCarDocDetail(doc.doc_no);
      if (res.success) docDetails.value[doc.doc_no] = res.data || [];
      else docDetails.value[doc.doc_no] = [];
    } catch {
      docDetails.value[doc.doc_no] = [];
    }
  }
  printDetails.value = docDetails.value[doc.doc_no] || [];
  await new Promise((r) => setTimeout(r, 80));
  window.print();
};

// Format number to 2 decimal places
const formatNumber = (val) => {
  const num = parseFloat(val);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

/* Expansion */
.expansion-content {
  padding: 0.75rem 1rem;
  background: #fafbfe;
  border-left: 3px solid #6366f1;
  margin: 0.25rem 0;
  border-radius: 0 8px 8px 0;
}

.expansion-header {
  font-size: 0.9rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.expansion-header i {
  color: #6366f1;
}

:deep(.detail-table .p-datatable-thead > tr > th) {
  background: #eef2ff;
  color: #4338ca;
  font-weight: 700;
  font-size: 0.78rem;
  padding: 0.5rem 0.65rem;
  border-bottom: 2px solid #c7d2fe;
  white-space: nowrap;
}

:deep(.detail-table .p-datatable-tbody > tr > td) {
  padding: 0.4rem 0.65rem;
  font-size: 0.82rem;
  vertical-align: middle;
}

:deep(.detail-table .p-datatable-tbody > tr:hover) {
  background: #eef2ff !important;
}

:deep(.history-table .p-row-toggler) {
  color: #6366f1 !important;
  width: 2rem;
  height: 2rem;
}

:deep(.history-table .p-row-toggler:hover) {
  background: #eef2ff !important;
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

/* Print button */
:deep(.print-btn) {
  color: #6366f1 !important;
  width: 2rem !important;
  height: 2rem !important;
}
:deep(.print-btn:hover) {
  background: #eef2ff !important;
}

/* Print Area — hidden on screen, shown on print */
#print-area {
  display: none;
}

@media print {
  body * {
    visibility: hidden !important;
  }
  #print-area,
  #print-area * {
    visibility: visible !important;
  }
  #print-area {
    display: block !important;
    position: fixed;
    top: 0;
    left: 0;
    width: 80mm;
  }
}

/* Slip 80mm styles */
.slip-doc {
  width: 72mm;
  margin: 0 auto;
  font-family: "Sarabun", "Tahoma", sans-serif;
  font-size: 11pt;
  color: #000;
}
.slip-shop-name {
  text-align: center;
  font-size: 14pt;
  font-weight: bold;
  margin-bottom: 4px;
}
.slip-divider-dash {
  border-top: 1px dashed #000;
  margin: 4px 0;
}
.slip-divider-dot {
  border-top: 1px dotted #999;
  margin: 3px 0;
}
.slip-row {
  display: flex;
  gap: 4px;
  margin: 2px 0;
  font-size: 10pt;
}
.slip-label {
  min-width: 60px;
  color: #555;
  flex-shrink: 0;
}
.slip-section-title {
  text-align: center;
  font-weight: bold;
  font-size: 10pt;
  margin: 2px 0;
}
.slip-item {
  margin: 3px 0;
  font-size: 9.5pt;
}
.slip-item-name {
  font-weight: 500;
}
.slip-item-qty {
  text-align: right;
  color: #333;
  font-size: 9.5pt;
}
.slip-empty {
  text-align: center;
  font-size: 9pt;
  color: #888;
  margin: 4px 0;
}
.slip-total-row {
  display: flex;
  justify-content: space-between;
  font-size: 12pt;
  font-weight: bold;
  padding: 2px 0;
}
.slip-footer {
  text-align: center;
  font-size: 9.5pt;
  color: #555;
  margin-top: 4px;
}
</style>
