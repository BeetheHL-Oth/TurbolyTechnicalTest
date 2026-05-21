<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { showError, showSuccess } from '../utils/alerts'
import PageHeader from './PageHeader.vue'

const emit = defineEmits(['back-to-dashboard', 'task-created', 'logout'])

const creating = ref(false)
const formError = ref('')
const taskForm = ref({
  task: '',
  description: '',
  due: '',
  priority: '',
})

const priorityOptions = [
  { label: 'Low', value: '3' },
  { label: 'Medium', value: '2' },
  { label: 'High', value: '1' },
]

const authHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const resetForm = () => {
  taskForm.value = {
    task: '',
    description: '',
    due: '',
    priority: '',
  }
  formError.value = ''
}

const createTask = async () => {
  creating.value = true
  formError.value = ''

  try {
    await axios.post(
      'http://localhost:3000/tasks',
      {
        task: taskForm.value.task,
        description: taskForm.value.description,
        due: taskForm.value.due,
        priority: taskForm.value.priority,
      },
      {
        headers: authHeaders(),
      },
    )

    await showSuccess('Task created', 'The new task was added to your list.')
    resetForm()
    emit('task-created')
  } catch (err) {
    formError.value = err.response?.data?.message || 'Unable to create task'
    await showError('Failed to create task', formError.value)
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-blue-50">
    <div class="w-full px-4 py-4 sm:px-6 sm:py-6 mx-auto sm:w-11/12 md:w-5/6 lg:max-w-4xl flex flex-col gap-6">
      <PageHeader
        eyebrow="Task workspace"
        title="Create a new task"
        subtitle="Fill in the task details here, then return to the dashboard to continue managing your list."
      >
        <template #actions>
          <button
            type="button"
            @click="emit('back-to-dashboard')"
            class="inline-flex items-center justify-center rounded-none border border-black bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:px-5 sm:py-3"
          >
            Return to dashboard
          </button>
          <button
            type="button"
            @click="emit('logout')"
            class="inline-flex items-center justify-center rounded-none border border-gray-200 bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 sm:px-5 sm:py-3"
          >
            Logout
          </button>
        </template>
      </PageHeader>

      <section class="w-full rounded-none border border-gray-200 bg-white p-5 sm:p-6 md:p-8 shadow-xl">
        <form class="grid gap-4 md:grid-cols-2" @submit.prevent="createTask">
          <label class="space-y-2 md:col-span-2">
            <span class="text-sm text-gray-600">Task</span>
            <input
              v-model="taskForm.task"
              type="text"
              class="w-full rounded-none border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-400"
              placeholder="Task title"
              required
            />
          </label>

          <fieldset class="space-y-2 md:col-span-2">
            <legend class="text-sm text-gray-600">Priority</legend>
            <div class="grid gap-3 rounded-none border border-gray-200 bg-white p-4">
              <label
                v-for="option in priorityOptions"
                :key="option.value"
                class="flex cursor-pointer items-center gap-3 rounded-none border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition hover:border-emerald-400/40"
              >
                <input
                  v-model="taskForm.priority"
                  type="radio"
                  name="priority"
                  :value="option.value"
                  class="h-4 w-4 border-gray-400 text-emerald-400 focus:ring-emerald-400"
                  required
                />
                <span class="flex items-center justify-between gap-2">
                  <span class="font-medium">{{ option.label }}</span>
                </span>
              </label>
            </div>
          </fieldset>

          <label class="space-y-2 md:col-span-2">
            <span class="text-sm text-gray-600">Description</span>
            <textarea
              v-model="taskForm.description"
              rows="4"
              class="w-full rounded-none border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-400"
              placeholder="Task description"
              required
            ></textarea>
          </label>

          <label class="space-y-2 md:col-span-1">
            <span class="text-sm text-gray-600">Due date</span>
            <input
              v-model="taskForm.due"
              type="date"
              class="w-full rounded-none border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-400"
              required
            />
          </label>

          <div class="md:col-span-2 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
            <p v-else class="text-sm text-gray-600">New tasks are created on the server and can be edited from the dashboard.</p>

            <button
              type="submit"
              :disabled="creating"
              class="inline-flex items-center justify-center rounded-none bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {{ creating ? 'Creating...' : 'Create task' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </main>
</template>