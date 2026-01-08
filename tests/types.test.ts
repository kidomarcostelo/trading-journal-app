import { describe, it, expect } from 'vitest'
import type { ChipConfig, TradeEntry, Trade } from '../types/index'

describe('Type Definitions', () => {
  it('should allow valid TradeEntry', () => {
    const entry: TradeEntry = {
      date: '2023-01-01',
      pair: 'BTCUSD',
      entryPrice: 50000,
      imagesBefore: [],
      imagesAfter: [],
      tags: { Strategy: 'Breakout' }
    }
    expect(entry.date).toBe('2023-01-01')
  })

  it('should allow valid Trade', () => {
    const trade: Trade = {
      id: '1',
      rowIndex: 2,
      date: '2023-01-01',
      pair: 'BTCUSD',
      entryPrice: 50000,
      imagesBefore: [],
      imagesAfter: [],
      tags: {}
    }
    expect(trade.id).toBe('1')
  })
})
