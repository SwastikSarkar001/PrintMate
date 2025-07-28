import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { RegisterData, registerSchema } from '@/lib/zod-validation'
import data from '@/data/sidebar-data'
import { UserAuthResponse } from '@/types/apis'

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json()

    // Input validation
    const newErrors: Record<string, string> = {}

    const validationResult = registerSchema.safeParse(body)

    if (!validationResult.success) {
      validationResult.error.issues.map((error) => {
        newErrors[error.path[0] as string] = error.message
      })
    }

    if (Object.keys(newErrors).length > 0) {
      return NextResponse.json<UserAuthResponse>(
        { success: false, message: 'Validation failed', errors: newErrors },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: body.email },
          { phone: body.phone }
        ]
      }
    })

    if (existingUser) {
      let message = 'User already exists with this '
      if (existingUser.email === body.email) message += 'email'
      else if (existingUser.phone === body.phone) message += 'phone number'
      
      return NextResponse.json<UserAuthResponse>(
        { success: false, message },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 12)
    console.log('Hola!')
    // Create user
    const user = await prisma.user.create({
      data: {
        email: body.email,
        phone: body.phone,
        password: hashedPassword
      },
      omit: {
        password: true
      }
    })

    const cookieStore = await cookies()
    cookieStore.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json<UserAuthResponse>(
      { success: true, data: { user } },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json<UserAuthResponse>(
      { success: false, message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}