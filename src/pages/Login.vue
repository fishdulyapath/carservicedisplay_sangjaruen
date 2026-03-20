<template>
  <div class="login-page">
    <Toast />
    <div class="login-container">
      <!-- Logo / Header -->
      <div class="login-header">
        <div class="login-icon">
          <i class="pi pi-car" style="font-size: 2.5rem"></i>
        </div>
        <h1>Car Service</h1>
        <p class="login-subtitle">ระบบจัดการงานบริการรถยนต์</p>
      </div>

      <!-- Login Form -->
      <div class="login-form">
        <div class="field">
          <label for="usercode"><i class="pi pi-user mr-1"></i>รหัสผู้ใช้</label>
          <InputText
            id="usercode"
            v-model="userCode"
            placeholder="กรอกรหัสผู้ใช้"
            class="w-full"
            @keyup.enter="doLogin"
            :disabled="loading"
            autofocus
          />
        </div>

        <div class="field">
          <label for="password"><i class="pi pi-lock mr-1"></i>รหัสผ่าน</label>
          <Password
            id="password"
            v-model="password"
            placeholder="กรอกรหัสผ่าน"
            class="w-full"
            :feedback="false"
            toggleMask
            inputClass="w-full"
            @keyup.enter="doLogin"
            :disabled="loading"
          />
        </div>

        <div class="error-msg" v-if="errorMsg">
          <i class="pi pi-exclamation-circle mr-1"></i>{{ errorMsg }}
        </div>

        <Button
          label="เข้าสู่ระบบ"
          icon="pi pi-sign-in"
          class="p-button-lg w-full login-btn"
          :loading="loading"
          @click="doLogin"
        />
      </div>

      <!-- Footer -->
      <div class="login-footer">
        <small>© 2026 Car Service Management System</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useAuthen } from "@/stores/authen";

const router = useRouter();
const toast = useToast();
const authenStore = useAuthen();

const userCode = ref("");
const password = ref("");
const loading = ref(false);
const errorMsg = ref("");

const doLogin = async () => {
  errorMsg.value = "";

  if (!userCode.value.trim()) {
    errorMsg.value = "กรุณากรอกรหัสผู้ใช้";
    return;
  }
  if (!password.value.trim()) {
    errorMsg.value = "กรุณากรอกรหัสผ่าน";
    return;
  }

  loading.value = true;
  try {
    await authenStore.login(userCode.value.trim(), password.value.trim());

    if (authenStore.loginSuccess) {
      toast.add({
        severity: "success",
        summary: "เข้าสู่ระบบสำเร็จ",
        detail: `ยินดีต้อนรับ ${authenStore.userName}`,
        life: 2000,
      });
      setTimeout(() => {
        router.push({ name: "mainmenu" });
      }, 300);
    } else {
      errorMsg.value = authenStore.loginErrorMsg || "เข้าสู่ระบบไม่สำเร็จ";
    }
  } catch (err) {
    errorMsg.value = "ไม่สามารถเชื่อมต่อระบบได้";
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%);
  padding: 1rem;
}

.login-container {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 400px;
  overflow: hidden;
}

/* Header */
.login-header {
  text-align: center;
  padding: 2rem 2rem 1rem;
  background: linear-gradient(135deg, #1e40af, #2563eb);
  color: #fff;
}

.login-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
  backdrop-filter: blur(10px);
}

.login-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.login-subtitle {
  margin: 0.3rem 0 0;
  font-size: 0.85rem;
  opacity: 0.85;
}

/* Form */
.login-form {
  padding: 1.75rem 2rem;
}

.login-form .field {
  margin-bottom: 1.25rem;
}

.login-form label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.4rem;
}

.login-btn {
  margin-top: 0.5rem;
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
  border: none !important;
  font-weight: 600;
  letter-spacing: 0.3px;
  border-radius: 8px !important;
  height: 44px;
}

.login-btn:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af) !important;
}

/* Error */
.error-msg {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.6rem 0.85rem;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

/* Footer */
.login-footer {
  text-align: center;
  padding: 0.75rem 2rem 1.25rem;
  color: #9ca3af;
  font-size: 0.75rem;
}

/* Password input full width fix */
:deep(.p-password) {
  width: 100%;
}
:deep(.p-password .p-inputtext) {
  width: 100%;
}
</style>
