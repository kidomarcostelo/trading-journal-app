import { defineEventHandler, createError, sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
  const publicRoutes = ['/login', '/api/auth/google', '/api/auth/guest']
  // Match both exact path and paths starting with public prefix
  const isPublicRoute = publicRoutes.some(route => event.path === route || event.path.startsWith(route + '/'))
  const isPublicAsset = event.path.startsWith('/_nuxt/') || event.path.startsWith('/_ipx/') || event.path.includes('.')

  if (isPublicRoute || isPublicAsset) {
    return
  }

  const session = await getUserSession(event)
  const config = useRuntimeConfig()
  const allowedEmails = config.allowedEmail?.split(',').map((e: string) => e.trim()) || []
  const isApiRequest = event.path.startsWith('/api/')

  if (!session.user) {
    if (isApiRequest) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Please Login'
      })
    }
    return sendRedirect(event, '/login')
  }

  // Allow guest sessions in demo mode or when authenticated as guest
  if (session.user.isGuest || session.user.email === 'guest@portfolio.demo' || config.demoMode) {
    return
  }

  // If ALLOWED_EMAIL is set, check if the user's email is in the list
  if (allowedEmails.length > 0 && !allowedEmails.includes(session.user.email)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden - Access Denied'
    })
  }
})