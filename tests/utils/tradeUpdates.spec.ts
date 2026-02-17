import { describe, it, expect, vi, afterAll, beforeAll } from 'vitest'
import { processTradeUpdate } from '../../utils/tradeUpdates'

describe('processTradeUpdate', () => {
    // Mock Date to ensure consistent tests
    const mockDate = new Date(2025, 0, 15) // Jan 15, 2025
    
    beforeAll(() => {
        vi.useFakeTimers()
        vi.setSystemTime(mockDate)
    })

    afterAll(() => {
        vi.useRealTimers()
    })

    it('adds Exit Date when status changes from Open to Closed', () => {
        const current = { ID: '1', Status: 'Open', 'Exit Date': '' }
        const update = { Status: 'Closed' }
        
        const result = processTradeUpdate(current, update)
        
        expect(result.Status).toBe('Closed')
        expect(result['Exit Date']).toBe('01/15/2025')
    })

    it('adds Exit Date when status changes from Open to Cancelled', () => {
        const current = { ID: '1', Status: 'Open' }
        const update = { Status: 'Cancelled' }
        
        const result = processTradeUpdate(current, update)
        expect(result['Exit Date']).toBe('01/15/2025')
    })

    it('does NOT add Exit Date if status stays Open', () => {
        const current = { ID: '1', Status: 'Open' }
        const update = { Status: 'Open', Note: 'Still waiting' }
        
        const result = processTradeUpdate(current, update)
        expect(result['Exit Date']).toBeUndefined()
    })

    it('does NOT add Exit Date if status is just updating other fields', () => {
        const current = { ID: '1', Status: 'Open' }
        const update = { Note: 'Updated note' }
        
        const result = processTradeUpdate(current, update)
        expect(result['Exit Date']).toBeUndefined()
    })

    it('does NOT overwrite existing Exit Date if provided in update', () => {
        const current = { ID: '1', Status: 'Open' }
        const update = { Status: 'Closed', 'Exit Date': '12/31/2024' }
        
        const result = processTradeUpdate(current, update)
        expect(result['Exit Date']).toBe('12/31/2024')
    })

    it('handles case-insensitive keys correctly', () => {
        const current = { id: '1', status: 'Open', 'exit date': '' }
        const update = { status: 'Closed' }
        
        const result = processTradeUpdate(current, update)
        expect(result['exit date']).toBe('01/15/2025')
    })
})
