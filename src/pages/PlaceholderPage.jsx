import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const placeholderCopy = {
  explore: {
    eyebrow: 'Explore campaigns',
    title: 'Discover ideas ready for support',
    description: 'Browse community projects, creative work, education efforts, and practical ideas built by real creators.',
  },
  howItWorks: {
    eyebrow: 'How it works',
    title: 'Simple steps, big impact',
    description: 'Choose a credit package, back campaigns you believe in, and follow every milestone from pledge to progress.',
  },
  stories: {
    eyebrow: 'Stories',
    title: 'Real stories will live here',
    description: 'Meet the creators, supporters, and communities turning small acts of backing into lasting change.',
  },
  login: {
    eyebrow: 'Login',
    title: 'Welcome back to FundBloom',
    description: 'Return to your campaigns, contributions, credits, and progress updates.',
  },
  register: {
    eyebrow: 'Register',
    title: 'Join as a supporter or creator',
    description: 'Start backing meaningful campaigns or launch an idea that deserves a community behind it.',
  },
}

function PlaceholderPage({ type }) {
  const copy = placeholderCopy[type]

  return (
    <section className="route-placeholder" aria-labelledby={`${type}-title`}>
      <p className="route-placeholder__eyebrow">{copy.eyebrow}</p>
      <h1 id={`${type}-title`}>{copy.title}</h1>
      <p>{copy.description}</p>
      <Link className="button button--primary button--medium" to="/">
        <span>Back to FundBloom</span>
        <ArrowRight aria-hidden="true" className="button__icon" />
      </Link>
    </section>
  )
}

export default PlaceholderPage
