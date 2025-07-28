import { createContext } from 'react'
import { User } from '@/lib/auth-context'

export type AuthContextType = {
  user: User | null
  loading: boolean
  login: (userData: User) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export default AuthContext