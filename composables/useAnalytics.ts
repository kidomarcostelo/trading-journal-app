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
    const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase())
    return foundKey ? obj[foundKey] : undefined
  }

  const getClosedTrades = (trades: Trade[]) => {
    return trades.filter(t => {
      const status = String(getVal(t, 'status') || '').trim().toLowerCase()
      return status === 'closed'
    })
  }

  const calculateProfitFactor = (trades: Trade[]): number => {
    const closed = getClosedTrades(trades)
    let grossProfit = 0
    let grossLoss = 0

    closed.forEach(t => {
      const pnl = parseNumber(getVal(t, 'pnl'))
      if (pnl > 0) grossProfit += pnl
      else grossLoss += Math.abs(pnl)
    })

    if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0
    return Number((grossProfit / grossLoss).toFixed(2))
  }

  const calculateWinRate = (trades: Trade[]): number => {
    const closed = getClosedTrades(trades)
    if (closed.length === 0) return 0
    
    const wins = closed.filter(t => parseNumber(getVal(t, 'pnl')) > 0).length
    return Number(((wins / closed.length) * 100).toFixed(2))
  }

  const calculateExpectancy = (trades: Trade[]): number => {
    const closed = getClosedTrades(trades)
    if (closed.length === 0) return 0

    const wins = closed.filter(t => parseNumber(getVal(t, 'pnl')) > 0)
    const losses = closed.filter(t => parseNumber(getVal(t, 'pnl')) <= 0)

    const avgWin = wins.length > 0 
      ? wins.reduce((sum, t) => sum + parseNumber(getVal(t, 'pnl')), 0) / wins.length 
      : 0
    
    const avgLoss = losses.length > 0 
      ? Math.abs(losses.reduce((sum, t) => sum + parseNumber(getVal(t, 'pnl')), 0)) / losses.length 
      : 0

    const winRate = wins.length / closed.length
    const lossRate = losses.length / closed.length

    return Number(((avgWin * winRate) - (avgLoss * lossRate)).toFixed(2))
  }

  const calculateAverageRMultiple = (trades: Trade[]): number => {
    const closed = getClosedTrades(trades)
    if (closed.length === 0) return 0

    let totalR = 0
    let count = 0

    closed.forEach(t => {
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
    const closed = getClosedTrades(trades)
    
    const wins = closed.filter(t => parseNumber(getVal(t, 'pnl')) > 0)
    const losses = closed.filter(t => parseNumber(getVal(t, 'pnl')) <= 0)

    const getDuration = (t: Trade) => {
      const start = parseNumber(getVal(t, 'createdAt') || getVal(t, 'date') || getVal(t, 'date created'))
      const end = parseNumber(getVal(t, 'exit date'))
      if (start === 0 || end === 0) return 0
      return end - start
    }

    const avgWinTime = wins.length > 0
      ? wins.reduce((sum, t) => sum + getDuration(t), 0) / wins.length
      : 0

    const avgLossTime = losses.length > 0
      ? losses.reduce((sum, t) => sum + getDuration(t), 0) / losses.length
      : 0

    return {
      wins: avgWinTime,
      losses: avgLossTime
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
