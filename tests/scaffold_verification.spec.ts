import { describe, it, expect } from 'vitest'
import { ChipConfig, TradeEntry, Trade } from '../types'

describe('Scaffold Verification', () => {
  it('types are importable and correct', () => {
    const config: ChipConfig = {
      id: '1',
      label: 'Test',
      color: 'blue',
      category: 'Strategy'
    }
    expect(config.id).toBe('1')
  })

  it('Tailwind config is defined', async () => {
    const tailwindConfig = await import('../tailwind.config')
    expect(tailwindConfig.default).toBeDefined()
    expect(tailwindConfig.default.theme.extend.colors.terminal).toBeDefined()
  })

  it('Nuxt config is defined', async () => {
    // @ts-ignore
    global.defineNuxtConfig = (config: any) => config
    const nuxtConfig = await import('../nuxt.config')
    expect(nuxtConfig.default).toBeDefined()
  })
})
