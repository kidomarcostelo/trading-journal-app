export interface ChipConfig {
  id: string
  label: string
  color: string
  category: 'Strategy' | 'Psychology' | 'Mistake' | 'Setup' | string
}

export interface TradeEntry {
  date: string
  pair: string
  type: 'Long' | 'Short'
  entryPrice: number
  exitPrice?: number
  size: number
  pnl?: number
  pnlPercentage?: number
  imageBefore?: string
  imageAfter?: string
  notes?: string
  tags: string[] // IDs of ChipConfigs
}

export interface Trade extends TradeEntry {
  id: string
  createdAt: string
}

export interface AppConfig {
  spreadsheetId: string
  chips: ChipConfig[]
}
