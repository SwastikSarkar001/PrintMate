"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "sonner"

interface SignupFormProps extends React.ComponentPropsWithoutRef<"div"> {
  onSwitchToLogin: () => void
}

export function SignupForm({ className, onSwitchToLogin, ...props }: SignupFormProps) {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [checkingAvailability, setCheckingAvailability] = useState<Record<string, boolean>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstname.trim()) {
      newErrors.firstname = "First name is required"
    } else if (formData.firstname.length < 2) {
      newErrors.firstname = "First name must be at least 2 characters"
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = "Last name is required"
    } else if (formData.lastname.length < 2) {
      newErrors.lastname = "Last name must be at least 2 characters"
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const checkAvailability = async (field: 'email' | 'username' | 'phone', value: string) => {
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

      const result = await response.json();

      if (result.success && !result.available) {
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
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          username: formData.username,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (result.ok) {
        toast.success('Account created successfully! Please sign in.');
        
        // Switch to login form
        onSwitchToLogin();
        
        // Optional: Pre-fill the login form with email
        // You might want to pass this data to the parent component
      } else {
        toast.error(result.message || 'Registration failed');
        
        // Handle specific field errors (e.g., duplicate email/username/phone)
        if (result.message.includes('email')) {
          setErrors({ email: result.message });
        } else if (result.message.includes('username')) {
          setErrors({ username: result.message });
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

  const handleBlur = (field: 'email' | 'username' | 'phone', value: string) => {
    // Check availability when user leaves the field
    if (['email', 'username', 'phone'].includes(field) && value.trim()) {
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
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="firstname">First Name</Label>
                    <Input
                      id="firstname"
                      type="text"
                      placeholder="John"
                      value={formData.firstname}
                      onChange={(e) => handleInputChange("firstname", e.target.value)}
                      className={errors.firstname ? "border-red-500" : ""}
                      disabled={isLoading}
                      required
                    />
                    {errors.firstname && <p className="text-sm text-red-500">{errors.firstname}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastname">Last Name</Label>
                    <Input
                      id="lastname"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastname}
                      onChange={(e) => handleInputChange("lastname", e.target.value)}
                      className={errors.lastname ? "border-red-500" : ""}
                      disabled={isLoading}
                      required
                    />
                    {errors.lastname && <p className="text-sm text-red-500">{errors.lastname}</p>}
                  </div>
                </div>

                {/* Username */}
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      onBlur={(e) => handleBlur("username", e.target.value)}
                      className={errors.username ? "border-red-500" : ""}
                      disabled={isLoading}
                      required
                    />
                    {checkingAvailability.username && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                  </div>
                  {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                </div>

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