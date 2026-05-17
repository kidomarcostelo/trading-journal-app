import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import SettingsChecklist from '../../components/SettingsChecklist.vue'
import { useSettings } from '../../composables/useSettings'

// Mock dependencies
vi.mock('../../composables/useSettings', () => ({
  useSettings: vi.fn()
}))

vi.mock('../../composables/useToast', () => ({
  useToast: () => ({ addToast: vi.fn() })
}))

vi.stubGlobal('useFetch', vi.fn())

describe('SettingsChecklist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // @ts-ignore
    useSettings.mockReturnValue({
      strategyChecklists: ref({
        'Default': {
          rules: [{ description: 'Rule 1', weight: 1, isMandatory: false }],
          tiers: [{ label: 'S Tier', threshold: 10 }]
        },
        'Breakout': {
          rules: [{ description: 'Momentum', weight: 5, isMandatory: true }],
          tiers: []
        }
      }),
      saveChecklistConfig: vi.fn().mockResolvedValue(true),
      isLoading: ref(false)
    })

    // @ts-ignore
    useFetch.mockReturnValue({
      data: ref([
        { id: 'Strategies', values: ['Breakout', 'Mean Reversion'] }
      ]),
      pending: ref(false)
    })
  })

  it('renders existing rules for default strategy', async () => {
    const wrapper = mount(SettingsChecklist)
    await flushPromises()
    
    const inputs = wrapper.findAll('input[type="text"]')
    const values = inputs.map(i => i.element.value)
    expect(values).toContain('Rule 1')
    expect(values).toContain('S Tier')
    expect(wrapper.text()).toContain('Default')
  })

  it('switches rules when strategy is selected', async () => {
    const wrapper = mount(SettingsChecklist)
    await flushPromises()
    
    const select = wrapper.find('select')
    await select.setValue('Breakout')
    await flushPromises()
    
    const inputs = wrapper.findAll('input[type="text"]')
    const values = inputs.map(i => i.element.value)
    expect(values).toContain('Momentum')
    expect(values).not.toContain('Rule 1')
  })

  it('calls saveChecklistConfig with the selected strategy', async () => {
    const wrapper = mount(SettingsChecklist)
    await flushPromises()
    
    const { saveChecklistConfig } = useSettings()

    const select = wrapper.find('select')
    await select.setValue('Breakout')

    // Find Save button
    const buttons = wrapper.findAll('button')
    const saveBtn = buttons.find(b => b.text().includes('Save Configuration'))
    if (!saveBtn) throw new Error('Save button not found')

    await saveBtn.trigger('click')
    expect(saveChecklistConfig).toHaveBeenCalledWith('Breakout', expect.any(Array), expect.any(Array))
  })
})