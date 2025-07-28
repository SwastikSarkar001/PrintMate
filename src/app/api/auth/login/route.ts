import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { UserLoginRequestBody } from '@/types/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data: UserLoginRequestBody = {
      identifier: body.identifier,
      password: body.password,
    }

    // Input validation
    const newErrors: Record<string, string> = {}

    if (!data.identifier?.trim()) {
      newErrors.identifier = "Email, username, or phone is required"
    }

    if (!data.password) {
      newErrors.password = "Password is required"
    }

    // Return validation errors if any
    if (Object.keys(newErrors).length > 0) {
      return NextResponse.json(
        { success: false, errors: newErrors },
        { status: 400 }
      )
    }

    // Find user by email, username, or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.identifier },
          { username: data.identifier },
          { phone: data.identifier }
        ]
      }
    })

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          errors: { identifier: 'No account found with this email, username, or phone number' } 
        },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { 
          success: false, 
          errors: { password: 'Incorrect password' } 
        },
        { status: 401 }
      )
    }

    // Create session - store user ID in cookie
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
    
    return NextResponse.json(
      { success: true, user: userWithoutPassword },
      { status: 200 }
    )

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, errors: { general: 'An unexpected error occurred. Please try again.' } },
      { status: 500 }
    )
  }
}

// Optional: Add GET method for checking authentication status
export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        username: true,
        phone: true,
        createdAt: true,
      }
    })

    if (!user) {
      // Clear invalid cookie
      cookieStore.delete('userId')
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    )

  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}