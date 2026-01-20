import { describe, it, expect, vi, beforeEach } from 'vitest'
import authMiddleware from '../../../server/middleware/auth'

// Mock nuxt-auth-utils - we'll mock the import that the middleware uses
vi.mock('#auth', () => ({
  getUserSession: vi.fn()
}))

// We need to be able to access the mock in the tests
import { getUserSession } from '#auth'

// Mock H3 event and errors
vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal() as any
  return {
    ...actual,
    createError: vi.fn((err) => err)
  }
})

import { createError } from 'h3'

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ALLOWED_EMAIL = 'allowed@example.com'
  })

  it('allows access to login page without session', async () => {
    const event = {
      path: '/login'
    } as any
    
    vi.mocked(getUserSession).mockResolvedValue({})
    
    await authMiddleware(event)
    
    expect(createError).not.toHaveBeenCalled()
  })

  it('allows access to public assets without session', async () => {
    const event = {
      path: '/_nuxt/some-asset.js'
    } as any
    
    vi.mocked(getUserSession).mockResolvedValue({})
    
    await authMiddleware(event)
    
    expect(createError).not.toHaveBeenCalled()
  })

  it('throws 401 if no session and accessing protected route', async () => {
    const event = {
      path: '/api/trades'
    } as any
    
    vi.mocked(getUserSession).mockResolvedValue({})
    
    await expect(authMiddleware(event)).rejects.toEqual(expect.objectContaining({
      statusCode: 401
    }))
  })

  it('throws 403 if authenticated email is not whitelisted', async () => {
    const event = {
      path: '/'
    } as any
    
    vi.mocked(getUserSession).mockResolvedValue({
      user: { email: 'hacker@example.com' }
    } as any)
    
    await expect(authMiddleware(event)).rejects.toEqual(expect.objectContaining({
      statusCode: 403
    }))
  })

  it('allows access if email is whitelisted', async () => {
    const event = {
      path: '/'
    } as any
    
    vi.mocked(getUserSession).mockResolvedValue({
      user: { email: 'allowed@example.com' }
    } as any)
    
    await authMiddleware(event)
    
    expect(createError).not.toHaveBeenCalled()
  })
})
