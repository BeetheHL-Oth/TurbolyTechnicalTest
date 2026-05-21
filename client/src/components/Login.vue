<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { showError, showSuccess } from '../utils/alerts'

const email = ref('')
const password = ref('')
const loading = ref(false)

const emit = defineEmits(['switch-to-register', 'login-success'])

const handleLogin = async () => {
  loading.value = true
  
  try {
    const response = await axios.post('http://localhost:3000/login', {
      email: email.value,
      password: password.value
    })
    

    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
    
    await showSuccess('Login successful', 'Redirecting to your task dashboard.')
    emit('login-success', response.data)
    email.value = ''
    password.value = ''
  } catch (err) {
    await showError('Login failed', err.response?.data?.message || 'Unable to sign in')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-blue-50">
    <div class="w-full px-4 py-4 sm:px-6 sm:py-6 mx-auto sm:w-11/12 md:w-5/6 lg:max-w-4xl flex items-center justify-center min-h-screen">
      <div class="w-full max-w-3xl bg-white p-6 sm:p-8 md:p-10 shadow-xl">
        <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium mb-2">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 transition"
            placeholder="your@email.com"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium mb-2">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 transition"
            placeholder="Enter your password"
            autoComplete="off"
          />
        </div>
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-black text-white py-2 mt-7 rounded-lg hover:bg-white hover:text-black border disabled:bg-gray-400 transition"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      
      <p class="mt-6 text-center text-sm text-gray-600 break-words">
        Don't have an account?
        <button
          @click="$emit('switch-to-register')"
          class="text-blue-500 hover:underline font-medium"
        >
          Register here
        </button>
      </p>
      </div>
    </div>
  </main>
</template>
