import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { LoginData, loginSchema } from '@/lib/zod-validation'
import { UserAuthResponse } from '@/types/apis'

export async function POST(request: NextRequest) {
  try {
    const body: LoginData = await request.json()

    // Input validation
    const newErrors: Record<string, string> = {}

    const validationResult = loginSchema.safeParse(body)

    if (!validationResult.success) {
      validationResult.error.issues.map(error => {
        newErrors[error.path[0] as string] = error.message
      })
    }

    if (Object.keys(newErrors).length > 0) {
      return NextResponse.json<UserAuthResponse>(
        { success: false, message: 'Validation failed', errors: newErrors },
        { status: 400 }
      )
    }

    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: body.identifier },
          { phone: body.identifier }
        ]
      }
    })

    if (!user) {
      return NextResponse.json<UserAuthResponse>(
        { 
          success: false, 
          message: 'No account found with this email or phone number'
        },
        { status: 401 }
      )
    }
    // Exclude password from user data
    const { password: userPassword, ...userWithoutPassword } = user

    // Verify password
    const isValidPassword = await bcrypt.compare(body.password, userPassword)
    // const isValidPassword = data.password === user.password
    
    if (!isValidPassword) {
      return NextResponse.json<UserAuthResponse>(
        { 
          success: false, 
          message: 'Incorrect password' 
        },
        { status: 401 }
      )
    }

    // Create session - store user ID in cookie
    const cookieStore = await cookies()
    cookieStore.set('userId', userWithoutPassword.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    return NextResponse.json<UserAuthResponse>(
      { success: true, data: { user: userWithoutPassword } },
      { status: 200 }
    )

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json<UserAuthResponse>(
      { success: false, message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}