function Surface({ children, className = '', tone = 'default' }) {
  const classes = ['surface', `surface--${tone}`, className].filter(Boolean).join(' ')

  return <section className={classes}>{children}</section>
}

export default Surface
