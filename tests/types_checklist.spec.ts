import { describe, it, expect } from 'vitest'
import type { ChecklistRule, TierThreshold, Trade } from '../types'

describe('Dynamic Trading Checklist Types', () => {
  it('should define ChecklistRule correctly', () => {
    const rule: ChecklistRule = {
      description: 'Trend is clear',
      weight: 2,
      isMandatory: true
    }
    expect(rule.description).toBe('Trend is clear')
    expect(rule.weight).toBe(2)
    expect(rule.isMandatory).toBe(true)
  })

  it('should define TierThreshold correctly', () => {
    const tier: TierThreshold = {
      label: 'S Tier',
      threshold: 10
    }
    expect(tier.label).toBe('S Tier')
    expect(tier.threshold).toBe(10)
  })

  it('should allow checklistScore and tier on Trade interface', () => {
    const trade: Trade = {
      id: '123',
      createdAt: '2023-01-01',
      checklistScore: 12,
      tier: 'S Tier'
    }
    expect(trade.checklistScore).toBe(12)
    expect(trade.tier).toBe('S Tier')
  })
})