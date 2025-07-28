import { z } from 'zod';
import { passwordStrength } from 'check-password-strength'

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or Phone Number is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z
    .email('Invalid email address')
    .min(1, 'Email is required')
    .describe('The email address of the user'),
  phone: z
    .string()
    .regex(/[1-9]\d{9}/, 'Invalid phone number format')
    .min(1, 'Phone number is required')
    .describe('The phone number of the user'),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .refine(
      password => {
        const data = passwordStrength(password)
        return data.contains.length === 4
      },
      { message: 'Password must include at least one uppercase letter, one lowercase letter, one digit, and one special character' }
    )
    .refine(
      password => {
        const data = passwordStrength(password)
        return data.id >= 2
      },
      { message: 'Password is too weak' }
    )
    .describe('The password of the user, must be more than 10 characters long and must contain an uppercase letter, a lowercase letter, a digit and a special symbol'),
  confirmPassword: z
    .string()
    .min(1, 'Confirm password is required')
    .describe('The confirmation of the user password'),
})
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
  })

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;