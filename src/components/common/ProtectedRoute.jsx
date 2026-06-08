import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-3 text-sm font-bold text-zinc-600 dark:text-zinc-300">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading workspace
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

