import type { Trade } from '~/types'

export const useAnalytics = () => {
  
  const getClosedTrades = (trades: Trade[]) => {
    return trades.filter(t => t.status === 'Closed' || t.Status === 'Closed')
  }

  const calculateProfitFactor = (trades: Trade[]): number => {
    const closed = getClosedTrades(trades)
    let grossProfit = 0
    let grossLoss = 0

    closed.forEach(t => {
      const pnl = Number(t.pnl || t.PnL || 0)
      if (pnl > 0) grossProfit += pnl
      else grossLoss += Math.abs(pnl)
    })

    if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0
    return Number((grossProfit / grossLoss).toFixed(2))
  }

  const calculateWinRate = (trades: Trade[]): number => {
    const closed = getClosedTrades(trades)
    if (closed.length === 0) return 0
    
    const wins = closed.filter(t => Number(t.pnl || t.PnL || 0) > 0).length
    return Number(((wins / closed.length) * 100).toFixed(2))
  }

  const calculateExpectancy = (trades: Trade[]): number => {
    const closed = getClosedTrades(trades)
    if (closed.length === 0) return 0

    const wins = closed.filter(t => Number(t.pnl || t.PnL || 0) > 0)
    const losses = closed.filter(t => Number(t.pnl || t.PnL || 0) <= 0)

    const avgWin = wins.length > 0 
      ? wins.reduce((sum, t) => sum + Number(t.pnl || t.PnL || 0), 0) / wins.length 
      : 0
    
    const avgLoss = losses.length > 0 
      ? Math.abs(losses.reduce((sum, t) => sum + Number(t.pnl || t.PnL || 0), 0)) / losses.length 
      : 0

    const winRate = wins.length / closed.length
    const lossRate = losses.length / closed.length

    return Number(((avgWin * winRate) - (avgLoss * lossRate)).toFixed(2))
  }

  const calculateAverageRMultiple = (trades: Trade[]): number => {
    // Placeholder as we lack explicit 'Risk' or 'Initial Stop' data in the Trade model currently.
    // Ideally: Sum(PnL / Risk) / TotalTrades
    return 0
  }

  const calculateAverageHoldingTime = (trades: Trade[]): { wins: number, losses: number } => {
    const closed = getClosedTrades(trades)
    
    const wins = closed.filter(t => Number(t.pnl || t.PnL || 0) > 0)
    const losses = closed.filter(t => Number(t.pnl || t.PnL || 0) <= 0)

    const getDuration = (t: Trade) => {
      const start = Number(t.createdAt || t.Date)
      const end = Number(t['Exit Date'])
      if (isNaN(start) || isNaN(end)) return 0
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
