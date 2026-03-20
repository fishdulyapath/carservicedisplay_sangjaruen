<script setup>
import { defineComponent } from "@vue/runtime-core";
import { RouterLink } from "vue-router";
import { menus } from "@/api/menu";
import { useApp } from "@/stores/app.js";
import MasterdataService from "@/services/MasterdataService";
import { ref, onMounted } from "vue";
const storeApp = useApp();

const docUpdateCount = ref("0");
const userName = ref(localStorage._usercode);

onMounted(async () => {});

function getDocUpdateCount() {
  MasterdataService.getDocUpdateCount()
    .then((res) => {
      console.log(res);
      if (res.success) {
        if (res.data.length > 0) {
          docUpdateCount.value = res.data[0].count;
          console.log(docUpdateCount.value);
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function checkPermission(data) {
  console.log(data);
  var show = false;

  console.log(localStorage._usercode.toUpperCase());
  if (localStorage._usercode.toUpperCase() != "SUPERADMIN" && localStorage._usercode.toUpperCase() != "PUI") {
    if (data == "status_list" && localStorage.status_list == "1") {
      show = true;
    } else if (data == "stockcard_list" && localStorage.warehouse_list == "1") {
      show = true;
    } else if (data == "stockreport_list" && localStorage.report_list == "1") {
      show = true;
    }  else {
      show = false;
    }
  } else {
    show = true;
  }
  console.log(show);
  return show;
}
</script>
<template>
  <div
    class="bg-gray-900 h-screen flex-shrink-0 static left-0 top-0 z-1 border-gray-800 select-none"
  >
    <div
      id="app-sidebar-11"
      :class="storeApp.showToggle == false ? 'hidden' : ''"
      class="surface-overlay h-screen flex-shrink-0 animation-duration-200 animation-ease-in-out static left-0 top-0 z-1 border-right-1 surface-border select-none"
      style="width: 280px"
    >
      <div class="flex flex-column h-full bg-white">
        <div
          class="flex align-items-center px-5 bg-blue-500 text-white flex-shrink-0"
          style="height: 5vh; font-weight: 600; font-size: 22px"
        >
          <span class="">CarServiceDiaplay</span>
        </div>
        <div class="overflow-y-auto">
          <ul class="list-none p-3 m-0">
            <li>
              <RouterLink
                v-if="checkPermission('status_list')"
                :to="'/statuslist'"
                :class="storeApp.pageActive == 'status_list' ? 'border-gray-300' : ''"
                @click="
                  storeApp.setActivePage('status_list');
                  storeApp.setActiveChild('');
                "
                v-ripple
                class="flex align-items-center cursor-pointer p-3 text-700 border-2 border-transparent hover:border-300 transition-duration-150 transition-colors text-indigo-500 p-ripple"
                style="border-radius: 12px"
              >
                <i class="pi pi-table mr-2"></i>
                <span class="font-medium">สถานะรายการสินค้า</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink
                v-if="checkPermission('stockcard_list')"
                :to="'/stockcardlist'"
                :class="storeApp.pageActive == 'stockcard_list' ? 'border-gray-300' : ''"
                @click="
                  storeApp.setActivePage('stockcard_list');
                  storeApp.setActiveChild('');
                "
                v-ripple
                class="flex align-items-center cursor-pointer p-3 text-700 border-2 border-transparent hover:border-300 transition-duration-150 transition-colors text-indigo-500 p-ripple"
                style="border-radius: 12px"
              >
                <i class="pi pi-list mr-2"></i>
                <span class="font-medium">จัดการรายการสินค้า</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink
                v-if="checkPermission('stockreport_list')"
                :to="'/stockreportlist'"
                :class="
                  storeApp.pageActive == 'stockreport_list' ? 'border-gray-300' : ''
                "
                @click="
                  storeApp.setActivePage('stockreport_list');
                  storeApp.setActiveChild('');
                "
                v-ripple
                class="flex align-items-center cursor-pointer p-3 text-700 border-2 border-transparent hover:border-300 transition-duration-150 transition-colors text-indigo-500 p-ripple"
                style="border-radius: 12px"
              >
                <i class="pi pi-file-o mr-2"></i>
                <span class="font-medium">รายงานความเคลื่อนไหว</span>
              </RouterLink>
            </li>

            <hr
              v-if="
                checkPermission('permission_list') || checkPermission('userbrand_list')
              "
              class="border-top-1 border-none border-indigo-500"
            />
            <li>
              <RouterLink
                v-if="checkPermission('userbrand_list')"
                :to="'/userbrandlist'"
                :class="storeApp.pageActive == 'userbrand_list' ? 'border-gray-300' : ''"
                @click="
                  storeApp.setActivePage('userbrand_list');
                  storeApp.setActiveChild('');
                "
                v-ripple
                class="flex align-items-center cursor-pointer p-3 text-700 border-2 border-transparent hover:border-300 transition-duration-150 transition-colors text-indigo-500 p-ripple"
                style="border-radius: 12px"
              >
                <i class="pi pi-users mr-2"></i>
                <span class="font-medium">ตั้งค่าพนักงาน-คลัง</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink
                v-if="checkPermission('permission_list')"
                :to="'/permissionlist'"
                :class="storeApp.pageActive == 'permission_list' ? 'border-gray-300' : ''"
                @click="
                  storeApp.setActivePage('permission_list');
                  storeApp.setActiveChild('');
                "
                v-ripple
                class="flex align-items-center cursor-pointer p-3 text-700 border-2 border-transparent hover:border-300 transition-duration-150 transition-colors text-indigo-500 p-ripple"
                style="border-radius: 12px"
              >
                <i class="pi pi-users mr-2"></i>
                <span class="font-medium">กำหนดสิทธิ์</span>
              </RouterLink>
            </li>
          </ul>
        </div>
        <div class="mt-auto">
          <hr class="mb-3 mx-3 border-top-1 border-none surface-border" />
          <RouterLink
            to="/logout"
            v-ripple
            class="flex align-items-center cursor-pointer m-4 text-900 border-2 border-transparent transition-duration-150 transition-colors p-ripple"
            style="border-radius: 12px"
          >
            <i class="pi pi-lock mr-2"></i>
            <span class="font-medium">ออกจากระบบ</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "../assets/styles/app/layout.scss";
</style>
