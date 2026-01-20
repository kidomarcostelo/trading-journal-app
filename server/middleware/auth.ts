import { defineEventHandler, createError, sendRedirect } from 'h3'
import { getUserSession } from '#auth'

export default defineEventHandler(async (event) => {
  const publicRoutes = ['/login', '/api/auth/google']
  // Match both exact path and paths starting with public prefix
  const isPublicRoute = publicRoutes.some(route => event.path === route || event.path.startsWith(route + '/'))
  const isPublicAsset = event.path.startsWith('/_nuxt/') || event.path.startsWith('/_ipx/') || event.path.includes('.')

  if (isPublicRoute || isPublicAsset) {
    return
  }

  const session = await getUserSession(event)
  const allowedEmail = process.env.ALLOWED_EMAIL
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

  if (allowedEmail && session.user.email !== allowedEmail) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden - Access Denied'
    })
  }
})
