import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET method for checking if user data already exists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const username = searchParams.get('username')
    const phone = searchParams.get('phone')

    // Check if at least one parameter is provided
    if (!email && !username && !phone) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'At least one parameter (email, username, or phone) is required' 
        },
        { status: 400 }
      )
    }

    const checks: Record<string, boolean> = {}

    // Check email if provided
    if (email) {
      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid email format' 
          },
          { status: 400 }
        )
      }

      const existingEmail = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      })
      checks.email = !!existingEmail
    }

    // Check username if provided
    if (username) {
      // Basic username validation
      if (username.length < 3) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Username must be at least 3 characters' 
          },
          { status: 400 }
        )
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Username can only contain letters, numbers, and underscores' 
          },
          { status: 400 }
        )
      }

      const existingUsername = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
      })
      checks.username = !!existingUsername
    }

    // Check phone if provided
    if (phone) {
      // Basic phone validation
      if (!/^\+?[\d\s\-\(\)]+$/.test(phone)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid phone number format' 
          },
          { status: 400 }
        )
      }

      const existingPhone = await prisma.user.findUnique({
        where: { phone },
        select: { id: true }
      })
      checks.phone = !!existingPhone
    }

    // Check if any field already exists
    const hasConflict = Object.values(checks).some(exists => exists)

    return NextResponse.json(
      { 
        success: true, 
        available: !hasConflict,
        checks,
        message: hasConflict 
          ? 'One or more fields are already taken' 
          : 'All fields are available'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('User check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'An unexpected error occurred while checking user data' 
      },
      { status: 500 }
    )
  }
}

// POST method for batch checking (alternative approach)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, phone } = body

    // Check if at least one field is provided
    if (!email && !username && !phone) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'At least one field (email, username, or phone) is required' 
        },
        { status: 400 }
      )
    }

    const checks: Record<string, boolean> = {}
    const errors: Record<string, string> = {}

    // Validate and check email
    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Invalid email format'
      } else {
        const existingEmail = await prisma.user.findUnique({
          where: { email },
          select: { id: true }
        })
        checks.email = !!existingEmail
      }
    }

    // Validate and check username
    if (username) {
      if (username.length < 3) {
        errors.username = 'Username must be at least 3 characters'
      } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.username = 'Username can only contain letters, numbers, and underscores'
      } else {
        const existingUsername = await prisma.user.findUnique({
          where: { username },
          select: { id: true }
        })
        checks.username = !!existingUsername
      }
    }

    // Validate and check phone
    if (phone) {
      if (!/^\+?[\d\s\-\(\)]+$/.test(phone)) {
        errors.phone = 'Invalid phone number format'
      } else {
        const existingPhone = await prisma.user.findUnique({
          where: { phone },
          select: { id: true }
        })
        checks.phone = !!existingPhone
      }
    }

    // Return validation errors if any
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          errors,
          message: 'Validation errors occurred'
        },
        { status: 400 }
      )
    }

    // Check if any field already exists
    const hasConflict = Object.values(checks).some(exists => exists)

    return NextResponse.json(
      { 
        success: true, 
        available: !hasConflict,
        checks,
        message: hasConflict 
          ? 'One or more fields are already taken' 
          : 'All fields are available'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('User check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'An unexpected error occurred while checking user data' 
      },
      { status: 500 }
    )
  }
}