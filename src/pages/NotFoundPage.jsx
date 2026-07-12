import { Link } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'

function NotFoundPage() {
  return (
    <section className="not-found" aria-labelledby="not-found-title">
      <div className="not-found__badge">
        <Search aria-hidden="true" />
        404
      </div>
      <h1 id="not-found-title">This idea has not bloomed yet</h1>
      <p>The page you are looking for is not available. Head back home or explore campaigns once discovery opens.</p>
      <div className="not-found__actions">
        <Link className="button button--primary button--medium" to="/">
          <ArrowLeft aria-hidden="true" className="button__icon" />
          <span>Back to Home</span>
        </Link>
        <Link className="button button--secondary button--medium" to="/explore">
          <span>Explore Campaigns</span>
        </Link>
      </div>
    </section>
  )
}

export default NotFoundPage
