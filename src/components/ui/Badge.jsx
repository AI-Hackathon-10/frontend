export default function Badge({ children, tone = 'blue', className = '' }) {
  return <span className={`badge badge--${tone} ${className}`.trim()}>{children}</span>
}
