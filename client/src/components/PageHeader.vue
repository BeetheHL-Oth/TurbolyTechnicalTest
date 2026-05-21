<script setup>
defineProps({
  eyebrow: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <header class="rounded-none border border-gray-200 bg-white p-4 sm:p-6 shadow-xl">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-xs sm:text-sm uppercase tracking-[0.3em] text-blue-500">
          {{ eyebrow }}
        </p>
        <h1 class="mt-2 text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900">
          {{ title }}
        </h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          {{ subtitle }}
        </p>
      </div>

      <div class="flex flex-wrap gap-3 items-center lg:justify-end">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>