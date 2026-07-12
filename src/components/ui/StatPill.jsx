function StatPill({ label, value }) {
  return (
    <div className="stat-pill">
      <span className="stat-pill__label">{label}</span>
      <strong className="stat-pill__value">{value}</strong>
    </div>
  )
}

export default StatPill
