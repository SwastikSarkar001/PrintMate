import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Types for form validation
type SignUpData = {
  firstname: string
  lastname: string
  email: string
  username: string
  phone: string
  password: string
  confirmPassword: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data: SignUpData = {
      firstname: body.firstname,
      lastname: body.lastname,
      email: body.email,
      username: body.username,
      phone: body.phone,
      password: body.password,
      confirmPassword: body.confirmPassword,
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

    if (!data.username?.trim()) {
      newErrors.username = "Username is required"
    } else if (data.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores"
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
      return NextResponse.json(
        { success: false, errors: newErrors },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username },
          { phone: data.phone }
        ]
      }
    })

    if (existingUser) {
      let message = 'User already exists with this '
      if (existingUser.email === data.email) message += 'email'
      else if (existingUser.username === data.username) message += 'username'  
      else if (existingUser.phone === data.phone) message += 'phone number'
      
      return NextResponse.json(
        { success: false, errors: { general: message } },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        username: data.username,
        phone: data.phone,
        password: hashedPassword
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        username: true,
        phone: true,
        createdAt: true
      }
    })

    return NextResponse.json(
      { success: true, user },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, errors: { general: 'An unexpected error occurred. Please try again.' } },
      { status: 500 }
    )
  }
}