function EmptyState({ action, description, icon: Icon, title }) {
  return (
    <div className="state-block state-block--empty">
      <div className="state-block__icon">
        {Icon ? <Icon aria-hidden="true" /> : null}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <div className="state-block__action">{action}</div> : null}
    </div>
  )
}

export default EmptyState
