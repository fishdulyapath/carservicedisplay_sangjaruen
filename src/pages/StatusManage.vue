<template>
  <div class="status-manage-page">
    <Toast />

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <Button icon="pi pi-arrow-left" class="p-button-text p-button-rounded" @click="router.push({ name: 'mainmenu' })" v-tooltip.bottom="'กลับเมนูหลัก'" />
        <h1><i class="pi pi-cog mr-2"></i>จัดการสถานะ</h1>
      </div>
      <div class="header-right">
        <div class="sound-switch-wrap">
          <i :class="soundEnabled ? 'pi pi-volume-up sound-icon-on' : 'pi pi-volume-off sound-icon-off'"></i>
          <span class="sound-label">เสียงแจ้งเตือน</span>
          <InputSwitch v-model="soundEnabled" @change="onSoundSwitchChange" />
          <span :class="soundEnabled ? 'sound-state-on' : 'sound-state-off'">{{ soundEnabled ? 'เปิด' : 'ปิด' }}</span>
        </div>
        <span class="doc-count" v-if="docList.length > 0"> <i class="pi pi-file mr-1"></i>{{ docList.length }} รายการ </span>
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
          <InputText v-model="searchText" placeholder="ค้นหาเลขที่เอกสาร, ลูกค้า, ทะเบียน..." class="w-full" @keyup.enter="fetchDocList" />
        </div>
        <div class="search-field search-field-btn">
          <label>&nbsp;</label>
          <Button label="ค้นหา" icon="pi pi-search" @click="fetchDocList" class="w-full" />
        </div>
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
        currentPageReportTemplate="แสดง {first} ถึง {last} จาก {totalRecords} รายการ"
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

        <Column header="ดำเนินการ" style="min-width: 160px; text-align: center" frozen alignFrozen="right">
          <template #body="slotProps">
            <div class="flex justify-content-center align-items-center gap-1">
              <Button v-if="slotProps.data.status === 'pending'" label="รับงาน" icon="pi pi-play" class="p-button-sm p-button-info action-btn" @click="openEmployeeDialog(slotProps.data, 'getjob')" />
              <Button
                v-else-if="slotProps.data.status === 'in-progress'"
                label="ปิดงาน"
                icon="pi pi-stop-circle"
                class="p-button-sm p-button-warning action-btn"
                @click="openEmployeeDialog(slotProps.data, 'complete')"
              />
              <Button
                v-else-if="slotProps.data.status === 'completed'"
                label="เสร็จงาน"
                icon="pi pi-check-circle"
                class="p-button-sm p-button-success action-btn"
                @click="confirmCloseJob(slotProps.data)"
              />
              <Tag v-else value="ปิดงานแล้ว" severity="info" icon="pi pi-lock" />
            </div>
          </template>
        </Column>
        <Column field="" header="พิมพ์" style="min-width: 80px; text-align: center" frozen alignFrozen="right">
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
      </DataTable>
    </div>

    <!-- Employee Selection Dialog -->
    <Dialog
      v-model:visible="showEmployeeDialog"
      :header="dialogMode === 'getjob' ? '🔧 เลือกผู้รับงาน' : '✅ เลือกผู้ปิดงาน'"
      :modal="true"
      :style="{ width: '500px' }"
      :closable="true"
      :draggable="false"
    >
      <!-- Step 1: เลือกผู้ดำเนินการ -->
      <div v-if="!showConfirmStep" class="dialog-body">
        <div class="dialog-doc-info">
          <div class="info-row">
            <span class="info-label">เอกสาร</span>
            <span class="info-value font-bold">{{ selectedDoc?.doc_no }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">ลูกค้า</span>
            <span class="info-value">{{ selectedDoc?.cust_name }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">ทะเบียนรถ</span>
            <span class="info-value">{{ selectedDoc?.car_code }}</span>
          </div>
        </div>

        <Divider />

        <div class="field">
          <label class="font-semibold mb-2 block"><i class="pi pi-user mr-1"></i>ผู้ดำเนินการ</label>
          <Dropdown
            v-model="selectedEmployee"
            :options="employees"
            optionLabel="label"
            :filter="true"
            filterPlaceholder="พิมพ์ชื่อหรือรหัสเพื่อค้นหา..."
            placeholder="— เลือกผู้ดำเนินการ —"
            class="w-full"
            :showClear="true"
          >
            <template #option="slotProps">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-user" style="color: #6366f1"></i>
                <span>{{ slotProps.option.label }}</span>
              </div>
            </template>
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex align-items-center gap-2">
                <i class="pi pi-user" style="color: #6366f1"></i>
                <span>{{ slotProps.value.label }}</span>
              </div>
              <span v-else>{{ slotProps.placeholder }}</span>
            </template>
          </Dropdown>
        </div>

        <!-- สรุปผล (เฉพาะปิดงาน) -->
        <div class="field mb-0" v-if="dialogMode === 'complete'">
          <label class="font-semibold mb-2 block"><i class="pi pi-pencil mr-1"></i>สรุปผลการดำเนินการ</label>
          <Textarea v-model="remarkText" rows="3" class="w-full" placeholder="ระบุสรุปผลการดำเนินการ..." autoResize />
        </div>
      </div>

      <!-- Step 2: หน้ายืนยัน -->
      <div v-else class="confirm-step">
        <div class="confirm-icon-area">
          <div :class="['confirm-circle', dialogMode === 'getjob' ? 'circle-info' : 'circle-warning']">
            <i :class="dialogMode === 'getjob' ? 'pi pi-play' : 'pi pi-stop-circle'" style="font-size: 1.8rem"></i>
          </div>
        </div>
        <div class="confirm-title">{{ dialogMode === "getjob" ? "ยืนยันรับงาน" : "ยืนยันปิดงาน" }}</div>
        <div class="confirm-details">
          <div class="confirm-detail-row">
            <span class="detail-label">เอกสาร</span>
            <span class="detail-value font-bold" style="color: #1e40af">{{ selectedDoc?.doc_no }}</span>
          </div>
          <div class="confirm-detail-row">
            <span class="detail-label">ลูกค้า</span>
            <span class="detail-value">{{ selectedDoc?.cust_name }}</span>
          </div>
          <div class="confirm-detail-row">
            <span class="detail-label">ผู้ดำเนินการ</span>
            <span class="detail-value font-semibold" style="color: #6366f1">{{ selectedEmployee?.name_1 }}</span>
          </div>
          <div class="confirm-detail-row" v-if="dialogMode === 'complete' && remarkText">
            <span class="detail-label">สรุปผล</span>
            <span class="detail-value">{{ remarkText }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-content-between w-full" v-if="showConfirmStep">
          <Button label="ย้อนกลับ" icon="pi pi-arrow-left" class="p-button-text p-button-secondary" @click="showConfirmStep = false" />
          <Button
            :label="dialogMode === 'getjob' ? 'ตกลง รับงาน' : 'ตกลง ปิดงาน'"
            icon="pi pi-check"
            :class="dialogMode === 'getjob' ? 'p-button-info' : 'p-button-warning'"
            :loading="saving"
            @click="doSaveEmployee"
          />
        </div>
        <div class="flex justify-content-end gap-2" v-else>
          <Button label="ยกเลิก" icon="pi pi-times" class="p-button-text p-button-secondary" @click="showEmployeeDialog = false" />
          <Button
            :label="'ถัดไป'"
            icon="pi pi-arrow-right"
            iconPos="right"
            :class="dialogMode === 'getjob' ? 'p-button-info' : 'p-button-warning'"
            :disabled="!selectedEmployee"
            @click="showConfirmStep = true"
          />
        </div>
      </template>
    </Dialog>

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

    <!-- Confirm Close Job Dialog (เสร็จงาน) -->
    <Dialog v-model:visible="showConfirmCloseDialog" :modal="true" :style="{ width: '420px' }" :closable="true" :draggable="false" :showHeader="false">
      <div class="confirm-close-body">
        <div class="confirm-icon-area">
          <div class="confirm-circle circle-success">
            <i class="pi pi-check-circle" style="font-size: 1.8rem"></i>
          </div>
        </div>
        <div class="confirm-title">ยืนยันเสร็จงาน</div>
        <p class="confirm-subtitle">คุณต้องการปิดเสร็จงานเอกสารนี้ใช่หรือไม่?</p>
        <div class="confirm-details">
          <div class="confirm-detail-row">
            <span class="detail-label">เอกสาร</span>
            <span class="detail-value font-bold" style="color: #1e40af">{{ confirmCloseDoc?.doc_no }}</span>
          </div>
          <div class="confirm-detail-row">
            <span class="detail-label">ลูกค้า</span>
            <span class="detail-value">{{ confirmCloseDoc?.cust_name }}</span>
          </div>
          <div class="confirm-detail-row">
            <span class="detail-label">ทะเบียนรถ</span>
            <span class="detail-value">{{ confirmCloseDoc?.car_code }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-content-center gap-3 w-full">
          <Button label="ยกเลิก" icon="pi pi-times" class="p-button-outlined p-button-secondary" style="min-width: 120px" @click="showConfirmCloseDialog = false" />
          <Button label="ตกลง เสร็จงาน" icon="pi pi-check" class="p-button-success" style="min-width: 140px" :loading="saving" @click="doCloseJob" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
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
const saving = ref(false);

const statusOptions = [
  { label: "ทุกสถานะ", value: "" },
  { label: "รอดำเนินการ", value: "pending" },
  { label: "กำลังดำเนินการ", value: "in-progress" },
  { label: "ปิดงาน", value: "completed" },
];

// Data
const docList = ref([]);
const employees = ref([]);
const expandedRows = ref([]);
const docDetails = ref({});
const loadingDetail = ref({});

// Employee Dialog
const showEmployeeDialog = ref(false);
const selectedDoc = ref(null);
const selectedEmployee = ref(null);
const dialogMode = ref("getjob");
const remarkText = ref("");
const showConfirmStep = ref(false);

// Close Job Confirm Dialog
const showConfirmCloseDialog = ref(false);
const confirmCloseDoc = ref(null);

// Sound notification
const soundEnabled = ref(localStorage.getItem("_soundEnabled") !== "false");
let soundInterval = null;
let audioCtx = null;

const onSoundSwitchChange = () => {
  localStorage.setItem("_soundEnabled", soundEnabled.value);
};

const playBeep = () => {
  try {
    // eslint-disable-next-line
    if (!audioCtx) audioCtx = new (window.AudioContext || window["webkitAudioContext"])();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) {
    console.warn("Audio error:", e);
  }
};

const checkAndPlaySound = () => {
  if (!soundEnabled.value) return;
  const hasPending = docList.value.some((d) => d.status === "pending");
  if (hasPending) playBeep();
};

// Print
const printData = ref(null);
const printDetails = ref([]);

const printDoc = async (doc) => {
  printData.value = doc;
  // Load details if not yet loaded
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

// Reset confirm step when dialog opens/closes
watch(showEmployeeDialog, (val) => {
  if (!val) {
    showConfirmStep.value = false;
  }
});

// Get current logged-in usercode
const currentUserCode = computed(() => {
  return (localStorage.getItem("_usercode") || "").toUpperCase();
});

// Init dates
onMounted(() => {
  const now = new Date();
  fromDate.value = now;
  toDate.value = now;
  fetchDocList();
  fetchEmployees();
  soundInterval = setInterval(checkAndPlaySound, 10000);
});

onUnmounted(() => {
  if (soundInterval) clearInterval(soundInterval);
  if (audioCtx) audioCtx.close();
});

// Fetch document list
const fetchDocList = async () => {
  loading.value = true;
  try {
    const from = Utils.getDateFormatPG(fromDate.value);
    const to = Utils.getDateFormatPG(toDate.value);
    const res = await MasterdataService.getDocList(from, to, searchText.value, filterStatus.value);
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

// Open employee dialog
const openEmployeeDialog = (doc, mode) => {
  selectedDoc.value = doc;
  dialogMode.value = mode;
  remarkText.value = "";
  showConfirmStep.value = false;

  // Default: match current usercode
  const matchedEmp = employees.value.find((emp) => emp.code.toUpperCase() === currentUserCode.value);
  selectedEmployee.value = matchedEmp || null;
  showEmployeeDialog.value = true;
};

// Save action (Step 2 confirm)
const doSaveEmployee = async () => {
  if (!selectedEmployee.value) return;

  saving.value = true;
  const actionText = dialogMode.value === "getjob" ? "รับงาน" : "ปิดงาน";
  try {
    let res;
    if (dialogMode.value === "getjob") {
      res = await MasterdataService.updateGetJob(selectedDoc.value.doc_no, selectedEmployee.value.code);
    } else {
      res = await MasterdataService.updateCompleteJob(selectedDoc.value.doc_no, selectedEmployee.value.code, remarkText.value);
    }

    if (res.success) {
      toast.add({ severity: "success", summary: "สำเร็จ", detail: `${actionText}เรียบร้อยแล้ว`, life: 3000 });
      showEmployeeDialog.value = false;
      await fetchDocList();
    } else {
      toast.add({ severity: "error", summary: "ผิดพลาด", detail: res.message || "ดำเนินการไม่สำเร็จ", life: 5000 });
    }
  } catch (err) {
    console.error(err);
    toast.add({ severity: "error", summary: "ผิดพลาด", detail: "เกิดข้อผิดพลาดในการดำเนินการ", life: 5000 });
  } finally {
    saving.value = false;
  }
};

// Confirm close job (เสร็จงาน) — use custom Dialog
const confirmCloseJob = (doc) => {
  confirmCloseDoc.value = doc;
  showConfirmCloseDialog.value = true;
};

const doCloseJob = async () => {
  saving.value = true;
  try {
    const res = await MasterdataService.updateCloseJob(confirmCloseDoc.value.doc_no);
    if (res.success) {
      toast.add({ severity: "success", summary: "สำเร็จ", detail: "เสร็จงานเรียบร้อยแล้ว", life: 3000 });
      showConfirmCloseDialog.value = false;
      await fetchDocList();
    } else {
      toast.add({ severity: "error", summary: "ผิดพลาด", detail: res.message || "ดำเนินการไม่สำเร็จ", life: 5000 });
    }
  } catch (err) {
    console.error(err);
    toast.add({ severity: "error", summary: "ผิดพลาด", detail: "เกิดข้อผิดพลาดในการดำเนินการ", life: 5000 });
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.status-manage-page {
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

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
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

.action-btn {
  white-space: nowrap;
  font-size: 0.8rem !important;
}

:deep(.doc-table .p-datatable-thead > tr > th) {
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
  font-size: 0.82rem;
  padding: 0.65rem 0.75rem;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

:deep(.doc-table .p-datatable-tbody > tr > td) {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  vertical-align: middle;
}

:deep(.doc-table .p-datatable-tbody > tr:hover) {
  background: #f8fafc !important;
}

:deep(.doc-table .p-paginator) {
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

:deep(.doc-table .p-row-toggler) {
  color: #6366f1 !important;
  width: 2rem;
  height: 2rem;
}

:deep(.doc-table .p-row-toggler:hover) {
  background: #eef2ff !important;
}

/* Dialog body */
.dialog-body {
  padding: 0.25rem 0;
}

.dialog-doc-info {
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 0;
}

.info-label {
  color: #64748b;
  font-size: 0.85rem;
}

.info-value {
  color: #1e293b;
  font-size: 0.85rem;
}

/* Confirm Step (inside employee dialog) */
.confirm-step {
  text-align: center;
  padding: 0.5rem 0;
}

.confirm-icon-area {
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.confirm-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.circle-info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
}

.circle-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
}

.circle-success {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
}

.confirm-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.confirm-subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0 0 1rem 0;
}

.confirm-details {
  background: #f8fafc;
  border-radius: 10px;
  padding: 0.75rem 1.25rem;
  text-align: left;
  border: 1px solid #e2e8f0;
}

.confirm-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.confirm-detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: #64748b;
  font-size: 0.82rem;
  min-width: 80px;
}

.detail-value {
  color: #1e293b;
  font-size: 0.85rem;
  text-align: right;
}

/* Confirm Close Body */
.confirm-close-body {
  text-align: center;
  padding: 1.5rem 0.5rem 0.5rem;
}

/* Action button color overrides */
:deep(.action-btn.p-button-info) {
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  border-color: #2563eb !important;
  color: white !important;
}
:deep(.action-btn.p-button-info:hover) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
}

:deep(.action-btn.p-button-warning) {
  background: linear-gradient(135deg, #f59e0b, #d97706) !important;
  border-color: #d97706 !important;
  color: white !important;
}
:deep(.action-btn.p-button-warning:hover) {
  background: linear-gradient(135deg, #d97706, #b45309) !important;
}

:deep(.action-btn.p-button-success) {
  background: linear-gradient(135deg, #22c55e, #16a34a) !important;
  border-color: #16a34a !important;
  color: white !important;
}
:deep(.action-btn.p-button-success:hover) {
  background: linear-gradient(135deg, #16a34a, #15803d) !important;
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

/* Sound switch */
.sound-switch-wrap {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
}
.sound-icon-on {
  font-size: 1rem;
  color: #10b981;
}
.sound-icon-off {
  font-size: 1rem;
  color: #94a3b8;
}
.sound-label {
  font-size: 0.82rem;
  color: #64748b;
  white-space: nowrap;
}
.sound-state-on {
  font-size: 0.82rem;
  font-weight: 600;
  color: #10b981;
}
.sound-state-off {
  font-size: 0.82rem;
  font-weight: 600;
  color: #94a3b8;
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

/* Slip 80mm styles (only in print) */
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
