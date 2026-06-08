import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AuthRedirectHandler() {
  const location = useLocation()
  const navigate = useNavigate()
  const { loading, user } = useAuth()

  useEffect(() => {
    const hasOAuthHash = location.hash.includes('access_token=') || location.hash.includes('refresh_token=')
    if (!hasOAuthHash || loading) return

    if (user) {
      navigate('/app', { replace: true })
      return
    }

    navigate('/login', { replace: true })
  }, [loading, location.hash, navigate, user])

  return null
}
