import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  await setUserSession(event, {
    user: {
      email: 'guest@portfolio.demo',
      name: 'Guest Trader',
      isGuest: true
    }
  })
  return { success: true }
})
