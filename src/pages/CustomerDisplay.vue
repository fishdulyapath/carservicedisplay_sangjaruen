<template>
  <div class="customer-view">
    <!-- AppBar สำหรับชื่อร้าน -->
    <div class="app-bar">
      <div class="app-bar-content">
        <h1 class="app-title">ยานยนต์บริการ</h1>
      </div>
    </div>

    <!-- Customer Information Card -->
    <div class="customer-info-card p-3 mb-3">
      <div class="grid">
        <div class="col-12 mb-2" style="padding-bottom: 0px">
          <h2 class="customer-name m-0">คุณ {{ customer.cust_name || "ไม่พบข้อมูล" }}</h2>
          <div class="customer-id text-gray-600">
            รหัสลูกค้า: {{ customer.cust_code }}
          </div>
        </div>
      </div>
    </div>

    <TabView class="tab-view-container">
      <TabPanel header="รายการปัจจุบัน">
        <div class="current-service p-2">
          <div v-if="currentService.length > 0" class="service-detail">
            <div class="card mb-3">
              <div class="card-header bg-orange-600 text-white p-3">
                <h3 class="m-0">รายละเอียดการให้บริการปัจจุบัน</h3>
              </div>
              <div
                class="card-body p-3"
                v-for="service in currentService"
                :key="service.documentId"
              >
                <div class="grid">
                  <div class="col-12">
                    <ProgressBar
                      :value="calculateProgress(service)"
                      :class="getProgressClass(service.status)"
                    />
                  </div>
                  <div class="col-6">
                    <div class="field mb-2">
                      <label class="text-gray-600">เลขที่เอกสาร</label>
                      <div class="document-id text-lg">
                        {{ service.documentId }}
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="field mb-2">
                      <label class="text-gray-600">สถานะ</label>
                      <div>
                        <span
                          v-if="
                            service.ar_no != '' &&
                            service.is_pay == '1' &&
                            service.balance == '0'
                          "
                        >
                          <Tag class="text-xxl" value="เสร็จสิ้น" severity="success"
                        /></span>
                        <span
                          v-else-if="
                            service.ar_no != '' &&
                            service.is_pay == '1' &&
                            parseFloat(service.balance) > 0
                          "
                        >
                          <Tag class="text-xxl" value="ชำระบางส่วน" severity="warning"
                        /></span>
                        <span v-else-if="service.ar_no != '' && service.is_pay == '-1'">
                          <Tag class="text-xxl" value="รอรับชำระ" severity="danger"
                        /></span>
                        <span v-else-if="service.ar_no != '' && service.is_pay == '0'">
                          <Tag class="text-xxl" value="รอรับชำระ" severity="danger"
                        /></span>
                        <span v-else-if="service.ar_no == '' && service.is_pay == '0'">
                          <Tag
                            class="text-xxl"
                            :value="service.status_name"
                            :severity="getStatusSeverity(service.status)"
                        /></span>
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="field mb-2">
                      <label class="text-gray-600">ทะเบียนรถ</label>
                      <div class="text-lg">{{ service.licensePlate }}</div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="field mb-2">
                      <label class="text-gray-600">รุ่นรถ</label>
                      <div class="text-lg">{{ service.model }}</div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="field mb-2">
                      <label class="text-gray-600">วันที่รับบริการ</label>
                      <div>{{ getThaiDate(service.receiveDate) }}</div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="field mb-2">
                      <label class="text-gray-600">เวลารับบริการ</label>
                      <div>{{ service.receiveTime }}</div>
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="field mb-2">
                      <label class="text-gray-600">บริการ</label>
                      <div class="text-lg">{{ service.service }}</div>
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="field mb-1">
                      <label class="text-gray-600">หมายเหตุ</label>
                      <div class="note-box p-2">
                        {{ service.note || "" }}
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="field mb-2">
                      <label class="text-gray-600">เลขที่บิลขาย</label>
                      <div class="text-lg">{{ service.ar_no }}</div>
                    </div>
                  </div>
                  <div class="col-6" v-if="service.ar_no != ''">
                    <div class="field mb-2">
                      <VueQrcode>{{ service.ar_no }}</VueQrcode>
                    </div>
                  </div>
                  <!--  -->
                </div>

                <h4 class="mb-2 mt-4 text-orange-600">รายการอะไหล่และค่าบริการ</h4>
                <DataTable :value="service.items" responsiveLayout="scroll">
                  <Column field="name" header="รายการ" style="min-width: 180px"></Column>
                  <Column
                    field="qty"
                    header="จำนวน"
                    style="width: 70px"
                    class="text-center"
                  >
                    <template #body="slotProps">
                      {{ Utils.formatNumber(slotProps.data.qty) }}
                    </template>
                  </Column>
                  <Column
                    field="unit"
                    header="หน่วย"
                    style="width: 70px"
                    class="text-center"
                  ></Column>
                  <Column
                    field="price"
                    header="ราคา"
                    style="width: 150px"
                    class="text-right"
                  >
                    <template #body="slotProps">
                      {{ Utils.formatMoney(slotProps.data.price) }}
                    </template>
                  </Column>
                  <Column
                    field="total"
                    header="รวม"
                    style="width: 150px"
                    class="text-right"
                  >
                    <template #body="slotProps">
                      {{ Utils.formatMoney(slotProps.data.price * slotProps.data.qty) }}
                    </template>
                  </Column>
                </DataTable>

                <div class="total-section mt-3 p-3">
                  <div class="flex justify-content-between align-items-center mb-1">
                    <span class="text-md font-medium">ราคารวม:</span>
                    <span class="text-md font-bold">{{
                      Utils.formatMoney(service.total_amount + service.total_discount)
                    }}</span>
                  </div>
                  <div class="flex justify-content-between align-items-center mb-1">
                    <span class="text-md font-medium">ส่วนลด:</span>
                    <span class="text-md font-bold">{{
                      Utils.formatMoney(service.total_discount)
                    }}</span>
                  </div>
                  <div
                    class="flex justify-content-between align-items-center mb-1"
                    v-if="parseFloat(service.balance) > 0"
                  >
                    <span class="text-md font-medium">ชำระบางส่วน:</span>
                    <span class="text-md font-bold">{{
                      Utils.formatMoney(service.total_amount - service.balance)
                    }}</span>
                  </div>

                  <div class="flex justify-content-between align-items-center">
                    <span class="text-lg font-medium">ราคาสุทธิ:</span>
                    <span class="text-xl font-bold text-orange-600">{{
                      Utils.formatMoney(
                        parseFloat(service.balance) > 0
                          ? service.balance
                          : service.total_amount
                      )
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-service text-center p-5">
            <i class="pi pi-info-circle text-5xl text-gray-400 mb-3"></i>
            <h3>ไม่มีรายการให้บริการปัจจุบัน</h3>
          </div>
        </div>
      </TabPanel>

      <TabPanel header="ประวัติการใช้บริการ">
        <div class="history-service p-2">
          <h3 class="mb-3 text-orange-600">ประวัติการใช้บริการ</h3>

          <div v-if="serviceHistory.length > 0">
            <div
              v-for="history in serviceHistory"
              :key="history.documentId"
              class="history-item mb-3 p-3"
              @click="showHistoryDetail(history)"
            >
              <div class="grid">
                <div class="col-6">
                  <div class="field mb-2">
                    <label class="text-gray-600">เลขที่เอกสาร</label>
                    <div class="document-id">{{ history.documentId }}</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="field mb-2">
                    <label class="text-gray-600">วันที่</label>
                    <div>{{ getThaiDate(history.receiveDate) }}</div>
                  </div>
                </div>
                <div class="col-8">
                  <div class="field mb-0">
                    <label class="text-gray-600">บริการ</label>
                    <div>{{ history.service }}</div>
                  </div>
                </div>

                <div class="col-4 flex align-items-end justify-content-end">
                  <Button label="ดูรายละเอียด" class="p-button-sm p-button-outlined" />
                </div>
                <div class="col-12">
                  <div class="field mb-0">
                    สถานะ
                    <span
                      v-if="
                        history.ar_no != '' &&
                        history.is_pay == '1' &&
                        history.balance == '0'
                      "
                      >: <Tag value="เสร็จสิ้น" severity="success"
                    /></span>
                    <span
                      v-else-if="
                        history.ar_no != '' &&
                        history.is_pay == '1' &&
                        history.balance != '0'
                      "
                      >: <Tag value="ชำระบางส่วน" severity="warning"
                    /></span>
                    <span v-else-if="history.ar_no != '' && history.is_pay == '-1'"
                      >: <Tag value="รอรับชำระ" severity="danger"
                    /></span>
                    <span v-else-if="history.ar_no != '' && history.is_pay == '0'"
                      >: <Tag value="รอรับชำระ" severity="danger"
                    /></span>
                    <span v-else-if="history.ar_no == '' && history.is_pay == '0'"
                      >:
                      <Tag
                        :value="history.status_name"
                        :severity="getStatusSeverity(history.status)"
                    /></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-history text-center p-5">
            <i class="pi pi-history text-5xl text-gray-400 mb-3"></i>
            <h3>ไม่มีประวัติการใช้บริการ</h3>
          </div>
        </div>
      </TabPanel>
    </TabView>

    <Dialog
      v-model:visible="displayHistoryDetail"
      header="รายละเอียดการให้บริการ"
      :style="{ width: '90vw' }"
      :modal="true"
      :closable="true"
    >
      <div v-if="selectedHistory" class="history-detail">
        <div class="grid">
          <div class="col-6">
            <div class="field mb-2">
              <label class="text-gray-600">เลขที่เอกสาร</label>
              <div class="document-id text-lg">{{ selectedHistory.documentId }}</div>
            </div>
          </div>
          <div class="col-6">
            <div class="field mb-2">
              <label class="text-gray-600">สถานะ</label>
              <div>
                <span
                  v-if="
                    selectedHistory.ar_no != '' &&
                    selectedHistory.is_pay == '1' &&
                    selectedHistory.balance == '0'
                  "
                >
                  <Tag value="เสร็จสิ้น" severity="success"
                /></span>
                <span
                  v-else-if="
                    selectedHistory.ar_no != '' &&
                    selectedHistory.is_pay == '1' &&
                    selectedHistory.balance != '0'
                  "
                >
                  <Tag value="ชำระบางส่วน" severity="warning"
                /></span>

                <span
                  v-else-if="
                    selectedHistory.ar_no != '' && selectedHistory.is_pay == '-1'
                  "
                  ><Tag value="รอรับชำระ" severity="danger"
                /></span>
                <span
                  v-else-if="selectedHistory.ar_no != '' && selectedHistory.is_pay == '0'"
                  ><Tag value="รอรับชำระ" severity="danger"
                /></span>
                <span
                  v-else-if="selectedHistory.ar_no == '' && selectedHistory.is_pay == '0'"
                >
                  <Tag
                    :value="selectedHistory.status_name"
                    :severity="getStatusSeverity(selectedHistory.status)"
                /></span>
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="field mb-2">
              <label class="text-gray-600">ทะเบียนรถ</label>
              <div class="text-lg">{{ selectedHistory.licensePlate }}</div>
            </div>
          </div>
          <div class="col-6">
            <div class="field mb-2">
              <label class="text-gray-600">รุ่นรถ</label>
              <div class="text-lg">{{ selectedHistory.model }}</div>
            </div>
          </div>
          <div class="col-6">
            <div class="field mb-2">
              <label class="text-gray-600">วันที่รับบริการ</label>
              <div>{{ getThaiDate(selectedHistory.receiveDate) }}</div>
            </div>
          </div>
          <div class="col-6">
            <div class="field mb-2">
              <label class="text-gray-600">เวลารับบริการ</label>
              <div>{{ selectedHistory.receiveTime }}</div>
            </div>
          </div>
          <div class="col-12">
            <div class="field mb-2">
              <label class="text-gray-600">บริการ</label>
              <div class="text-lg">{{ selectedHistory.service }}</div>
            </div>
          </div>
          <div class="col-12">
            <div class="field mb-2">
              <label class="text-gray-600">หมายเหตุ</label>
              <div>
                {{ selectedHistory.note }}
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="field mb-2">
              <label class="text-gray-600">เลขที่บิลขาย</label>
              <div class="text-lg">{{ selectedHistory.ar_no }}</div>
            </div>
          </div>
          <div class="col-6" v-if="selectedHistory.ar_no != ''">
            <div class="field mb-2">
              <VueQrcode>{{ selectedHistory.ar_no }}</VueQrcode>
            </div>
          </div>
        </div>

        <h4 class="mb-2 mt-4 text-orange-600">รายการอะไหล่และค่าบริการ</h4>
        <DataTable :value="selectedHistory.items" responsiveLayout="scroll">
          <Column field="name" header="รายการ" style="min-width: 180px"></Column>
          <Column field="qty" header="จำนวน" style="width: 100px" class="text-center">
            <template #body="slotProps">
              {{ Utils.formatNumber(slotProps.data.qty) }}
            </template>
          </Column>
          <Column field="unit" header="หน่วย" style="width: 100px" class="text-center">
            <template #body="slotProps">
              {{ slotProps.data.unit }}
            </template>
          </Column>
          <Column
            field="price"
            header="ราคา"
            style="width: 150px"
            headerStyle="text-align:center"
            class="text-right"
          >
            <template #body="slotProps">
              {{ Utils.formatMoney(slotProps.data.price) }}
            </template>
          </Column>
          <Column
            field="total"
            header="รวม"
            style="width: 150px"
            headerStyle="text-align:center"
            class="text-right"
          >
            <template #body="slotProps">
              {{ Utils.formatMoney(slotProps.data.price * slotProps.data.qty) }}
            </template>
          </Column>
        </DataTable>

        <div class="total-section mt-3 p-3">
          <div class="flex justify-content-between align-items-center mb-1">
            <span class="text-md font-medium">ราคารวม:</span>
            <span class="text-md font-bold">{{
              Utils.formatMoney(
                selectedHistory.total_amount + selectedHistory.total_discount
              )
            }}</span>
          </div>
          <div class="flex justify-content-between align-items-center mb-1">
            <span class="text-md font-medium">ส่วนลด:</span>
            <span class="text-md font-bold">{{
              Utils.formatMoney(selectedHistory.total_discount)
            }}</span>
          </div>
          <div
            class="flex justify-content-between align-items-center mb-1"
            v-if="parseFloat(selectedHistory.balance) > 0"
          >
            <span class="text-md font-medium">ชำระบางส่วน:</span>
            <span class="text-md font-bold">{{
              Utils.formatMoney(selectedHistory.total_amount - selectedHistory.balance)
            }}</span>
          </div>

          <div class="flex justify-content-between align-items-center">
            <span class="text-lg font-medium">ราคาสุทธิ:</span>
            <span class="text-xl font-bold text-orange-600">{{
              Utils.formatMoney(
                parseFloat(selectedHistory.balance) > 0
                  ? selectedHistory.balance
                  : selectedHistory.total_amount
              )
            }}</span>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tag from "primevue/tag";
import Dialog from "primevue/dialog";
import MasterdataService from "@/services/MasterdataService";
import Utils from "@/utils/";

const route = useRoute();

const customer = ref({});

// ข้อมูลตัวอย่างสำหรับการบริการปัจจุบัน
const currentService = ref([]);

// ข้อมูลตัวอย่างสำหรับประวัติการใช้บริการ
const serviceHistory = ref([]);

// ตัวแปรสำหรับแสดงรายละเอียดประวัติ
const displayHistoryDetail = ref(false);
const selectedHistory = ref(null);
let progressUpdateInterval;
// ฟังก์ชันแสดงรายละเอียดประวัติ
const showHistoryDetail = (history) => {
  selectedHistory.value = history;
  displayHistoryDetail.value = true;
};

// ฟังก์ชันคำนวณราคารวม

// ฟังก์ชันคำนวณราคารวมของประวัติ
const calculateHistoryTotal = () => {
  if (!selectedHistory.value) return 0;
  return selectedHistory.value.total_amount;
};

// ฟังก์ชันจัดรูปแบบสกุลเงิน
const formatCurrency = (value) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(value);
};

const getThaiDate = (data) => {
  if (!data) return "";
  let thaiMonth = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  let date = new Date(data);
  return `${date.getDate()} ${thaiMonth[date.getMonth()]} ${date.getFullYear() + 543}`;
};

// ฟังก์ชันกำหนดสีของ Tag ตามสถานะ
const getStatusSeverity = (status) => {
  switch (status) {
    case "0":
      return "warning";
    case "1":
      return "secondary";
    case "2":
      return "success";

    default:
      return "secondary";
  }
};



const updateProgress = () => {
  // สร้างสำเนาของข้อมูลเพื่อให้ Vue รับรู้ถึงการเปลี่ยนแปลง
  currentService.value = [...currentService.value];
  console.log("ProgressBar updated at:", new Date().toLocaleTimeString());
};



// เพิ่มการทำความสะอาด interval เมื่อ component ถูกทำลาย
onUnmounted(() => {
  // ยกเลิก interval เมื่อ component ถูกทำลาย
  if (progressUpdateInterval) {
    clearInterval(progressUpdateInterval);
  }
});

// ฟังก์ชันคำนวณความคืบหน้า (Progress)
const calculateProgress = (service) => {
  // ตั้งค่าค่าเริ่มต้น countdown เป็น 90 นาที หากไม่มีการระบุ
  const countdown = service.countdown !== undefined ? service.countdown : 90;

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

        // ถ้าเวลาเริ่มต้นอยู่ในอนาคต ให้ปรับเป็นวันก่อนหน้า
        if (startTime > now) {
          startTime.setDate(startTime.getDate() - 1);
        }
      } else {
        // กรณี start_time เป็นรูปแบบวันที่/เวลาปกติ
        startTime = new Date(service.start_time);
      }
    } else {
      // กรณีไม่มี start_time ให้ใช้เวลาปัจจุบัน
      startTime = now;

      // บันทึก start_time ในรูปแบบ 'HH:MM'
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      service.start_time = `${hours}:${minutes}`;
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

// ฟังก์ชันดึงข้อมูลลูกค้าจาก API
const fetchCustomerData = async (customerId) => {
  try {
    var doc_date = Utils.getDateFormatPG(new Date());
    const res = await MasterdataService.getDisplayCustomer(doc_date, customerId);
    if (res.success) {
      currentService.value = [];
      if (res.data.length > 0) {
        console.log(res.data.length);
        res.data.forEach((element) => {
          customer.value = res.data[0];

          if (
            (element.is_pay == "1" && parseFloat(element.balance) > 0) ||
            element.is_pay == "0" ||
            element.is_pay == "-1"
          ) {
            console.log(element.balance);
            currentService.value.push({
              documentId: element.doc_no,
              start_time: element.start_time,
              countdown: element.countdown,
              licensePlate: element.car_code,
              model: element.car_brand,
              note: element.remark,
              receiveDate: element.doc_date,
              receiveTime: element.doc_time,
              service: element.job_name,
              status: element.status,
              ar_no: element.ar_no,
              is_pay: element.is_pay.toString(),
              balance: element.balance,
              status_name: element.status_name,
              total_discount: element.total_discount,
              discount_word: element.discount_word,
              total_amount: element.total_amount,
              items: element.details.map((item) => {
                return {
                  name: item.item_name,
                  qty: item.qty,
                  unit: item.unit_name,
                  price: item.price,
                };
              }),
            });
          }
        });

        console.log("customer.value", customer.value);
      }

      console.log(currentService.value);
    }

    const history = await MasterdataService.getDisplayHistory(doc_date, customerId);
    if (history.success) {
      serviceHistory.value = [];
      if (history.data.length > 0) {
        console.log(history.data);
        history.data.forEach((ele) => {
          serviceHistory.value.push({
            documentId: ele.doc_no,
            licensePlate: ele.car_code,
            model: ele.car_brand,
            service: ele.job_name,
            status: ele.status,
            receiveDate: ele.doc_date,
            receiveTime: ele.doc_time,
            status_name: ele.status_name,
            total_discount: ele.total_discount,
            discount_word: ele.discount_word,
            total_amount: ele.total_amount,
            balance: ele.balance,
            ar_no: ele.ar_no,
            is_pay: ele.is_pay,
            note: ele.remark,
            items: ele.details.map((item) => {
              return {
                name: item.item_name,
                qty: item.qty,
                unit: item.unit_name,
                price: item.price,
              };
            }),
          });
        });

        console.log(serviceHistory.value);
      }
    }
  } catch (error) {
    console.error("Error fetching customer data:", error);
  }
};

// เรียกใช้ onMounted hook เพื่อดึงข้อมูลลูกค้าเมื่อ component ถูกโหลด
onMounted(() => {
  // ดึง ID จาก route params
  const customerId = route.params.id || "C001"; // ใช้ค่าเริ่มต้นถ้าไม่มี param

  // เรียกฟังก์ชันดึงข้อมูลลูกค้า
  fetchCustomerData(customerId);

  progressUpdateInterval = setInterval(updateProgress, 1000);
});
</script>

<style scoped>
.customer-view {
  font-family: "Prompt", "Sarabun", sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* สไตล์สำหรับ AppBar */
.app-bar {
  background-color: #e84c10;
  color: white;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-bar-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.customer-info-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #e84c10;
  margin-top: 16px;
}

.customer-name {
  color: #333;
  font-size: 1.3rem;
}

.customer-id {
  font-family: "Courier New", monospace;
  font-weight: bold;
  font-size: 1rem;
}

.tab-view-container {
  height: calc(100vh - 140px); /* ปรับความสูงให้พอดีกับการเพิ่ม AppBar */
}

.document-id {
  font-family: "Courier New", monospace;
  font-weight: bold;
  color: #e84c10;
}

.note-box {
  min-height: 60px;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.total-section {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.history-item {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.history-item:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  border-color: #e84c10;
}

/* ปรับแต่ง PrimeVue Components */
:deep(.p-tabview-nav) {
  background-color: white;
  border-bottom: 2px solid #e84c10;
}

:deep(.p-tabview-nav li.p-highlight .p-tabview-nav-link) {
  color: #e84c10;
  border-color: #e84c10;
}

:deep(.p-tabview-panels) {
  padding: 0;
}

:deep(.p-datatable-thead th) {
  background-color: #f4f4f4;
  border-bottom: 2px solid #e84c10;
}

:deep(.p-button.p-button-outlined) {
  color: #e84c10;
  border-color: #e84c10;
}

:deep(.p-button.p-button-outlined:hover) {
  background: rgba(232, 76, 16, 0.1);
  color: #e84c10;
  border-color: #e84c10;
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

/* Mobile Optimization */
@media screen and (max-width: 768px) {
  .app-title {
    font-size: 1.3rem;
  }

  .document-id {
    font-size: 1rem;
  }

  :deep(.p-datatable-thead th) {
    padding: 0.5rem;
  }

  :deep(.p-datatable-tbody td) {
    padding: 0.5rem;
  }

  .note-box {
    min-height: 40px;
  }
}
</style>
