import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import SettingsPage from '../../pages/settings.vue'

// Mock dependencies
vi.mock('../../composables/useSettings', () => ({
  useSettings: vi.fn()
}))

vi.stubGlobal('useFetch', vi.fn(() => ({ data: ref([]), pending: ref(false) })))
vi.stubGlobal('navigateTo', vi.fn())
vi.stubGlobal('useColorMode', vi.fn(() => ({ value: 'dark' })))

// Mock PaneNav
vi.mock('../../components/PaneNav.vue', () => ({
    default: {
        template: `<div class="pane-nav-stub" @click="$emit('update:activeTab', 'daily-trades')"></div>`,
        props: ['activeTab']
    }
}))

vi.mock('../../composables/useToast', () => ({
  useToast: () => ({ addToast: vi.fn() })
}))

import { useSettings } from '../../composables/useSettings'

describe('Settings Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // @ts-ignore
        useSettings.mockReturnValue({
            settings: ref({ strategy: [], psychology: [] }),
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
              NuxtLink: true
            }
          }
        })
        expect(wrapper.text()).toContain('Settings')
    })

    it('navigates home when tab changes', async () => {
        const wrapper = mount(SettingsPage, {
          global: {
            stubs: {
              ToastNotification: true,
              NuxtLink: true
            }
          }
        })
        
        // Trigger tab change via mock PaneNav
        await wrapper.find('.pane-nav-stub').trigger('click')
        
        expect(navigateTo).toHaveBeenCalledWith('/')
    })
})