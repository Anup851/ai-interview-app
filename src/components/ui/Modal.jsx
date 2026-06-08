import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import Button from './Button.jsx'

export default function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/60 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="glass w-full max-w-lg rounded-lg p-5" initial={{ y: 18, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 18, scale: 0.98 }}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white">{title}</h2>
              <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal"><X className="h-4 w-4" /></Button>
            </div>
            <div className="mt-4">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
