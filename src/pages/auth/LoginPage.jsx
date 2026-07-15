import { Link, useNavigate } from 'react-router-dom'
import { Chrome, Github } from 'lucide-react'
import { useState } from 'react'
import AuthLayout from './AuthLayout.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { loginSchema, zodErrors } from '../../utils/validators.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const { signIn, signInWithProvider, isConfigured } = useAuth()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const updateValue = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
    setErrors((current) => ({ ...current, [event.target.name]: '' }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const parsed = loginSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(zodErrors(parsed.error))
      return
    }

    setLoading(true)
    signIn(values)
      .then(() => {
      pushToast('Logged in successfully. Opening your dashboard.')
      navigate('/app')
      })
      .catch((error) => pushToast(error.message || 'Login failed.', 'info'))
      .finally(() => setLoading(false))
  }

  const socialLogin = (provider) => {
    signInWithProvider(provider.toLowerCase())
      .then((result) => {
        if (result?.demo && !isConfigured) {
          pushToast(`${provider} OAuth is unavailable until Supabase auth is configured in this environment.`, 'info')
        }
      })
      .catch((error) => pushToast(error.message || `${provider} login failed.`, 'info'))
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue your interview preparation workspace.">
      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" icon={Github} onClick={() => socialLogin('GitHub')}>GitHub</Button>
        <Button variant="outline" icon={Chrome} onClick={() => socialLogin('Google')}>Google</Button>
      </div>
      <div className="my-5 h-px bg-zinc-200 dark:bg-white/10" />
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <Input label="Email" name="email" type="email" placeholder="you@example.com" value={values.email} onChange={updateValue} error={errors.email} />
        <Input label="Password" name="password" type="password" placeholder="Enter password" value={values.password} onChange={updateValue} error={errors.password} />
        <div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2 font-medium text-zinc-600 dark:text-zinc-300"><input type="checkbox" className="rounded border-zinc-300 text-primary focus:ring-primary" />Remember me</label><Link to="/forgot-password" className="font-bold text-primary">Forgot password?</Link></div>
        <Button className="w-full" loading={loading}>Log in</Button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">New here? <Link to="/register" className="font-bold text-primary">Create account</Link></p>
    </AuthLayout>
  )
}
