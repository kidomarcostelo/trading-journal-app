export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    await setUserSession(event, {
      user: {
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    })
    return sendRedirect(event, '/')
  },
  // Optional: match exact email in onSuccess if we want even stricter check before session creation
  // But our middleware already handles it.
})
