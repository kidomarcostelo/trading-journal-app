import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TradeDataTable from '../../components/TradeDataTable.vue'

describe('TradeDataTable', () => {
  const mockTrade = {
    ID: '1',
    Pair: 'BTC/USD',
    EntryPrice: 50000,
    ExitPrice: 52000,
    Size: 1.5,
    Direction: 'Long',
    PnL: 3000,
    MAE: 500
  }

  it('renders input fields for trade metrics', () => {
    const wrapper = mount(TradeDataTable, {
      props: { trade: mockTrade }
    })
    
    // Check for core inputs
    expect(wrapper.find('input[type="number"]').exists()).toBe(true)
    // We expect inputs for Entry, Exit, Size, PnL, MAE
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThanOrEqual(5)
  })

  it('updates local state on input', async () => {
    const wrapper = mount(TradeDataTable, {
      props: { trade: mockTrade }
    })
    
    const entryInput = wrapper.findAll('input').find(i => i.element.value === '50000')
    expect(entryInput).toBeDefined()
    
    await entryInput!.setValue(51000)
    
    // Check if the component emits an update or if local model changes
    // Assuming we use v-model or emit 'update:trade' or 'save'
    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')![0][0]).toMatchObject({ EntryPrice: 51000 })
  })

  it('calculates PnL automatically if Entry/Exit/Size change', async () => {
    // This assumes the component has internal logic to recalc PnL
    const wrapper = mount(TradeDataTable, {
      props: { 
        trade: { ...mockTrade, EntryPrice: 100, ExitPrice: 110, Size: 1, Direction: 'Long' } 
      }
    })
    
    // PnL should be (110 - 100) * 1 = 10
    // If we change Exit to 120, PnL should be 20
    const exitInput = wrapper.findAll('input').find(i => i.element.value === '110')
    await exitInput!.setValue(120)
    
    // Verify emitted update includes calculated PnL
    // Note: Implementation detail - component might auto-calc or wait for user.
    // For this test, we expect auto-calc on field blur or input.
    const updates = wrapper.emitted('update')
    const lastUpdate = updates![updates!.length - 1][0]
    expect(lastUpdate).toHaveProperty('PnL')
    // (120 - 100) * 1 = 20
    expect(lastUpdate.PnL).toBeCloseTo(20)
  })
})
