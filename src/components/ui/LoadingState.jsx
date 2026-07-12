function LoadingState({ label = 'Loading preview', lines = 4 }) {
  return (
    <div aria-label={label} className="state-block state-block--loading" role="status">
      <div className="state-block__shine" />
      <div className="skeleton skeleton--title" />
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className={`skeleton ${index === lines - 1 ? 'skeleton--short' : ''}`} />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  )
}

export default LoadingState
