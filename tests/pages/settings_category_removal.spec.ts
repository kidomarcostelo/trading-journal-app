import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import SettingsPage from '../../pages/settings.vue'

// Mock dependencies
vi.mock('../../composables/useSettings', () => ({
  useSettings: vi.fn()
}))

vi.mock('../../composables/useToast', () => ({
  useToast: () => ({ addToast: vi.fn() })
}))

vi.stubGlobal('useFetch', vi.fn())

import { useSettings } from '../../composables/useSettings'

describe('Settings Page Category Removal', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // @ts-ignore
        useSettings.mockReturnValue({
            settings: ref({ 
                panels: [
                    { id: 'p1', title: 'Test Panel', categories: ['Cat1'] }
                ] 
            }),
            saveSettings: vi.fn(),
            isLoading: ref(false),
            fetchSettings: vi.fn()
        })
        
        // @ts-ignore
        useFetch.mockReturnValue({
            data: ref([{ id: 'Cat1', values: ['Val1'] }]),
            refresh: vi.fn(),
            pending: ref(false)
        })
    })

    it('removes a category from a panel when the remove button is clicked', async () => {
        const wrapper = mount(SettingsPage, {
          global: {
            stubs: {
              NuxtLink: true,
              TransitionGroup: {
                template: '<div><slot /></div>'
              },
              X: true,
              GripVertical: true,
              Layers: true,
              ChevronDown: true,
              ChevronRight: true,
              Plus: true,
              Trash2: true,
              Library: true,
              ExternalLink: true,
              Save: true,
              ArrowLeft: true,
              SettingsIcon: true,
              SettingsChecklist: true
            }
          }
        })

        // Wait for onMounted and state sync
        await flushPromises()

        // Check if category 'Cat1' is in the panel
        expect(wrapper.find('[data-testid="category-item"]').exists()).toBe(true)
        expect(wrapper.find('[data-testid="category-item"]').text()).toContain('Cat1')

        // Find the remove button
        const removeBtn = wrapper.find('[data-testid="remove-category-btn"]')
        expect(removeBtn.exists()).toBe(true)
        
        await removeBtn.trigger('click')
        await flushPromises()

        // Category should be gone from the panel list
        expect(wrapper.find('[data-testid="category-item"]').exists()).toBe(false)
    })
})
