import Icon from './Icon.jsx'

export default function Button({ children, variant = 'primary', icon, className = '', ...props }) {
  return (
    <button className={`button button--${variant} ${className}`.trim()} type="button" {...props}>
      {icon ? <Icon name={icon} size={19} /> : null}
      <span>{children}</span>
    </button>
  )
}
