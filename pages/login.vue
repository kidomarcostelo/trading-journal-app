<script setup lang="ts">
import { LayoutDashboard, Lock, Sparkles } from 'lucide-vue-next'

definePageMeta({
  layout: false,
  auth: false
})

const { loggedIn, user, fetch } = useUserSession()
const isEnteringGuest = ref(false)

watch(loggedIn, (val) => {
  if (val) navigateTo('/dashboard')
}, { immediate: true })

const login = () => {
  window.location.href = '/api/auth/google'
}

const exploreAsGuest = async () => {
  isEnteringGuest.value = true
  try {
    await $fetch('/api/auth/guest', { method: 'POST' })
    await fetch()
    await navigateTo('/dashboard')
  } catch (err) {
    console.error('Failed to start guest session:', err)
  } finally {
    isEnteringGuest.value = false
  }
}
</script>

<template>
  <div class="dark">
    <div class="h-screen flex items-center justify-center bg-terminal-black text-terminal-text font-sans p-6">
      <div class="max-w-md w-full space-y-8 bg-terminal-dark border border-terminal-gray p-8 rounded-xl shadow-2xl relative overflow-hidden group">
        <!-- Decorative Background elements -->
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-terminal-accent/5 rounded-full blur-3xl group-hover:bg-terminal-accent/10 transition-colors duration-1000"></div>
        
        <div class="text-center relative">
          <div class="inline-flex items-center justify-center p-4 bg-terminal-black border border-terminal-gray rounded-2xl mb-6 group-hover:border-terminal-accent/30 transition-colors">
            <LayoutDashboard class="w-10 h-10 text-terminal-accent" />
          </div>
          <h1 class="text-3xl font-bold text-terminal-highlight tracking-tight mb-2">Trading Journal</h1>
          <p class="text-terminal-text/60 text-sm">Full-stack performance analytics & trade management.</p>
        </div>

        <div class="space-y-4 relative">
          <!-- Primary: Live Demo / Guest Access -->
          <button 
            @click="exploreAsGuest"
            :disabled="isEnteringGuest"
            class="w-full flex items-center justify-center gap-3 bg-terminal-accent hover:bg-emerald-400 text-zinc-950 font-bold py-3.5 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
          >
            <Sparkles class="w-5 h-5 text-zinc-950" />
            {{ isEnteringGuest ? 'Entering Demo...' : 'Explore Live Demo (Guest)' }}
          </button>

          <div class="relative flex py-1 items-center">
            <div class="flex-grow border-t border-terminal-gray/60"></div>
            <span class="flex-shrink mx-4 text-[10px] uppercase font-bold tracking-widest text-terminal-text/40">Or</span>
            <div class="flex-grow border-t border-terminal-gray/60"></div>
          </div>

          <!-- Secondary: Google OAuth for Admin -->
          <button 
            @click="login"
            class="w-full flex items-center justify-center gap-3 bg-terminal-black hover:bg-zinc-800 border border-terminal-gray text-terminal-highlight font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
          
          <div class="flex items-center gap-2 justify-center text-[10px] uppercase tracking-widest text-terminal-text/30 font-bold pt-1">
            <Lock class="w-3 h-3" />
            Portfolio Preview Ready
          </div>
        </div>

        <div class="pt-6 border-t border-terminal-gray/50 text-center relative">
          <p class="text-[11px] text-terminal-text/40 leading-relaxed">
            Click <strong>Explore Live Demo</strong> to test all features with pre-loaded mock data. Google Sign-in is restricted to the administrator.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
