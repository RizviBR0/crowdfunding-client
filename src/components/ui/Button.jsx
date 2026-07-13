function Button({
  children,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  size = 'medium',
  type = 'button',
  variant = 'primary',
  ...props
}) {
  const classes = ['button', `button--${variant}`, `button--${size}`, className]
    .filter(Boolean)
    .join(' ')

  const { disabled = false, ...buttonProps } = props

  return (
    <button className={classes} disabled={disabled || isLoading} type={type} {...buttonProps}>
      {Icon && iconPosition === 'left' ? <Icon aria-hidden="true" className="button__icon" /> : null}
      <span>{children}</span>
      {Icon && iconPosition === 'right' ? <Icon aria-hidden="true" className="button__icon" /> : null}
    </button>
  )
}

export default Button
