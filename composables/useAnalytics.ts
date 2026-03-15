import type { Trade } from '~/types'

export const useAnalytics = () => {
  
  const parseNumber = (val: any): number => {
    if (typeof val === 'number') return val
    if (!val) return 0
    // Remove currency symbols, commas, and spaces, keep - and .
    const clean = String(val).replace(/[^0-9.-]/g, '')
    const num = parseFloat(clean)
    return isNaN(num) ? 0 : num
  }

  const getVal = (obj: any, key: string) => {
    if (!obj) return undefined
    const keys = Object.keys(obj)
    const foundKey = keys.find(k => k.toLowerCase() === key.toLowerCase())
    if (foundKey) return obj[foundKey]
    
    // Fallback for space-less versions like "exitdate" for "Exit Date"
    const flatKey = key.toLowerCase().replace(/\s/g, '')
    const foundFlatKey = keys.find(k => k.toLowerCase().replace(/\s/g, '') === flatKey)
    return foundFlatKey ? obj[foundFlatKey] : undefined
  }

  const isClosed = (t: Trade): boolean => {
    const status = String(getVal(t, 'status') || '').toLowerCase()
    return status === 'closed'
  }

  const calculateProfitFactor = (trades: Trade[]): number => {
    const closedTrades = trades.filter(isClosed)
    let grossProfit = 0
    let grossLoss = 0

    closedTrades.forEach(t => {
      const pnl = parseNumber(getVal(t, 'pnl'))
      if (pnl > 0) grossProfit += pnl
      else grossLoss += Math.abs(pnl)
    })

    if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0
    return Number((grossProfit / grossLoss).toFixed(2))
  }

  const calculateWinRate = (trades: Trade[]): number => {
    const closedTrades = trades.filter(isClosed)
    if (closedTrades.length === 0) return 0
    
    const wins = closedTrades.filter(t => parseNumber(getVal(t, 'pnl')) > 0).length
    return Number(((wins / closedTrades.length) * 100).toFixed(2))
  }

  const calculateExpectancy = (trades: Trade[]): number => {
    const closedTrades = trades.filter(isClosed)
    if (closedTrades.length === 0) return 0

    const wins = closedTrades.filter(t => parseNumber(getVal(t, 'pnl')) > 0)
    const losses = closedTrades.filter(t => parseNumber(getVal(t, 'pnl')) <= 0)

    const avgWin = wins.length > 0 
      ? wins.reduce((sum, t) => sum + parseNumber(getVal(t, 'pnl')), 0) / wins.length 
      : 0
    
    const avgLoss = losses.length > 0 
      ? Math.abs(losses.reduce((sum, t) => sum + parseNumber(getVal(t, 'pnl')), 0)) / losses.length 
      : 0

    const winRate = wins.length / closedTrades.length
    const lossRate = losses.length / closedTrades.length

    return Number(((avgWin * winRate) - (avgLoss * lossRate)).toFixed(2))
  }

  const calculateAverageRMultiple = (trades: Trade[]): number => {
    const closedTrades = trades.filter(isClosed)
    if (closedTrades.length === 0) return 0

    let totalR = 0
    let count = 0

    closedTrades.forEach(t => {
      const pnl = parseNumber(getVal(t, 'pnl'))
      const risk = parseNumber(getVal(t, 'risk'))
      
      if (risk > 0) {
        totalR += pnl / risk
        count++
      }
    })

    if (count === 0) return 0
    return Number((totalR / count).toFixed(2))
  }

  const calculateAverageHoldingTime = (trades: Trade[]): { wins: number, losses: number } => {
    const closedTrades = trades.filter(isClosed)
    const wins = closedTrades.filter(t => parseNumber(getVal(t, 'pnl')) > 0)
    const losses = closedTrades.filter(t => parseNumber(getVal(t, 'pnl')) <= 0)

    const getDurationMs = (t: Trade) => {
      const start = parseNumber(getVal(t, 'createdAt') || getVal(t, 'date') || getVal(t, 'date created'))
      const end = parseNumber(getVal(t, 'exit date') || getVal(t, 'exitdate'))
      
      if (start === 0 || end === 0) return 0
      return Math.abs(end - start)
    }

    const avgWinTime = wins.length > 0
      ? wins.reduce((sum, t) => sum + getDurationMs(t), 0) / wins.length
      : 0

    const avgLossTime = losses.length > 0
      ? losses.reduce((sum, t) => sum + getDurationMs(t), 0) / losses.length
      : 0

    return {
      wins: Math.round(avgWinTime),
      losses: Math.round(avgLossTime)
    }
  }

  return {
    calculateProfitFactor,
    calculateWinRate,
    calculateExpectancy,
    calculateAverageRMultiple,
    calculateAverageHoldingTime
  }
}
