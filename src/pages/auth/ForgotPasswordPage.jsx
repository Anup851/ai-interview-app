import { Link } from 'react-router-dom'
import { useState } from 'react'
import AuthLayout from './AuthLayout.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ForgotPasswordPage() {
  const { pushToast } = useToast()
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!email.includes('@')) {
      setError('Enter a valid email address.')
      return
    }
    setError('')
    resetPassword(email)
      .then(() => {
        setSent(true)
        pushToast('Password reset email sent.')
      })
      .catch((error) => pushToast(error.message || 'Reset email failed.', 'info'))
  }

  return (
    <AuthLayout title="Reset password" subtitle="Enter your email and we will send a secure reset link.">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} error={error} />
        <Button>{sent ? 'Send again' : 'Send reset link'}</Button>
      </form>
      {sent ? <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">Check your inbox for a secure reset link.</p> : null}
      <p className="mt-6 text-center text-sm text-zinc-500"><Link to="/login" className="font-bold text-primary">Back to login</Link></p>
    </AuthLayout>
  )
}
