function Button({
  children,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  size = 'medium',
  type = 'button',
  variant = 'primary',
  ...props
}) {
  const classes = ['button', `button--${variant}`, `button--${size}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} type={type} {...props}>
      {Icon && iconPosition === 'left' ? <Icon aria-hidden="true" className="button__icon" /> : null}
      <span>{children}</span>
      {Icon && iconPosition === 'right' ? <Icon aria-hidden="true" className="button__icon" /> : null}
    </button>
  )
}

export default Button
