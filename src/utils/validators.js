import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.')
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Enter your full name.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.')
})

export function zodErrors(error) {
  return Object.fromEntries(error.issues.map((issue) => [issue.path[0], issue.message]))
}

