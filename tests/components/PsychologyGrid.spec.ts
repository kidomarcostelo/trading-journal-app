import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import PsychologyGrid from '../../components/PsychologyGrid.vue'

// Mock useSettings
vi.mock('../../composables/useSettings', () => ({
  useSettings: vi.fn()
}))

import { useSettings } from '../../composables/useSettings'

describe('PsychologyGrid', () => {
  const mockConfig = [
    { id: 'Intention', values: ['Plan', 'Impulse'] },
    { id: 'Mood', values: ['Calm', 'Anxious'] }
  ]

  const mockTrade = {
    'Intention': ['Plan'],
    'Mood': []
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // @ts-ignore
    useSettings.mockReturnValue({
      settings: ref({ strategy: [], psychology: ['Intention', 'Mood'] })
    })
  })

  it('renders categories from settings layout', () => {
    const wrapper = mount(PsychologyGrid, {
      props: {
        config: mockConfig,
        modelValue: mockTrade
      },
      global: {
        stubs: {
          ChipSelect: true,
          NuxtLink: true
        }
      }
    })

    const headers = wrapper.findAll('.text-terminal-highlight')
    expect(headers.length).toBe(2)
    expect(headers[0].text()).toContain('Intention')
    expect(headers[1].text()).toContain('Mood')
  })

  it('shows empty state when no categories configured', () => {
    // @ts-ignore
    useSettings.mockReturnValue({
      settings: ref({ strategy: [], psychology: [] })
    })

    const wrapper = mount(PsychologyGrid, {
      props: {
        config: mockConfig,
        modelValue: mockTrade
      },
      global: {
        stubs: {
          NuxtLink: true
        }
      }
    })

    expect(wrapper.text()).toContain('No psychology categories configured')
  })
})
