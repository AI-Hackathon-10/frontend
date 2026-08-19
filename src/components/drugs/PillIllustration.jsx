export default function PillIllustration({ variant = 'pink', size = 'medium', imprint, className = '' }) {
  return (
    <div className={`pill-illustration pill-illustration--${variant} pill-illustration--${size} ${className}`.trim()}>
      <span className="pill-illustration__body">
        {imprint ? <span className="pill-illustration__imprint">{imprint}</span> : null}
      </span>
      <span className="pill-illustration__shadow" />
    </div>
  )
}
