import { ref } from 'vue'

export type SaveMode = 'auto' | 'manual' | 'navigation'

export const useAutoSave = (saveFn: () => Promise<any>, debounceMs = 500) => {
  const saveMode = ref<SaveMode>('manual')
  const isDirty = ref(false)
  const isLoading = ref(false)
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const trackChange = () => {
    isDirty.value = true
    if (saveMode.value === 'auto') {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(async () => {
        if (isDirty.value) {
          await triggerSave()
        }
      }, debounceMs)
    }
  }

  const triggerSave = async () => {
    if (isLoading.value) return
    
    isLoading.value = true
    try {
      await saveFn()
      isDirty.value = false
    } finally {
      isLoading.value = false
    }
  }

  const onNavigate = async () => {
    if (saveMode.value === 'navigation' && isDirty.value) {
      await triggerSave()
    } else {
        // When navigating to a new trade, reset dirty state
        isDirty.value = false
    }
    
    if (debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
    }
  }

  return {
    saveMode,
    isDirty,
    isLoading,
    trackChange,
    triggerSave,
    onNavigate
  }
}