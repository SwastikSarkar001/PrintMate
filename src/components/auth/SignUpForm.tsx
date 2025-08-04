"use client"

import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { RegisterData, registerSchema } from '@/lib/zod-validation'
import { CheckAvailabilityResponse, UserAuthResponse } from "@/types/apis"

interface SignupFormProps extends React.ComponentPropsWithoutRef<"div"> {
  onSwitchToLogin: () => void
}

export function SignupForm({ className, onSwitchToLogin, ...props }: SignupFormProps) {
  const { login } = useAuth()
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [checkingAvailability, setCheckingAvailability] = useState<Record<string, boolean>>({})
  const router = useRouter()

  const validateForm = () => {
    const validationResult = registerSchema.safeParse(formData)
    if (validationResult.success) {
      setErrors({})
    }
    else {
      const newErrors: Record<string, string> = {}
      validationResult.error.issues.map((error) => {
        const field = error.path[0] as string
        newErrors[field] = error.message
      })
      setErrors(newErrors)
    }
    return validationResult.success
  }

  const checkAvailability = async (field: 'email' | 'phone', value: string) => {
    if (!value.trim()) return;

    setCheckingAvailability(prev => ({ ...prev, [field]: true }));

    try {
      const response = await fetch('/api/users/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ field, value }),
      });

      const result: CheckAvailabilityResponse = await response.json();

      if (result.success && !result.data.available) {
        setErrors(prev => ({ 
          ...prev, 
          [field]: `This ${field} is already taken` 
        }));
      } else if (errors[field]?.includes('already taken')) {
        // Clear the error if it's now available
        setErrors(prev => ({ ...prev, [field]: "" }));
      }
    } catch (error) {
      console.error(`Error checking ${field} availability:`, error);
    } finally {
      setCheckingAvailability(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      });

      const result: UserAuthResponse = await response.json();

      if (result.success) {
        toast.success('Account created successfully!');
        login(result.data.user);
        router.push('/dashboard')
      } else {
        toast.error(result.message || 'Registration failed');
        
        // Handle specific field errors (e.g., duplicate email or phone)
        if (result.message.includes('email')) {
          setErrors({ email: result.message });
        } else if (result.message.includes('phone')) {
          setErrors({ phone: result.message });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
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

  const handleBlur = (field: 'email' | 'phone', value: string) => {
    // Check availability when user leaves the field
    if (['email', 'phone'].includes(field) && value.trim()) {
      checkAvailability(field, value);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>Fill in your details to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-4">
                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      onBlur={(e) => handleBlur("email", e.target.value)}
                      className={errors.email ? "border-red-500" : ""}
                      disabled={isLoading}
                      required
                    />
                    {checkingAvailability.email && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                  </div>
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      onBlur={(e) => handleBlur("phone", e.target.value)}
                      className={errors.phone ? "border-red-500" : ""}
                      disabled={isLoading}
                      required
                    />
                    {checkingAvailability.phone && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                  </div>
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={errors.password ? "border-red-500" : ""}
                    disabled={isLoading}
                    required
                  />
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="grid gap-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={errors.confirmPassword ? "border-red-500" : ""}
                    disabled={isLoading}
                    required
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="underline cursor-pointer underline-offset-4 hover:text-primary transition-colors"
                  disabled={isLoading}
                >
                  Sign in
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