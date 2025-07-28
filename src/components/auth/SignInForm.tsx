"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { UserLoginRequestBody } from "@/types/types"

interface LoginFormProps extends React.ComponentPropsWithoutRef<"div"> {
  onSwitchToSignup: () => void
}

export default function LoginForm({ className, onSwitchToSignup, ...props }: LoginFormProps) {
  const [formData, setFormData] = useState<UserLoginRequestBody>({
    identifier: "", // Can be email or phone
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.identifier.trim()) {
      newErrors.identifier = "Email or phone is required"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Login successful!');
        
        // Store user data in localStorage (you might want to use a proper state management solution)
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Redirect to dashboard or home page
        // router.push('/dashboard')
        window.location.href = '/dashboard'
      } else {
        toast.error(result.message || 'Login failed');
        
        // Handle specific field errors
        if (response.status === 404) {
          setErrors({ identifier: 'No account found with this email or phone' });
        } else if (response.status === 401) {
          setErrors({ password: 'Incorrect password' });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="login-identifier">Email or Phone</Label>
                  <Input
                    id="login-identifier"
                    type="text"
                    placeholder="john@example.com or +919876543210"
                    value={formData.identifier}
                    onChange={(e) => handleInputChange("identifier", e.target.value)}
                    className={errors.identifier ? "border-red-500" : ""}
                    disabled={isLoading}
                    required
                  />
                  {errors.identifier && <p className="text-sm text-red-500">{errors.identifier}</p>}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="login-password">Password</Label>
                    <a 
                      href="/auth/forgot-password" 
                      className="text-right ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={errors.password ? "border-red-500" : ""}
                    disabled={isLoading}
                    required
                  />
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>
                <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  className="underline cursor-pointer underline-offset-4 hover:text-primary transition-colors"
                  disabled={isLoading}
                >
                  Sign up
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-stone-400 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-stone-300 [&_a]:transition-colors">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}