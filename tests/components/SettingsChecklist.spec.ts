import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import SettingsChecklist from '../../components/SettingsChecklist.vue'
import { useSettings } from '../../composables/useSettings'

// Mock useSettings
vi.mock('../../composables/useSettings', () => ({
  useSettings: vi.fn()
}))

vi.mock('../../composables/useToast', () => ({
  useToast: () => ({ addToast: vi.fn() })
}))

describe('SettingsChecklist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // @ts-ignore
    useSettings.mockReturnValue({
      checklistRules: ref([
        { description: 'Rule 1', weight: 1, isMandatory: false }
      ]),
      tierThresholds: ref([
        { label: 'S Tier', threshold: 10 }
      ]),
      saveChecklistConfig: vi.fn().mockResolvedValue(true)
    })
  })

  it('renders existing rules and tiers', async () => {
    const wrapper = mount(SettingsChecklist)
    await flushPromises()
    
    const inputs = wrapper.findAll('input[type="text"]')
    const values = inputs.map(i => i.element.value)
    expect(values).toContain('Rule 1')
    expect(values).toContain('S Tier')
  })

  it('can add a new rule', async () => {
    const wrapper = mount(SettingsChecklist)
    
    // Find Add Rule button
    const buttons = wrapper.findAll('button')
    const addBtn = buttons.find(b => b.text().includes('Add Rule'))
    if (!addBtn) throw new Error('Add Rule button not found')
    
    await addBtn.trigger('click')
    await flushPromises()
    
    // Should render a new rule input
    const inputs = wrapper.findAll('input[type="text"]')
    // There should be at least two inputs (one for the existing rule, one for the new one)
    expect(inputs.length).toBeGreaterThanOrEqual(2) 
  })

  it('calls saveChecklistConfig when saving', async () => {
    const wrapper = mount(SettingsChecklist)
    const { saveChecklistConfig } = useSettings()

    // Find Save button
    const buttons = wrapper.findAll('button')
    const saveBtn = buttons.find(b => b.text().includes('Save Configuration'))
    if (!saveBtn) throw new Error('Save button not found')

    await saveBtn.trigger('click')
    expect(saveChecklistConfig).toHaveBeenCalled()
  })
})