import { Link } from 'react-router-dom'
import { ArrowRight, Heart } from 'lucide-react'
import cloud from '../assets/cloud.svg'
import doodleLoop from '../assets/doodle-loop.svg'

function HomePage() {
  return (
    <section className="home-placeholder" aria-labelledby="home-title">
      <img alt="" className="home-placeholder__cloud home-placeholder__cloud--left" src={cloud} />
      <img alt="" className="home-placeholder__doodle" src={doodleLoop} />
      <div className="home-placeholder__pill">
        <Heart aria-hidden="true" />
        Ideas. People. Impact.
      </div>
      <h1 id="home-title">Fund the ideas that shape a better tomorrow</h1>
      <p>
        FundBloom connects dreamers with doers through thoughtful campaigns, transparent progress, and support that
        helps ideas grow into real-world impact.
      </p>
      <div className="home-placeholder__actions">
        <Link className="button button--primary button--medium" to="/explore">
          <span>Explore Campaigns</span>
          <ArrowRight aria-hidden="true" className="button__icon" />
        </Link>
        <Link className="button button--secondary button--medium" to="/register">
          <span>Start a Campaign</span>
        </Link>
      </div>
    </section>
  )
}

export default HomePage
