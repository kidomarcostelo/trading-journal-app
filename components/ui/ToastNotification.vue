<script setup lang="ts">
import { useToast } from '../../composables/useToast'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-vue-next'

const { toasts, removeToast } = useToast()

const getIcon = (type?: string) => {
  switch (type) {
    case 'success': return CheckCircle
    case 'error': return AlertCircle
    case 'warning': return AlertTriangle
    default: return Info
  }
}

const getStyles = (type?: string) => {
  switch (type) {
    case 'success': return 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100'
    case 'error': return 'bg-rose-950/90 border-rose-500/50 text-rose-100'
    case 'warning': return 'bg-amber-950/90 border-amber-500/50 text-amber-100'
    default: return 'bg-slate-900/90 border-slate-500/50 text-slate-100'
  }
}
</script>

<template>
  <TransitionGroup
    tag="div"
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="-translate-y-4 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
    class="fixed top-0 left-1/2 -translate-x-1/2 z-50 p-4 space-y-4 w-full max-w-sm pointer-events-none flex flex-col items-center"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 backdrop-blur-sm border"
      :class="getStyles(toast.type)"
    >
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <component :is="getIcon(toast.type)" class="h-5 w-5" aria-hidden="true" />
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p class="text-sm font-medium">{{ toast.title }}</p>
            <p class="mt-1 text-xs opacity-90">{{ toast.message }}</p>
          </div>
          <div class="ml-4 flex flex-shrink-0">
            <button
              type="button"
              class="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 opacity-70 hover:opacity-100 transition-opacity"
              @click="removeToast(toast.id)"
            >
              <span class="sr-only">Close</span>
              <X class="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </TransitionGroup>
</template>
