import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CalendarRange from '../../components/CalendarRange.vue'

describe('CalendarRange', () => {
  it('renders initial state correctly', () => {
    const wrapper = mount(CalendarRange, {
      props: {
        startDate: '',
        endDate: ''
      }
    })
    expect(wrapper.text()).toContain('Select Date Range')
  })

  it('shows picker when clicked', async () => {
    const wrapper = mount(CalendarRange, {
      props: {
        startDate: '',
        endDate: ''
      }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('.absolute').exists()).toBe(true)
    // Should show month/year
    const now = new Date()
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now)
    expect(wrapper.text()).toContain(monthName)
  })

  it('respects autoOpen prop', () => {
    const wrapper = mount(CalendarRange, {
      props: {
        startDate: '',
        endDate: '',
        autoOpen: true
      }
    })
    expect(wrapper.find('.absolute').exists()).toBe(true)
  })

  it('emits update:startDate when first date is clicked', async () => {
    const wrapper = mount(CalendarRange, {
      props: {
        startDate: '',
        endDate: ''
      }
    })
    await wrapper.find('button').trigger('click')
    
    // Find a day button - let's find one that is "current month"
    const dayButtons = wrapper.findAll('button').filter(b => b.text().match(/^\d+$/))
    await dayButtons[10].trigger('click') // Click some day

    expect(wrapper.emitted('update:startDate')).toBeTruthy()
  })
})
