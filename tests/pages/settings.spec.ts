import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import SettingsPage from '../../pages/settings.vue'

// Mock dependencies
vi.mock('../../composables/useSettings', () => ({
  useSettings: vi.fn()
}))

vi.stubGlobal('useFetch', vi.fn(() => ({ data: ref([]), pending: ref(false) })))
vi.stubGlobal('navigateTo', vi.fn())
vi.stubGlobal('useColorMode', vi.fn(() => ({ value: 'dark' })))

vi.mock('../../composables/useToast', () => ({
  useToast: () => ({ addToast: vi.fn() })
}))

import { useSettings } from '../../composables/useSettings'

describe('Settings Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // @ts-ignore
        useSettings.mockReturnValue({
            settings: ref({ panels: [] }),
            saveSettings: vi.fn(),
            isLoading: ref(false),
            fetchSettings: vi.fn()
        })
    })

    it('renders correctly', () => {
        const wrapper = mount(SettingsPage, {
          global: {
            stubs: {
              ToastNotification: true,
              NuxtLink: true,
              AppSidebar: true
            }
          }
        })
        expect(wrapper.text()).toContain('System Settings')
    })

    it('can add a new panel', async () => {
        const wrapper = mount(SettingsPage, {
          global: {
            stubs: {
              ToastNotification: true,
              NuxtLink: true,
              AppSidebar: true,
              TransitionGroup: true
            }
          }
        })
        
        // Wait for initial fetch
        await flushPromises()
        
        // Find the "Add New Panel" button by text
        const buttons = wrapper.findAll('button')
        const addBtn = buttons.find(b => b.text().includes('Add New Panel'))
        
        if (!addBtn) throw new Error('Add New Panel button not found')
        
        await addBtn.trigger('click')
        await flushPromises()
        
        // Should render a panel title input
        expect(wrapper.find('input[placeholder="Panel Title..."]').exists()).toBe(true)
    })
})