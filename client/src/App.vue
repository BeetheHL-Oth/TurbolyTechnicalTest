<script setup>
import { onMounted, ref } from 'vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import TaskCreate from './components/TaskCreate.vue'
import TaskDashboard from './components/TaskDashboard.vue'

const currentPage = ref('login')

onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    currentPage.value = 'dashboard'
  }
})
const switchToRegister = () => {
  currentPage.value = 'register'
}

const switchToLogin = () => {
  currentPage.value = 'login'
}

const handleLoginSuccess = () => {
  currentPage.value = 'dashboard'
}

const handleGoToCreateTask = () => {
  currentPage.value = 'create-task'
}

const handleTaskCreated = () => {
  currentPage.value = 'dashboard'
}

const handleBackToDashboard = () => {
  currentPage.value = 'dashboard'
}

const handleRegisterSuccess = () => {
  currentPage.value = 'login'
}

const handleLogout = () => {
  localStorage.removeItem('token')
  currentPage.value = 'login'
}
</script>

<template>
  <div>
    <Login
      v-if="currentPage === 'login'"
      @switch-to-register="switchToRegister"
      @login-success="handleLoginSuccess"
    />
    
    <Register
      v-if="currentPage === 'register'"
      @switch-to-login="switchToLogin"
      @register-success="handleRegisterSuccess"
    />

    <TaskDashboard
      v-if="currentPage === 'dashboard'"
      @logout="handleLogout"
      @create-task="handleGoToCreateTask"
    />

    <TaskCreate
      v-if="currentPage === 'create-task'"
      @back-to-dashboard="handleBackToDashboard"
      @task-created="handleTaskCreated"
      @logout="handleLogout"
    />
  </div>
</template>
