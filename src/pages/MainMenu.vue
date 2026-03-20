<template>
  <div class="main-menu-container">
    <div class="menu-header">
      <h1 class="title">CarDisplay Controller</h1>
    </div>
    
    <div class="menu-buttons">
      <button 
        class="menu-button product-button"
        @click="navigateToWithdraw"
      >
        <i class="pi pi-box"></i>
        เบิกสินค้า
      </button>
      
      <button 
        class="menu-button repair-button"
        @click="navigateToRepair"
      >
        <i class="pi pi-cog"></i>
        ซ่อมสินค้า
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from 'vue-router';

const router = useRouter();

// Navigation functions
const navigateToWithdraw = () => {
  router.push('/withdraw');
};

const navigateToRepair = () => {
  router.push('/repair');
};

</script>

<style scoped>
.main-menu-container {
  font-family: "Prompt", "Sarabun", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem;
}

.menu-header {
  margin-bottom: 4rem;
  text-align: center;
}

.title {
  font-size: 3rem;
  color: #e84c10;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.menu-buttons {
  display: flex;
  flex-direction: row;
  gap: 2rem;
}

.menu-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  border-radius: 12px;
  border: none;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.menu-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.menu-button i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.product-button {
  background-color: #e84c10;
}

.repair-button {
  background-color: #0ea5e9;
}

/* Responsive design for smaller screens */
@media (max-width: 768px) {
  .menu-buttons {
    flex-direction: column;
  }
  
  .menu-button {
    width: 180px;
    height: 180px;
  }
  
  .title {
    font-size: 2.5rem;
  }
}
</style>