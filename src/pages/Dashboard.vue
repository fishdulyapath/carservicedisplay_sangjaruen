<template>
  <div class="car-service-display">
    <!-- Header -->
    <div class="header">
      <div class="header-inner">
        <div class="logo flex align-items-center gap-3">
          <h1>สถานะการจัดส่ง</h1>
        </div>        <div class="right-section flex align-items-center gap-3">
          <div class="date-picker-section">
            <i class="pi pi-calendar"></i>
            <Calendar
              v-model="selectedDate"
              dateFormat="dd/mm/yy"
              :showIcon="false"
              :manualInput="false"
              class="header-calendar"
              @date-select="onDateChange"
            />
          </div>
          <Button
            icon="pi pi-desktop"
            class="fullscreen-btn p-button-rounded p-button-text p-button-lg"
            @click="toggleFullScreen"
            :aria-label="isFullScreen ? 'ออกจากโหมดเต็มจอ' : 'แสดงแบบเต็มจอ'"
            v-tooltip.bottom="isFullScreen ? 'ออกจากโหมดเต็มจอ' : 'แสดงแบบเต็มจอ'"
          />
          <div class="current-time"><i class="pi pi-clock mr-2"></i>{{ currentTime }}</div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="content-container">
      <div class="service-status">
        <div class="table-header flex align-items-center justify-content-between mb-3 px-3 pt-3">
          <h2 class="section-title"><i class="pi pi-wrench mr-2"></i>{{ allServices.length }} รายการ</h2>
          <div class="page-indicator">หน้า {{ currentIndex + 1 }} / {{ totalPages }}</div>
        </div>

        <DataTable :value="visibleServices" :rows="itemsPerPage" class="service-table" stripedRows :rowHover="true" responsiveLayout="scroll">
          <Column header="ลำดับ" style="width: 8%" class="text-center">
            <template #body="slotProps">
              <div class="row-number">{{ slotProps.index + 1 + currentIndex * itemsPerPage }}</div>
            </template>
          </Column>

          <Column field="doc_no" header="เลขที่เอกสาร" style="width: 18%">
            <template #body="slotProps">
              <div class="doc-no-cell">
                <span class="doc-no-text">{{ slotProps.data.doc_no }}</span>
              </div>
            </template>
          </Column>


          <Column field="doc_date" header="วันที่/เวลา" style="width: 18%">
            <template #body="slotProps">
              <div class="doc-date-cell">
                <span class="doc-date-text">{{ slotProps.data.doc_date }}</span>
                <small class="doc-time-text">{{ slotProps.data.doc_time }} น.</small>
              </div>
            </template>
          </Column>

          <Column field="cust_name" header="ลูกค้า" style="width: 22%">
            <template #body="slotProps">
              <div class="cust-cell">
                <div class="cust-name">{{ slotProps.data.cust_name }}</div>
                <div class="car-brand-sub" v-if="slotProps.data.car_brand">
                  {{ slotProps.data.car_brand }}
                </div>
              </div>
            </template>
          </Column>

          <Column field="car_code" header="ทะเบียนรถ" style="width: 17%">
            <template #body="slotProps">
              <div class="car-plate">
                <span>{{ slotProps.data.car_code }}</span>
              </div>
            </template>
          </Column>

          <Column field="emp_open_job" header="ผู้ดำเนินการ" style="width: 17%">
            <template #body="slotProps">
              <div class="emp-cell">
                <template v-if="slotProps.data.emp_open_job && slotProps.data.status == 'in-progress'">
                  <i class="pi pi-user mr-2"></i>
                  <span>{{ slotProps.data.emp_open_job }}</span>
                </template>
                <template v-else-if="slotProps.data.emp_close_job && slotProps.data.status == 'completed'">
                  <i class="pi pi-user mr-2"></i>
                  <span>{{ slotProps.data.emp_close_job }}</span>
                </template>
                <span v-else class="no-emp">— รอมอบหมาย —</span>
              </div>
            </template>
          </Column>

          <Column field="status" header="สถานะ" style="width: 18%">
            <template #body="slotProps">
              <Tag class="status-tag" :value="getStatusText(slotProps.data.status)" :severity="getStatusSeverity(slotProps.data.status)" :icon="getStatusIcon(slotProps.data.status)" />
            </template>
          </Column>

          <Column field="remark" header="หมายเหตุ" style="width: 22%">
            <template #body="slotProps">
              <div class="remark-cell">
                <span>{{ slotProps.data.remark }}</span>
              </div>
            </template>
          </Column>

        </DataTable>

        <!-- Empty state -->
        <div v-if="visibleServices.length === 0" class="empty-state">
          <i class="pi pi-inbox"></i>
          <p>ไม่มีรายการบริการในขณะนี้</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <span>ข้อมูลอัพเดตอัตโนมัติทุก 30 วินาที</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";

// Components from PrimeVue
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import Button from "primevue/button";
import Calendar from "primevue/calendar";
import Tooltip from "primevue/tooltip";
import MasterdataService from "@/services/MasterdataService";
import Utils from "@/utils/";

// วันที่ที่เลือก
const selectedDate = ref(new Date());

// เมื่อเปลี่ยนวันที่
const onDateChange = () => {
  currentIndex.value = 0;
  fetchServiceData();
};

// ตัวแปรสำหรับจัดการโหมดเต็มจอ
const isFullScreen = ref(false);

// ฟังก์ชันสำหรับการเปิด/ปิดโหมดเต็มจอ
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    // ถ้ายังไม่ได้เปิดโหมดเต็มจอ ให้เปิด
    document.documentElement
      .requestFullscreen()
      .then(() => {
        isFullScreen.value = true;
      })
      .catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
  } else {
    // ถ้าเปิดโหมดเต็มจออยู่แล้ว ให้ปิด
    if (document.exitFullscreen) {
      document
        .exitFullscreen()
        .then(() => {
          isFullScreen.value = false;
        })
        .catch((err) => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
    }
  }
};

// เพิ่ม event listener สำหรับการตรวจจับการเปลี่ยนแปลงโหมดเต็มจอ
const handleFullScreenChange = () => {
  isFullScreen.value = !!document.fullscreenElement;
};

// Mock data for service status
const allServices = ref([]);

// ฟังก์ชันคำนวณความคืบหน้า (Progress)
const calculateProgress = (service) => {
  // ตั้งค่าค่าเริ่มต้น countdown เป็น 90 นาที หากไม่มีการระบุ
  const countdown = service.countdown !== undefined ? service.countdown : 3;

  // เงื่อนไขที่ 1: ถ้าสถานะเป็น "รอดำเนินการ" (status = "0") ให้แสดง 25%
  if (service.status === "0") {
    return 10;
  }

  // เงื่อนไขที่ 3: ถ้าสถานะเป็น "เสร็จ" (status = "2") ให้แสดง 100%
  if (service.status === "2") {
    return 100;
  }

  // เงื่อนไขที่ 2: กำลังดำเนินการ (status = "1") ให้คำนวณจาก countdown
  if (service.status === "1") {
    // คำนวณเวลาที่ผ่านไป (นาที)
    const now = new Date();
    let startTime;

    // ตรวจสอบรูปแบบของ start_time
    if (service.start_time) {
      if (typeof service.start_time === "string" && service.start_time.includes(":")) {
        // กรณี start_time เป็นรูปแบบ 'HH:MM' (เช่น '14:30')
        const [hours, minutes] = service.start_time.split(":").map(Number);
        startTime = new Date();
        startTime.setHours(hours, minutes, 0, 0);
      } else {
        // กรณี start_time เป็นรูปแบบวันที่/เวลาปกติ
        startTime = new Date(service.start_time);
      }
    } else {
      // กรณีไม่มี start_time ให้ใช้เวลาปัจจุบัน
      startTime = now;
    }

    // ตรวจสอบความถูกต้องของ startTime
    if (isNaN(startTime.getTime())) {
      console.error("Invalid start_time:", service.start_time);
      startTime = now;
    }

    // คำนวณเวลาที่ผ่านไป (นาที)
    const elapsedMinutes = Math.floor((now - startTime) / (1000 * 60));

    // คำนวณเปอร์เซ็นต์ของเวลาที่ผ่านไป
    let percentComplete = Math.floor(25 + (elapsedMinutes / countdown) * 50);

    // จำกัดค่าไม่ให้เกิน 75%
    return Math.min(percentComplete, 75);
  }

  // กรณีอื่นๆ ให้แสดง 0%
  return 0;
};

// ฟังก์ชันกำหนด Class ของ ProgressBar ตามสถานะ
const getProgressClass = (status) => {
  switch (status) {
    case "0": // รอดำเนินการ
      return "waiting-progress";
    case "1": // กำลังดำเนินการ
      return "in-progress";
    case "2": // เสร็จแล้ว
      return "completed-progress";
    default:
      return "";
  }
};

// ไม่ต้องคำนวณเวลาที่เหลือแล้ว เนื่องจากไม่มีการแสดงเวลาแล้ว
const processServiceData = async () => {
  var doc_date = Utils.getDateFormatPG(selectedDate.value);
  try {
    const res = await MasterdataService.getDisplayMain(doc_date);
    if (res.success) {
      // เพิ่ม countdown และ start_time ถ้าไม่มี
      allServices.value = res.data.map((service) => {
        // ตั้งค่า countdown เป็น 90 นาทีหากไม่มีการระบุ
        if (service.countdown === undefined) {
          service.countdown = 90;
        }

        // ตรวจสอบสถานะและ start_time
        if (service.status === "1" && !service.start_time) {
          // ถ้าไม่มี start_time แต่สถานะเป็นกำลังดำเนินการ ให้ตั้งค่าเวลาปัจจุบัน
          const now = new Date();
          // เก็บเวลาในรูปแบบ 'HH:MM'
          service.start_time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
        }

        return service;
      });
    }
    return allServices.value;
  } catch (err) {
    console.log(err);
    return allServices.value;
  }
};

// ข้อมูลที่จะแสดงบนหน้าจอปัจจุบัน
const currentIndex = ref(0);
const itemsPerPage = 10;
const visibleServices = ref([]);
const totalPages = computed(() => Math.max(1, Math.ceil(allServices.value.length / itemsPerPage)));

// อัพเดตหน้าที่แสดงจากข้อมูลที่มีอยู่ (ไม่เรียก API)
const updateVisiblePage = () => {
  const services = allServices.value;
  if (services.length === 0) {
    visibleServices.value = [];
    return;
  }

  const pages = totalPages.value;
  // ป้องกัน index เกินจำนวนหน้า
  if (currentIndex.value >= pages) {
    currentIndex.value = 0;
  }

  visibleServices.value = services.slice(currentIndex.value * itemsPerPage, (currentIndex.value + 1) * itemsPerPage);
};

// ดึงข้อมูลจาก API
const fetchServiceData = async () => {
  await processServiceData();
  updateVisiblePage();
};

// เลื่อนหน้าถัดไป
const rotatePage = () => {
  const pages = totalPages.value;
  currentIndex.value = (currentIndex.value + 1) % pages;
  updateVisiblePage();
};

// แสดงเวลาปัจจุบัน
const currentTime = ref("");
const updateCurrentTime = () => {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  currentTime.value = now.toLocaleString("th-TH", options);
};

// ฟังก์ชันช่วยในการกำหนดสี Tag ตามสถานะ
const getStatusSeverity = (status) => {
  switch (status) {
    case "pending":
      return "warning";
    case "in-progress":
      return "info";
    case "completed":
      return "success";
    default:
      return "secondary";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "pending":
      return "รอดำเนินการ";
    case "in-progress":
      return "กำลังดำเนินการ";
    case "completed":
      return "จัดเสร็จแล้ว";
    default:
      return "ไม่ทราบสถานะ";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "pending":
      return "pi pi-clock";
    case "in-progress":
      return "pi pi-spin pi-cog";
    case "completed":
      return "pi pi-check-circle";
    default:
      return "pi pi-question-circle";
  }
};

// ตัวแปรสำหรับจัดการ interval
let serviceUpdateInterval;
let currentTimeInterval;
let pageRotationInterval;

onMounted(() => {
  // อัพเดตเวลาทุกวินาที
  updateCurrentTime();
  currentTimeInterval = setInterval(updateCurrentTime, 1000);

  // ดึงข้อมูลจาก API ครั้งแรก และทุก 30 วินาที
  fetchServiceData();
  serviceUpdateInterval = setInterval(fetchServiceData, 30000);

  // เลื่อนหน้าอัตโนมัติทุก 8 วินาที (ไม่เรียก API ซ้ำ)
  pageRotationInterval = setInterval(rotatePage, 8000);

  // เพิ่ม event listener สำหรับการตรวจจับการเปลี่ยนแปลงโหมดเต็มจอ
  document.addEventListener("fullscreenchange", handleFullScreenChange);
});

onUnmounted(() => {
  clearInterval(currentTimeInterval);
  clearInterval(serviceUpdateInterval);
  clearInterval(pageRotationInterval);

  // ลบ event listener เมื่อ component ถูกทำลาย
  document.removeEventListener("fullscreenchange", handleFullScreenChange);
});
</script>

<style scoped>
.car-service-display {
  font-family: "Prompt", "Sarabun", sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

/* ===== Header ===== */
.header {
  background: linear-gradient(135deg, #e84c10 0%, #d4400a 50%, #c0370a 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(232, 76, 16, 0.3);
  position: relative;
  z-index: 10;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
}

.logo h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.logo i {
  opacity: 0.9;
}

.right-section {
  display: flex;
  align-items: center;
}

.service-count-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 2rem;
  padding: 0.4rem 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.current-time {
  font-size: 1.3rem;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.15);
  padding: 0.5rem 1.2rem;
  border-radius: 2rem;
  letter-spacing: 0.5px;
}

.fullscreen-btn {
  color: white !important;
  transition: all 0.3s ease;
}

.fullscreen-btn:hover {
  transform: scale(1.15);
  background-color: rgba(255, 255, 255, 0.15) !important;
}

/* Date Picker in Header */
.date-picker-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 2rem;
  padding: 0.3rem 0.5rem 0.3rem 1rem;
  backdrop-filter: blur(4px);
  color: white;
}

.date-picker-section > i {
  font-size: 1.1rem;
  opacity: 0.9;
}

:deep(.header-calendar .p-inputtext) {
  background: transparent !important;
  border: none !important;
  color: white !important;
  font-size: 1.2rem;
  font-weight: 600;
  padding: 0.3rem 0.5rem;
  width: 140px;
  text-align: center;
  cursor: pointer;
  box-shadow: none !important;
}

:deep(.header-calendar .p-inputtext::placeholder) {
  color: rgba(255, 255, 255, 0.7);
}

:deep(.header-calendar .p-inputtext:focus) {
  box-shadow: none !important;
}

/* ===== Content ===== */
.content-container {
  flex: 1;
  overflow: hidden;
  padding: 1.5rem;
}

.service-status {
  background: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  height: calc(100vh - 150px);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.section-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: #e84c10;
  display: flex;
  align-items: center;
}

.section-title i {
  font-size: 1.4rem;
}

.page-indicator {
  background: linear-gradient(135deg, #e84c10, #ff6b35);
  color: white;
  padding: 0.4rem 1.2rem;
  border-radius: 2rem;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* ===== Table Styles ===== */
:deep(.service-table .p-datatable-thead th) {
  background: linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%);
  color: #333;
  font-weight: 700;
  font-size: 1.3rem;
  padding: 1rem 1.2rem;
  border-bottom: 3px solid #e84c10;
  border-top: none;
  text-align: left;
}

:deep(.service-table .p-datatable-tbody > tr) {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.service-table .p-datatable-tbody > tr > td) {
  padding: 1rem 1.2rem;
  font-size: 1.25rem;
  vertical-align: middle;
}

:deep(.service-table .p-datatable-tbody > tr:nth-child(even)) {
  background-color: #fafbfc;
}

:deep(.service-table .p-datatable-tbody > tr:hover) {
  background-color: #fff5f0 !important;
  transform: scale(1.002);
  box-shadow: 0 2px 8px rgba(232, 76, 16, 0.08);
}

/* Row Number */
.row-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #e84c10, #ff6b35);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 1.2rem;
  box-shadow: 0 2px 8px rgba(232, 76, 16, 0.3);
}

/* Document Date/Time */
.doc-date-cell {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}

.doc-date-text {
  font-weight: 600;
  color: #333;
}

.doc-time-text {
  color: #888;
  margin-top: 2px;
}

/* Document Number */
.doc-no-cell {
  display: flex;
  align-items: center;
}

.doc-no-text {
  font-family: "JetBrains Mono", "Fira Code", "Courier New", monospace;
  font-weight: 700;
  font-size: 1.15rem;
  color: #333;
  letter-spacing: 0.3px;
}

/* Customer */
.cust-cell {
  line-height: 1.4;
}

.cust-name {
  font-weight: 600;
  font-size: 1.2rem;
  color: #222;
}

.car-brand-sub {
  font-size: 0.95rem;
  color: #888;
  margin-top: 2px;
}

/* Car Plate */
.car-plate {
  display: inline-flex;
  align-items: center;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  font-weight: 700;
  font-size: 1.15rem;
  color: #333;
  letter-spacing: 0.5px;
}

.car-plate i {
  color: #e84c10;
}

/* Employee */
.emp-cell {
  display: flex;
  align-items: center;
  font-size: 1.15rem;
  color: #444;
}

.emp-cell i {
  color: #e84c10;
}

.no-emp {
  color: #bbb;
  font-style: italic;
  font-size: 1rem;
}

/* Status Tag */
:deep(.status-tag) {
  font-size: 1.15rem !important;
  padding: 0.5rem 1.2rem !important;
  border-radius: 2rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.3px;
}

:deep(.p-tag.p-tag-warning) {
  background: linear-gradient(135deg, #f59e0b, #d97706) !important;
  color: white;
}

:deep(.p-tag.p-tag-info) {
  background: linear-gradient(135deg, #e84c10, #ff6b35) !important;
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

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #bbb;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.4rem;
  margin: 0;
}

/* ===== Footer ===== */
.footer {
  text-align: center;
  padding: 0.6rem;
  background: #f0f0f0;
  color: #999;
  font-size: 0.9rem;
  border-top: 1px solid #e0e0e0;
}

/* ===== TV Display (Large Screen) ===== */
@media (min-width: 1200px) {
  .logo h1 {
    font-size: 2.4rem;
  }

  .section-title {
    font-size: 2rem;
  }

  :deep(.service-table .p-datatable-thead th) {
    font-size: 1.6rem;
    padding: 1.2rem 1.5rem;
  }

  :deep(.service-table .p-datatable-tbody > tr > td) {
    padding: 1.2rem 1.5rem;
    font-size: 1.5rem;
  }

  .row-number {
    width: 52px;
    height: 52px;
    font-size: 1.5rem;
  }

  .doc-no-text {
    font-size: 1.4rem;
  }

  .cust-name {
    font-size: 1.5rem;
  }

  .car-plate {
    font-size: 1.4rem;
    padding: 0.5rem 1rem;
  }

  .emp-cell {
    font-size: 1.4rem;
  }

  :deep(.status-tag) {
    font-size: 1.4rem !important;
    padding: 0.6rem 1.5rem !important;
  }

  .current-time {
    font-size: 1.5rem;
  }

  .service-count-badge {
    font-size: 1.3rem;
  }

  .page-indicator {
    font-size: 1.2rem;
  }
}

@media (min-width: 1600px) {
  :deep(.service-table .p-datatable-thead th) {
    font-size: 1.8rem;
  }

  :deep(.service-table .p-datatable-tbody > tr > td) {
    font-size: 1.7rem;
    padding: 1.4rem 1.8rem;
  }

  .row-number {
    width: 60px;
    height: 60px;
    font-size: 1.7rem;
  }

  .doc-no-text,
  .cust-name,
  .car-plate span,
  .emp-cell span {
    font-size: 1.6rem;
  }

  :deep(.status-tag) {
    font-size: 1.6rem !important;
    padding: 0.7rem 1.8rem !important;
  }
}

/* ===== Fullscreen Mode ===== */
:fullscreen .car-service-display {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

:fullscreen .service-status {
  height: calc(100vh - 160px);
}

/* ===== Animation ===== */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.service-table .p-datatable-tbody > tr) {
  animation: fadeIn 0.3s ease-out;
}
</style>
