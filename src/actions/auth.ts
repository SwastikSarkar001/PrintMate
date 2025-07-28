'use server'

/**
 * NOTE: Server actions are currently not in use in this project.
 * This file is kept for future reference and potential use.
 * If you need to implement server actions, you can refer to this file.
 */

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

// Types for form validation
type SignUpData = {
  firstname: string
  lastname: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

type SignInData = {
  identifier: string
  password: string
}

// Server action for sign up
export async function signUp(formData: FormData) {
  const data: SignUpData = {
    firstname: formData.get("firstname") as string,
    lastname: formData.get("lastname") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  }

  // Input validation
  const newErrors: Record<string, string> = {}

  if (!data.firstname?.trim()) {
    newErrors.firstname = "First name is required"
  } else if (data.firstname.length < 2) {
    newErrors.firstname = "First name must be at least 2 characters"
  }

  if (!data.lastname?.trim()) {
    newErrors.lastname = "Last name is required"
  } else if (data.lastname.length < 2) {
    newErrors.lastname = "Last name must be at least 2 characters"
  }

  if (!data.email?.trim()) {
    newErrors.email = "Email is required"
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    newErrors.email = "Please enter a valid email address"
  }

  if (!data.phone?.trim()) {
    newErrors.phone = "Phone number is required"
  } else if (!/^\+?[\d\s\-\(\)]+$/.test(data.phone)) {
    newErrors.phone = "Please enter a valid phone number"
  }

  if (!data.password) {
    newErrors.password = "Password is required"
  } else if (data.password.length < 8) {
    newErrors.password = "Password must be at least 8 characters"
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  }

  if (data.password !== data.confirmPassword) {
    newErrors.confirmPassword = "Passwords do not match"
  }

  // Return validation errors if any
  if (Object.keys(newErrors).length > 0) {
    return { success: false, errors: newErrors }
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { phone: data.phone }
        ]
      }
    })

    if (existingUser) {
      let message = 'User already exists with this '
      if (existingUser.email === data.email) message += 'email'
      else if (existingUser.phone === data.phone) message += 'phone number'
      
      return { success: false, errors: { general: message } }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        phone: data.phone,
        password: hashedPassword
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        createdAt: true
      }
    })

    return { success: true, user }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, errors: { general: 'An unexpected error occurred. Please try again.' } }
  }
}

// Server action for sign in
export async function signIn(formData: FormData) {
  const data: SignInData = {
    identifier: formData.get("identifier") as string,
    password: formData.get("password") as string,
  }

  // Input validation
  const newErrors: Record<string, string> = {}

  if (!data.identifier?.trim()) {
    newErrors.identifier = "Email or phone is required"
  }

  if (!data.password) {
    newErrors.password = "Password is required"
  }

  // Return validation errors if any
  if (Object.keys(newErrors).length > 0) {
    return { success: false, errors: newErrors }
  }

  try {
    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.identifier },
          { phone: data.identifier }
        ]
      }
    })

    if (!user) {
      return { 
        success: false, 
        errors: { identifier: 'No account found with this email or phone number' } 
      }
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password)
    
    if (!isValidPassword) {
      return { 
        success: false, 
        errors: { password: 'Incorrect password' } 
      }
    }

    // Create session - store user ID in cookie
    // Note: In production, you'd want to use proper session management
    const cookieStore = await cookies()
    cookieStore.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Return user data (excluding password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user
    
    return { success: true, user: userWithoutPassword }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, errors: { general: 'An unexpected error occurred. Please try again.' } }
  }
}

// Server action for sign out
export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete('userId')
  redirect('/auth')
}

// Server action to get current user
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        createdAt: true,
      }
    })

    return user
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// Utility function to check if user is authenticated
export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth')
  }
  
  return user
}