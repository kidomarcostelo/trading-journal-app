import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import FloatingChecklist from '../../components/FloatingChecklist.vue'
import { useSettings } from '../../composables/useSettings'

vi.mock('../../composables/useSettings', () => ({
  useSettings: vi.fn()
}))

describe('FloatingChecklist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // @ts-ignore
    useSettings.mockReturnValue({
      strategyChecklists: ref({
        'Default': {
          rules: [
            { description: 'Rule 1', weight: 2, isMandatory: false },
            { description: 'Rule 2', weight: 3, isMandatory: true }
          ],
          tiers: [
            { label: 'S Tier', threshold: 5 },
            { label: 'A Tier', threshold: 2 }
          ]
        },
        'Breakout': {
          rules: [
            { description: 'Momentum', weight: 10, isMandatory: true }
          ],
          tiers: [
            { label: 'God Tier', threshold: 10 }
          ]
        }
      })
    })
  })

  it('renders the checklist rules for default strategy', () => {
    const wrapper = mount(FloatingChecklist, { props: { modelValue: [] } })
    expect(wrapper.text()).toContain('Rule 1')
    expect(wrapper.text()).toContain('Default')
  })

  it('switches rules when strategy prop changes', async () => {
    const wrapper = mount(FloatingChecklist, { props: { modelValue: [], strategy: 'Breakout' } })
    expect(wrapper.text()).toContain('Momentum')
    expect(wrapper.text()).toContain('Breakout')
  })

  it('calculates score and tier correctly', async () => {
    const wrapper = mount(FloatingChecklist, { props: { modelValue: [] } })
    
    // Check first rule (Weight 2) -> Should be A Tier
    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    await checkboxes[0].setValue(true)
    
    expect(wrapper.text()).toContain('Score: 2')
    // Wait, Rule 2 is mandatory! So even if score is 2, it shouldn't allow tier selection if mandatory is missing.
    expect(wrapper.text()).toContain('Missing Mandatory')

    // Check second rule (Weight 3) -> Total 5 -> S Tier, and all mandatory checked
    await checkboxes[1].setValue(true)
    expect(wrapper.text()).toContain('Score: 5')
    expect(wrapper.text()).toContain('S Tier')
    
    // It should emit the updated modelValue
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([['Rule 1', 'Rule 2']])
    
    // Emit calculated data
    const tierEmits = wrapper.emitted('update:tier')!
    expect(tierEmits[tierEmits.length - 1]).toEqual(['S Tier'])
    
    const scoreEmits = wrapper.emitted('update:score')!
    expect(scoreEmits[scoreEmits.length - 1]).toEqual([5])
  })

  it('handles empty settings gracefully', () => {
    // @ts-ignore
    useSettings.mockReturnValue({
        strategyChecklists: ref({})
    })
    const wrapper = mount(FloatingChecklist, { props: { modelValue: [] } })
    expect(wrapper.text()).toContain('No checklist rules')
  })
})