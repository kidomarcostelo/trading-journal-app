<script setup lang="ts">
import { AlertTriangle, Loader2 } from 'lucide-vue-next'

interface Props {
  isOpen: boolean
  isDeleting?: boolean
  tradeId?: string | number
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'confirm'])

const close = () => {
  if (props.isDeleting) return
  emit('close')
}

const confirm = () => {
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="close"></div>

        <!-- Modal -->
        <div 
          class="relative w-full max-w-sm bg-terminal-black border border-terminal-gray/50 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
        >
          <div class="p-6 space-y-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle class="w-6 h-6 text-error" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-terminal-highlight">Delete Trade?</h3>
                <p class="text-xs text-terminal-text/70 mt-1">
                  This action cannot be undone. All data for this trade will be permanently removed.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3 pt-4">
              <button
                @click="close"
                type="button"
                :disabled="isDeleting"
                class="flex-1 px-4 py-2.5 rounded-lg border border-terminal-gray/50 text-terminal-text hover:bg-terminal-gray/20 hover:text-terminal-highlight transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                @click="confirm"
                type="button"
                :disabled="isDeleting"
                class="flex-1 px-4 py-2.5 rounded-lg bg-error text-white hover:bg-error/90 transition-all text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Loader2 v-if="isDeleting" class="w-4 h-4 animate-spin" />
                <span>{{ isDeleting ? 'Deleting...' : 'Delete' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
