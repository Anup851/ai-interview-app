import { cn } from '../../utils/cn.js'

export default function Card({ children, className }) {
  return <section className={cn('glass rounded-lg p-5', className)}>{children}</section>
}
