import { describe, it, expect, vi, beforeEach } from 'vitest'
import authMiddleware from '../../../server/middleware/auth'

// Mock sendRedirect and createError from h3
vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal() as any
  return {
    ...actual,
    createError: vi.fn((err) => err),
    sendRedirect: vi.fn()
  }
})

import { createError, sendRedirect } from 'h3'

// Mock global getUserSession
const getUserSession = vi.fn()
vi.stubGlobal('getUserSession', getUserSession)

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

  it('redirects to /login if no session and accessing protected page', async () => {
    const event = {
      path: '/'
    } as any
    
    vi.mocked(getUserSession).mockResolvedValue({})
    
    await authMiddleware(event)
    
    expect(sendRedirect).toHaveBeenCalledWith(event, '/login')
  })

  it('throws 401 if no session and accessing protected API', async () => {
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
