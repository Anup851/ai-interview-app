import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { demoProfile, demoUser } from '../lib/demoUser.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(isSupabaseConfigured ? null : demoUser)
  const [profile, setProfile] = useState(isSupabaseConfigured ? null : demoProfile)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    let mounted = true

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setUser(data.session?.user ?? null)
      setLoading(false)
    }

    loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !user) {
      if (!isSupabaseConfigured) setProfile(demoProfile)
      return
    }

    const loadProfile = async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (!error && data) setProfile(data)
      if (!data) {
        const fallback = {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Candidate',
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          target_role: user.user_metadata?.target_role || 'Software Engineer'
        }
        await supabase.from('profiles').upsert(fallback)
        setProfile(fallback)
      }
    }

    loadProfile()
  }, [user])

  const signIn = async ({ email, password }) => {
    if (!isSupabaseConfigured) {
      setUser({ ...demoUser, email })
      setProfile({ ...demoProfile, email })
      return { user: demoUser }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signUp = async ({ name, email, password }) => {
    if (!isSupabaseConfigured) {
      setUser({ ...demoUser, email, user_metadata: { full_name: name } })
      setProfile({ ...demoProfile, full_name: name, email })
      return { user: demoUser }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
    if (error) throw error
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: name,
        email,
        target_role: 'Software Engineer'
      })
    }
    return data
  }

  const resetPassword = async (email) => {
    if (!isSupabaseConfigured) return { demo: true }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`
    })
    if (error) throw error
    return data
  }

  const signInWithProvider = async (provider) => {
    if (!isSupabaseConfigured) return { demo: true }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/app`,
        queryParams: provider === 'google' ? { access_type: 'offline', prompt: 'consent' } : undefined
      }
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut()
    setUser(isSupabaseConfigured ? null : demoUser)
    setProfile(isSupabaseConfigured ? null : demoProfile)
  }

  const updateProfile = async (updates) => {
    if (!user) throw new Error('You must be signed in.')
    const nextProfile = {
      ...(profile || {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        email: user.email || '',
        target_role: ''
      }),
      ...updates
    }
    setProfile(nextProfile)
    if (!isSupabaseConfigured) return nextProfile
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', user.id).select('*').single()
    if (error) throw error
    setProfile(data)
    return data
  }

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    isConfigured: isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithProvider,
    updateProfile
  }), [user, profile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
