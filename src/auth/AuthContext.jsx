import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  loginWithEmail as loginWithEmailRequest,
  loginWithGoogle as loginWithGoogleRequest,
  logout as logoutRequest,
  registerWithEmail as registerWithEmailRequest,
  restoreSession,
} from '../services/authService.js'
import { clearAccessToken, getAccessToken } from '../lib/tokenStorage.js'
import { AuthContext } from './authContext.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(() => Boolean(getAccessToken()))
  const [isAuthRestored, setIsAuthRestored] = useState(() => !getAccessToken())

  useEffect(() => {
    let isMounted = true
    const accessToken = getAccessToken()

    if (!accessToken) {
      return () => {
        isMounted = false
      }
    }

    const restore = async () => {
      setIsAuthLoading(true)

      try {
        const restoredUser = await restoreSession()

        if (isMounted) {
          setUser(restoredUser)
        }
      } catch {
        clearAccessToken()

        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false)
          setIsAuthRestored(true)
        }
      }
    }

    restore()

    return () => {
      isMounted = false
    }
  }, [])

  const runAuthAction = useCallback(async (action) => {
    setIsAuthLoading(true)

    try {
      const nextUser = await action()
      setUser(nextUser)
      return nextUser
    } finally {
      setIsAuthLoading(false)
      setIsAuthRestored(true)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    const restoredUser = await restoreSession()
    setUser(restoredUser)
    return restoredUser
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAuthLoading,
      isAuthRestored,
      registerWithEmail: (payload) => runAuthAction(() => registerWithEmailRequest(payload)),
      loginWithEmail: (payload) => runAuthAction(() => loginWithEmailRequest(payload)),
      loginWithGoogle: (payload) => runAuthAction(() => loginWithGoogleRequest(payload)),
      refreshUser,
      logout: async () => {
        setIsAuthLoading(true)

        try {
          await logoutRequest()
          setUser(null)
        } finally {
          setIsAuthLoading(false)
          setIsAuthRestored(true)
        }
      },
    }),
    [isAuthLoading, isAuthRestored, refreshUser, runAuthAction, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
