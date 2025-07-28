import { createContext } from 'react'
import { UserWithoutPassword } from '@/types/types'
export type AuthContextType = {
  user: UserWithoutPassword | null
  loading: boolean
  login: (userData: UserWithoutPassword) => void
  logout: () => void
  updateUser: (userData: Partial<UserWithoutPassword>) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export default AuthContext