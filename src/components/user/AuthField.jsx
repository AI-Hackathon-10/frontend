export default function AuthField({ id, label, type = 'text', hint, ...props }) {
  return (
    <label className="auth-field" htmlFor={id}>
      <span className="auth-field__label">{label}</span>
      <input id={id} name={id} type={type} {...props} />
      {hint ? <span className="auth-field__hint">{hint}</span> : null}
    </label>
  )
}
