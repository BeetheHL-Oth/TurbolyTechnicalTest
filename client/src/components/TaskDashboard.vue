<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { confirmAction, showDueTodayAlert, showError, showSuccess } from '../utils/alerts'
import PageHeader from './PageHeader.vue'

const emit = defineEmits(['logout', 'create-task'])

const tasks = ref([])
const loading = ref(false)
const saving = ref(false)
const editingTaskId = ref(null)
const formError = ref('')
const searchQuery = ref('')
const sortMode = ref('priority')
const apiUrl = process.env.APPURL

const editForm = ref({
  task: '',
  description: '',
  due: '',
  priority: '',
})

const authHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const handleLogout = async () => {
  const confirmed = await confirmAction(
    'Log out?',
    'You will need to sign in again to continue managing tasks.',
    'Logout',
  )

  if (!confirmed) return

  emit('logout')
}

const formatDate = (value) => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const getDateKey = (value) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const formatInputDate = (value) => getDateKey(value)

const formatPriority = (value) => {
  const normalized = String(value).toLowerCase().trim()

  if (normalized === '1' || normalized === 'high') return 'High'
  if (normalized === '2' || normalized === 'medium') return 'Medium'
  if (normalized === '3' || normalized === 'low') return 'Low'

  return value || '-'
}

const isDueToday = (value) => getDateKey(value) === getDateKey(new Date())
const isTaskDueToday = (task) => isDueToday(task.due)

const showDueTodayTasks = async () => {
  await showDueTodayAlert(tasks.value.filter(isTaskDueToday))
}

const normalizeTask = (task) => ({
  task: task.task || '',
  description: task.description || '',
  due: formatInputDate(task.due),
  priority: task.priority || '',
})

const fetchTasks = async ({ showDueAlert = false } = {}) => {
  loading.value = true

  try {
    const response = await axios.get(`${apiUrl}/tasks`, {
      headers: authHeaders(),
      params: {
        search: searchQuery.value || undefined,
        sortBy: sortMode.value || undefined,
      },
    })

    tasks.value = response.data
    if (showDueAlert) {
      await showDueTodayTasks()
    }
  } catch (err) {
    await showError('Failed to load tasks', err.response?.data?.message || 'Unable to fetch tasks')
  } finally {
    loading.value = false
  }
}

const startEdit = (task) => {
  editingTaskId.value = task.id
  editForm.value = normalizeTask(task)
  formError.value = ''
}

const cancelEdit = () => {
  editingTaskId.value = null
  editForm.value = {
    task: '',
    description: '',
    due: '',
    priority: '',
  }
  formError.value = ''
}

const saveTask = async () => {
  if (!editingTaskId.value) return

  saving.value = true
  formError.value = ''

  try {
    await axios.put(
      `${apiUrl}/tasks/${editingTaskId.value}`,
      {
        task: editForm.value.task,
        description: editForm.value.description,
        due: editForm.value.due,
        priority: editForm.value.priority,
      },
      { headers: authHeaders() },
    )

    await showSuccess('Task updated', 'The selected task was updated successfully.')
    cancelEdit()
    await fetchTasks()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Unable to save task changes'
    await showError('Failed to update task', formError.value)
  } finally {
    saving.value = false
  }
}

const deleteTask = async (taskId) => {
  const confirmed = await confirmAction('Delete this task?', 'This action cannot be undone.', 'Delete')
  if (!confirmed) return

  try {
    await axios.delete(`${apiUrl}/tasks/${taskId}`, { headers: authHeaders() })
    await showSuccess('Task deleted', 'The task was removed from the list.')
    await fetchTasks()
  } catch (err) {
    await showError('Failed to delete task', err.response?.data?.message || 'Unable to delete task')
  }
}

const markDone = async (taskId) => {
  try {
    await axios.patch(`${apiUrl}/tasks/${taskId}`, null, { headers: authHeaders() })
    await showSuccess('Task completed', 'The task was marked as done.')
    await fetchTasks()
  } catch (err) {
    await showError('Failed to mark task as done', err.response?.data?.message || 'Unable to complete task')
  }
}

const goToCreateTask = () => emit('create-task')

const setSort = async (mode) => {
  sortMode.value = mode
  await fetchTasks()
}

onMounted(() => fetchTasks({ showDueAlert: true }))
</script>

<template>
  <main class="min-h-screen bg-blue-50">
    <div class="w-full px-4 py-4 sm:px-6 sm:py-6 mx-auto sm:w-11/12 md:w-4/5 lg:max-w-5xl flex flex-col gap-6">
      <PageHeader
        eyebrow="Task workspace"
        title="Task management dashboard"
        subtitle="Review every task, edit details, delete anything stale, and mark work complete from a single table."
      >
        <template #actions>
          <button
            type="button"
            @click="goToCreateTask"
            class="inline-flex items-center justify-center rounded-none border border-black bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:px-5 sm:py-3"
          >
            Create task
          </button>
          <button
            type="button"
            @click="handleLogout"
            class="inline-flex items-center justify-center rounded-none border border-gray-200 bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 sm:px-5 sm:py-3"
          >
            Logout
          </button>
        </template>
      </PageHeader>

      <section v-if="editingTaskId" class="w-full rounded-none border border-gray-200 bg-white p-5 sm:p-6 md:p-8 shadow-xl">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs sm:text-sm uppercase tracking-[0.25em] text-blue-500">Edit task</p>
            <h2 class="mt-1 text-xl sm:text-2xl font-semibold text-gray-900">Update task details</h2>
          </div>
          <button
            type="button"
            @click="cancelEdit"
            class="inline-flex items-center justify-center rounded-none border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <form class="mt-6 grid gap-4 md:grid-cols-2" @submit.prevent="saveTask">
          <label class="space-y-2 md:col-span-1">
            <span class="text-sm text-gray-600">Task</span>
            <input
              v-model="editForm.task"
              type="text"
              class="w-full rounded-none border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-cyan-400"
              placeholder="Task title"
              required
            />
          </label>

          <label class="space-y-2 md:col-span-1">
            <span class="text-sm text-gray-600">Priority</span>
            <input
              v-model="editForm.priority"
              type="text"
              class="w-full rounded-none border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-cyan-400"
              placeholder="Low, Medium, High"
              required
            />
          </label>

          <label class="space-y-2 md:col-span-2">
            <span class="text-sm text-gray-600">Description</span>
            <textarea
              v-model="editForm.description"
              rows="4"
              class="w-full rounded-none border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-cyan-400"
              placeholder="Task description"
              required
            ></textarea>
          </label>

          <label class="space-y-2 md:col-span-1">
            <span class="text-sm text-gray-600">Due date</span>
            <input
              v-model="editForm.due"
              type="date"
              class="w-full rounded-none border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-cyan-400"
              required
            />
          </label>

          <div class="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
            <p v-else class="text-sm text-gray-600">Only the selected task will be updated.</p>

            <button
              type="submit"
              :disabled="saving"
              class="inline-flex items-center justify-center rounded-none bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {{ saving ? 'Saving...' : 'Save changes' }}
            </button>
          </div>
        </form>
      </section>

      <section class="w-full rounded-none border border-gray-200 bg-white p-5 sm:p-6 md:p-8 shadow-xl">
        <div class="flex flex-col gap-4 sm:gap-3">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div class="min-w-0">
              <h2 class="text-xl sm:text-2xl font-semibold text-gray-900">All tasks</h2>
              <p class="mt-1 text-sm text-gray-600">Fetched directly from the task API after login.</p>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                @click="setSort('priority')"
                :class="sortMode === 'priority' ? 'bg-black text-white' : 'bg-white text-gray-700'"
                class="px-3 py-2 border border-gray-200 text-sm transition"
              >
                Priority first
              </button>
              <button
                type="button"
                @click="setSort('due')"
                :class="sortMode === 'due' ? 'bg-black text-white' : 'bg-white text-gray-700'"
                class="px-3 py-2 border border-gray-200 text-sm transition"
              >
                Due date first
              </button>
            </div>

            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                v-model="searchQuery"
                @keyup.enter="fetchTasks"
                type="search"
                placeholder="Search tasks"
                class="w-full sm:flex-1 min-w-0 px-3 py-2 border border-gray-200 text-sm text-gray-700"
              />
              <button
                type="button"
                @click="fetchTasks"
                class="inline-flex w-full sm:w-auto items-center justify-center rounded-none border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        <div v-if="loading" class="mt-6 rounded-none border border-gray-200 bg-white px-5 py-8 sm:px-6 sm:py-10 text-center text-gray-600">
          Loading tasks...
        </div>

        <div v-else>
          <div class="mt-6 space-y-4 lg:hidden">
            <p v-if="!tasks.length" class="rounded-none border border-gray-200 bg-white px-4 py-8 text-center text-gray-600">
              No tasks found.
            </p>

            <article
              v-for="task in tasks"
              :key="task.id"
              class="rounded-none border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-xs uppercase tracking-[0.2em] text-gray-500">Task #{{ task.id }}</p>
                  <h3 class="mt-1 text-base font-semibold text-gray-900 wrap-break-words">{{ task.task }}</h3>
                </div>
                <span
                  class="inline-flex flex-none rounded-none px-3 py-1 text-xs font-medium"
                  :class="task.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
                >
                  {{ task.completed ? 'Done' : 'Pending' }}
                </span>
              </div>

              <div class="mt-4 grid gap-3 text-sm text-gray-700">
                <div>
                  <p class="text-xs uppercase tracking-[0.16em] text-gray-500">Description</p>
                  <p class="mt-1 wrap-break-words">{{ task.description }}</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <p class="text-xs uppercase tracking-[0.16em] text-gray-500">Due</p>
                    <p class="mt-1">{{ formatDate(task.due) }}</p>
                  </div>
                  <div>
                    <p class="text-xs uppercase tracking-[0.16em] text-gray-500">Priority</p>
                    <p class="mt-1">{{ formatPriority(task.priority) }}</p>
                  </div>
                </div>
              </div>

              <div class="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  @click="startEdit(task)"
                  class="rounded-none border border-cyan-200 bg-white px-3 py-2 text-xs font-medium text-cyan-700 transition hover:bg-cyan-50"
                >
                  Update
                </button>
                <button
                  type="button"
                  @click="deleteTask(task.id)"
                  class="rounded-none border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50"
                >
                  Delete
                </button>
                <button
                  type="button"
                  :disabled="task.completed"
                  @click="markDone(task.id)"
                  class="rounded-none border border-emerald-200 bg-white px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Mark done
                </button>
              </div>
            </article>
          </div>

          <div class="mt-6 hidden overflow-hidden rounded-none border border-gray-200 lg:block">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 text-left">
                <thead class="bg-gray-100 text-xs uppercase tracking-[0.12em] sm:tracking-[0.2em] text-gray-600">
                  <tr>
                    <th class="px-4 py-3 font-medium">ID</th>
                    <th class="px-4 py-3 font-medium">Task</th>
                    <th class="px-4 py-3 font-medium">Description</th>
                    <th class="px-4 py-3 font-medium">Due</th>
                    <th class="px-4 py-3 font-medium">Priority</th>
                    <th class="px-4 py-3 font-medium">Status</th>
                    <th class="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white text-sm sm:text-base">
                  <tr v-if="!tasks.length">
                    <td colspan="7" class="px-4 py-10 text-center text-gray-600">No tasks found.</td>
                  </tr>
                  <tr v-for="task in tasks" :key="task.id" class="align-top">
                    <td class="px-4 py-4 text-gray-700">{{ task.id }}</td>
                    <td class="px-4 py-4 text-gray-700">{{ task.task }}</td>
                    <td class="px-4 py-4 text-gray-700">{{ task.description }}</td>
                    <td class="px-4 py-4 text-gray-700">{{ formatDate(task.due) }}</td>
                    <td class="px-4 py-4 text-gray-700">{{ formatPriority(task.priority) }}</td>
                    <td class="px-4 py-4">
                      <span
                        class="inline-flex rounded-none px-3 py-1 text-xs font-medium"
                        :class="task.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
                      >
                        {{ task.completed ? 'Done' : 'Pending' }}
                      </span>
                    </td>
                    <td class="px-4 py-4">
                      <div class="flex flex-nowrap gap-2 whitespace-nowrap">
                        <button
                          type="button"
                          @click="startEdit(task)"
                          class="shrink-0 rounded-none border border-cyan-200 bg-white px-3 py-2 text-xs font-medium text-cyan-700 transition hover:bg-cyan-50"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          @click="deleteTask(task.id)"
                          class="shrink-0 rounded-none border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          :disabled="task.completed"
                          @click="markDone(task.id)"
                          class="shrink-0 rounded-none border border-emerald-200 bg-white px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Mark done
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
