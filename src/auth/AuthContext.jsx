import { useMemo, useState } from 'react'
import {
  loginWithEmail as loginWithEmailRequest,
  loginWithGoogle as loginWithGoogleRequest,
  logout as logoutRequest,
  registerWithEmail as registerWithEmailRequest,
} from '../services/authService.js'
import { AuthContext } from './authContext.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(false)

  const runAuthAction = async (action) => {
    setIsAuthLoading(true)

    try {
      const nextUser = await action()
      setUser(nextUser)
      return nextUser
    } finally {
      setIsAuthLoading(false)
    }
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAuthLoading,
      registerWithEmail: (payload) => runAuthAction(() => registerWithEmailRequest(payload)),
      loginWithEmail: (payload) => runAuthAction(() => loginWithEmailRequest(payload)),
      loginWithGoogle: (payload) => runAuthAction(() => loginWithGoogleRequest(payload)),
      logout: async () => {
        setIsAuthLoading(true)

        try {
          await logoutRequest()
          setUser(null)
        } finally {
          setIsAuthLoading(false)
        }
      },
    }),
    [isAuthLoading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
