import { createContext, useContext, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const pushToast = (message, type = 'success') => {
    const id = crypto.randomUUID()
    setToasts((items) => [...items, { id, message, type }])
    window.setTimeout(() => setToasts((items) => items.filter((toast) => toast.id !== id)), 3600)
  }

  const value = useMemo(() => ({ pushToast }), [])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              className="glass flex items-start gap-3 rounded-lg p-4"
            >
              {toast.type === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" /> : <Info className="mt-0.5 h-5 w-5 text-indigo-500" />}
              <p className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-100">{toast.message}</p>
              <button className="focus-ring rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-white" onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))} aria-label="Dismiss toast">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
