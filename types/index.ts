export interface ChipOption {
  label: string
  color?: string // Optional, as we might just have string values now
}

export interface ChipCategory {
  id: string // The header name (e.g., "Strategies")
  values: string[] // The column values
}

// Deprecating the old ChipConfig for now, or aliasing it
export type ChipConfig = ChipCategory

export interface TradeEntry {
  [key: string]: any // Allow dynamic keys based on headers
  id?: string
  createdAt?: string
}

export interface Trade extends TradeEntry {
  id: string
  createdAt: string
}

export interface AppConfig {
  spreadsheetId: string
  chips: ChipCategory[]
}
