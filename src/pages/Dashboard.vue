<template>
  <div class="car-service-display">
    <div class="header p-4 bg-orange-600 text-white flex align-items-center justify-content-between">
      <div class="logo">
        <h1>บริการศูนย์รถยนต์</h1>
      </div>
      <div class="right-section flex align-items-center">
        <Button
          icon="pi pi-desktop"
          class="fullscreen-btn p-button-rounded p-button-text p-button-lg text-white"
          @click="toggleFullScreen"
          :aria-label="isFullScreen ? 'ออกจากโหมดเต็มจอ' : 'แสดงแบบเต็มจอ'"
          v-tooltip.bottom="isFullScreen ? 'ออกจากโหมดเต็มจอ' : 'แสดงแบบเต็มจอ'"
        />
        <div class="current-time text-2xl ml-3">
          {{ currentTime }}
        </div>
      </div>
    </div>

    <div class="content-container">
      <div class="service-status p-3">
        <h2 class="text-xl mb-3 text-orange-600">สถานะการให้บริการ</h2>

        <DataTable :value="visibleServices" :rows="itemsPerPage" class="p-datatable-lg" stripedRows :rowHover="true" responsiveLayout="scroll">
          <Column field="doc_no" header="เลขที่" style="width: 20%">
            <template #body="slotProps">
              <span class="font-bold text-xxl">{{ slotProps.data.doc_no }}</span>
            </template>
          </Column>
          <Column field="cust_name" header="ลูกค้า" style="width: 20%" class="text-xxl">
            <template #body="slotProps">
              <span class="text-xxl">{{ slotProps.data.cust_name }}</span>
            </template>
          </Column>
          <Column field="car_code" header="ทะเบียนรถ" style="width: 15%">
            <template #body="slotProps">
              <span class="font-bold text-xxl">{{ slotProps.data.car_code }}</span>
            </template>
          </Column>
          <Column field="emp_name" header="ผู้ดำเนินการ" style="width: 20%" class="text-xxl">
            <template #body="slotProps">
              <span class="text-xxl">{{ slotProps.data.emp_name }}</span>
            </template>
          </Column>

          <Column field="status" header="สถานะ" style="width: 20%" class="text-xxl">
            <template #body="slotProps">
              <Tag class="text-xxl" :value="getStatusText(slotProps.data.status)" :severity="getStatusSeverity(slotProps.data.status)" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

// Components from PrimeVue
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ProgressBar from "primevue/progressbar";
import Tag from "primevue/tag";
import Button from "primevue/button";
import Tooltip from "primevue/tooltip";
import MasterdataService from "@/services/MasterdataService";
import Utils from "@/utils/";

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
  var doc_date = Utils.getDateFormatPG(new Date());
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

// อัพเดตข้อมูลทุก 30 วินาที และเลื่อนหน้าทุก 30 วินาที
const updateServices = async () => {
  const services = await processServiceData();
  const totalPages = Math.ceil(services.length / itemsPerPage);

  // แสดงข้อมูลที่คำนวณใหม่ทุกครั้ง
  visibleServices.value = services.slice(currentIndex.value * itemsPerPage, (currentIndex.value + 1) * itemsPerPage).map((service) => {
    // คำนวณค่า progress สำหรับแต่ละรายการ
    const progress = calculateProgress(service);
    return {
      ...service,
      progress: progress,
    };
  });

  // เลื่อนไปหน้าถัดไป หรือกลับไปหน้าแรก
  currentIndex.value = (currentIndex.value + 1) % totalPages;
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
      return "secondary";
    case "in-progress":
      return "warning";
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
      return "เสร็จแล้ว";
    default:
      return "ไม่ทราบสถานะ";
  }
};

// ตัวแปรสำหรับจัดการ interval
let serviceUpdateInterval;
let currentTimeInterval;
let pageRotationInterval;
let progressUpdateInterval; // เพิ่ม interval สำหรับอัพเดต progress

onMounted(() => {
  // อัพเดตเวลาทุกวินาที
  updateCurrentTime();
  currentTimeInterval = setInterval(updateCurrentTime, 1000);

  // อัพเดตสถานะบริการทุก 30 วินาที
  updateServices();
  serviceUpdateInterval = setInterval(updateServices, 30000);

  // เลื่อนหน้าทุก 5 วินาที
  pageRotationInterval = setInterval(() => {
    updateServices();
  }, 5000);

  // อัพเดต progress bar ทุก 1 นาที
  progressUpdateInterval = setInterval(() => {
    // คำนวณความคืบหน้าใหม่สำหรับทุกรายการ
    visibleServices.value = visibleServices.value.map((service) => {
      // คำนวณค่า progress ใหม่
      const progress = calculateProgress(service);
      return {
        ...service,
        progress: progress,
      };
    });
  }, 30000);

  // เพิ่ม event listener สำหรับการตรวจจับการเปลี่ยนแปลงโหมดเต็มจอ
  document.addEventListener("fullscreenchange", handleFullScreenChange);
});

onUnmounted(() => {
  clearInterval(currentTimeInterval);
  clearInterval(serviceUpdateInterval);
  clearInterval(pageRotationInterval);
  clearInterval(progressUpdateInterval); // ลบ interval เมื่อ component ถูกทำลาย

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
  background-color: #f8f9fa;
}

.content-container {
  flex: 1;
  overflow: hidden;
  padding: 1rem;
}

.header {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.right-section {
  display: flex;
  align-items: center;
}

.fullscreen-btn {
  color: white !important;
  margin-right: 10px;
  transition: transform 0.2s;
}

.fullscreen-btn:hover {
  transform: scale(1.1);
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.service-status {
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  height: calc(100vh - 120px);
  overflow: auto;
  border: 1px solid #e0e0e0;
}

/* ปรับแต่งสีของตาราง */
:deep(.p-datatable-thead) {
  background-color: #f4f4f4;
}

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

/* ปรับแต่งรูปแบบเลขที่เอกสาร */
.document-id {
  font-family: "Courier New", monospace;
  font-weight: bold;
  color: #555;
  letter-spacing: 0.5px;
}

/* ปรับแต่ง Tag สถานะ */
:deep(.p-tag.p-tag-warning) {
  background-color: #e84c10;
  color: white;
}

:deep(.p-tag.p-tag-secondary) {
  background-color: #666666;
  color: white;
}

/* ปรับแต่ง ProgressBar */
:deep(.p-progressbar) {
  height: 20px;
  border-radius: 10px;
  margin-bottom: 8px;
}

:deep(.waiting-progress .p-progressbar-value) {
  background-color: #666666;
}

:deep(.in-progress .p-progressbar-value) {
  background-color: #e84c10;
}

:deep(.completed-progress .p-progressbar-value) {
  background-color: #22c55e;
}

.progress-text {
  display: inline-block;
  margin-left: 10px;
  font-weight: bold;
}

/* เพิ่มสำหรับทำให้หน้าจอดูแบบ TV Display ขนาดใหญ่ */
@media (min-width: 1200px) {
  .car-service-display {
    font-size: 1.2rem;
  }

  .text-xl {
    font-size: 3rem;
  }

  .text-xxl {
    font-size: 36px !important;
  }

  :deep(.p-progressbar) {
    height: 30px;
  }
}

/* สไตล์เพิ่มเติมสำหรับโหมดเต็มจอ */
:fullscreen .car-service-display {
  background-color: #f8f9fa;
}

:fullscreen .service-status {
  height: calc(100vh - 140px);
}
</style>
