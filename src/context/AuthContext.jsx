import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as authApi from '../lib/auth'
import { ROLE } from '../lib/constants'

export const ROLE_HOME = {
  [ROLE.STUDENT]: '/student',
  [ROLE.LIBRARIAN]: '/librarian',
  [ROLE.SUPER]: '/super',
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authApi.getSessionUser())

  const signIn = useCallback((email, password) => {
    const nextUser = authApi.login(email, password)
    setUser(nextUser)
    return nextUser
  }, [])

  const signOut = useCallback(() => {
    authApi.logout()
    setUser(null)
  }, [])

  const refresh = useCallback(() => {
    const nextUser = authApi.getSessionUser()
    setUser(nextUser)
    return nextUser
  }, [])

  const value = useMemo(
    () => ({
      user,
      signIn,
      signOut,
      refresh,
      isAuthenticated: Boolean(user),
      home: user ? ROLE_HOME[user.role] : '/login',
    }),
    [user, signIn, signOut, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
