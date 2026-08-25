import { describe, it, expect, vi, beforeEach } from 'vitest'
import guestHandler from '../../../server/api/auth/guest.post'

describe('POST /api/auth/guest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('setUserSession', vi.fn().mockResolvedValue(true))
  })

  it('sets a guest session successfully', async () => {
    const event = {} as any
    const response = await guestHandler(event)

    expect(setUserSession).toHaveBeenCalledWith(event, {
      user: {
        email: 'guest@portfolio.demo',
        name: 'Guest Trader',
        isGuest: true
      }
    })
    expect(response).toEqual({ success: true })
  })
})
