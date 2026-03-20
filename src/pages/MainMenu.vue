<template>
  <div class="main-menu-page">
    <div class="menu-header">
      <h1><i class="pi pi-th-large mr-2"></i>เมนูหลัก</h1>
    </div>
    <div class="menu-container">
      <div class="menu-card" @click="router.push({ name: 'status_manage' })">
        <div class="menu-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
          <i class="pi pi-cog" style="font-size: 2.5rem; color: #fff"></i>
        </div>
        <div class="menu-info">
          <h2>จัดการสถานะ</h2>
          <p>จัดการสถานะเอกสาร รับงาน ปิดงาน เสร็จงาน</p>
        </div>
        <i class="pi pi-chevron-right menu-arrow"></i>
      </div>

      <div class="menu-card" @click="router.push({ name: 'summary_report' })">
        <div class="menu-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
          <i class="pi pi-chart-bar" style="font-size: 2.5rem; color: #fff"></i>
        </div>
        <div class="menu-info">
          <h2>สรุปผลการดำเนินการ</h2>
          <p>ดูประวัติการดำเนินการของเอกสารทั้งหมด</p>
        </div>
        <i class="pi pi-chevron-right menu-arrow"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<style scoped>
.main-menu-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.menu-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.menu-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  font-weight: 700;
}

.menu-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.menu-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.menu-icon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-info {
  flex: 1;
}

.menu-info h2 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin: 0 0 0.3rem 0;
  font-weight: 600;
}

.menu-info p {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0;
}

.menu-arrow {
  color: #bdc3c7;
  font-size: 1.2rem;
}
</style>
