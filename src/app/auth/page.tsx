'use client'

import { GalleryVerticalEnd } from "lucide-react"
import LoginForm from "@/components/auth/SignInForm"
import Link from "next/link"
import { useState } from "react"
import { SignupForm } from "@/components/auth/SignUpForm"

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false)

  const switchToSignup = () => {
    setIsSignup(true)
  }

  const switchToLogin = () => {
    setIsSignup(false)
  }
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-3 py-6 md:p-10">
      <div className="fixed -z-100 pointer-events-none inset-x-0 top-0 h-screen bg-[url('/auth.png')] bg-blend-multiply bg-[oklch(0.553_0.013_58.071)]/55" />
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex font-heading items-center gap-2 self-center font-medium text-white">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          PrintMate
        </Link>
        {
          isSignup ? (
            <SignupForm onSwitchToLogin={switchToLogin} />
          ) : (
            <LoginForm onSwitchToSignup={switchToSignup} />
          )
        }
      </div>
    </div>
  )
}
