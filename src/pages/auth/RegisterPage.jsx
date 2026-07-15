import { Link, useNavigate } from 'react-router-dom'
import { Chrome, Github } from 'lucide-react'
import { useMemo, useState } from 'react'
import AuthLayout from './AuthLayout.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { registerSchema, zodErrors } from '../../utils/validators.js'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const { signUp, signInWithProvider, isConfigured } = useAuth()
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const strength = useMemo(() => {
    let score = 0
    if (values.password.length >= 8) score += 1
    if (/[A-Z]/.test(values.password)) score += 1
    if (/[0-9]/.test(values.password)) score += 1
    if (/[^A-Za-z0-9]/.test(values.password)) score += 1
    return ['weak', 'weak', 'medium', 'strong', 'excellent'][score]
  }, [values.password])

  const updateValue = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
    setErrors((current) => ({ ...current, [event.target.name]: '' }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const parsed = registerSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(zodErrors(parsed.error))
      return
    }

    setLoading(true)
    signUp(values)
      .then(() => {
      pushToast('Account created. Your workspace is ready.')
      navigate('/app')
      })
      .catch((error) => pushToast(error.message || 'Signup failed.', 'info'))
      .finally(() => setLoading(false))
  }

  const socialLogin = (provider) => {
    signInWithProvider(provider.toLowerCase())
      .then((result) => {
        if (result?.demo && !isConfigured) {
          pushToast(`${provider} OAuth is unavailable until Supabase auth is configured in this environment.`, 'info')
        }
      })
      .catch((error) => pushToast(error.message || `${provider} signup failed.`, 'info'))
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start with a guided setup for your target role and interview timeline.">
      <div className="grid gap-3 sm:grid-cols-2"><Button variant="outline" icon={Github} onClick={() => socialLogin('GitHub')}>GitHub</Button><Button variant="outline" icon={Chrome} onClick={() => socialLogin('Google')}>Google</Button></div>
      <div className="my-5 h-px bg-zinc-200 dark:bg-white/10" />
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <Input label="Full name" name="name" placeholder="Your name" value={values.name} onChange={updateValue} error={errors.name} />
        <Input label="Email" name="email" type="email" placeholder="you@example.com" value={values.email} onChange={updateValue} error={errors.email} />
        <Input label="Password" name="password" type="password" placeholder="Create password" value={values.password} onChange={updateValue} error={errors.password} />
        <p className="rounded-lg bg-amber-50 p-3 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">Password strength: {strength}. Add uppercase, numbers, and symbols for stronger protection.</p>
        <Button className="w-full" loading={loading}>Create account</Button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">Already have an account? <Link to="/login" className="font-bold text-primary">Log in</Link></p>
    </AuthLayout>
  )
}
