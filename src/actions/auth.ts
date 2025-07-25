'use server'

export async function signUp(formData: FormData) {
  const username = formData.get("username") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  const newErrors: Record<string, string> = {}

  if (!username) {
    newErrors.username = "Username is required"
  } else if (username.length < 3) {
    newErrors.username = "Username must be at least 3 characters"
  }

  if (email) {
    newErrors.email = "Email is required"
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    newErrors.email = "Please enter a valid email address"
  }

  if (password) {
    newErrors.password = "Password is required"
  } else if (password.length < 8) {
    newErrors.password = "Password must be at least 8 characters"
  }

  if (password !== confirmPassword) {
    newErrors.confirmPassword = "Passwords do not match"
  }
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return newErrors
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const newErrors: Record<string, string> = {}

  if (!email) {
    newErrors.email = "Email is required"
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    newErrors.email = "Please enter a valid email address"
  }

  if (!password) {
    newErrors.password = "Password is required"
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return newErrors
}