import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Heart,
  Leaf,
  Quote,
  Rocket,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import artistCreator from '../assets/artist-creator.png'
import childrenPaintingArt from '../assets/children-painting-art.png'
import ecoTinyHome from '../assets/eco-tiny-home.png'
import educationLaptopKids from '../assets/education-laptop-kids.png'
import kidsReadingLibrary from '../assets/kids-reading-library.png'
import mobileClinicSupport from '../assets/mobile-clinic-support.png'

const featuredStories = [
  {
    category: 'Education',
    image: kidsReadingLibrary,
    title: 'A library that keeps the light on',
    description: 'Supporters helped a neighborhood reading room bring new books, warm study corners, and joyful learning to more children.',
    accent: 'lavender',
  },
  {
    category: 'Environment',
    image: ecoTinyHome,
    title: 'Building a gentler place to call home',
    description: 'A practical tiny-home project turned community ideas into affordable, lower-impact spaces for families.',
    accent: 'yellow',
  },
  {
    category: 'Health',
    image: mobileClinicSupport,
    title: 'Care that travels farther',
    description: 'A mobile clinic campaign connected volunteers, supplies, and local care where it was needed most.',
    accent: 'blue',
  },
]

const voices = [
  {
    quote: 'FundBloom helped our small classroom idea become something the whole neighborhood could see and share.',
    name: 'Maya, community educator',
  },
  {
    quote: 'The updates made every contribution feel personal. I could see how a few credits became real materials.',
    name: 'Rafi, supporter',
  },
  {
    quote: 'We arrived with a sketch and left with a community behind the work. That changed everything.',
    name: 'Lina, creator',
  },
]

function StoriesPage() {
  return (
    <main className="info-page info-page--stories">
      <section className="info-page__hero" aria-labelledby="stories-title">
        <div className="info-page__hero-copy">
          <p className="home-pill home-pill--flat">
            <Heart aria-hidden="true" />
            Stories in motion
          </p>
          <h1 id="stories-title">Every campaign starts with a human story.</h1>
          <p>
            Behind every goal is a person, a place, or a possibility worth believing in. Meet the ideas and communities
            that make FundBloom feel bigger than a funding page.
          </p>
          <div className="info-page__actions">
            <Link className="button button--primary" to="/explore">
              <span>Browse campaigns</span>
              <ArrowRight aria-hidden="true" className="button__icon" />
            </Link>
            <Link className="button button--secondary" to="/register">Share your idea</Link>
          </div>
        </div>
        <div className="info-page__hero-media info-page__hero-media--story" aria-label="FundBloom story collage">
          <img alt="Children creating art together" src={childrenPaintingArt} />
          <img alt="A creator working on a new project" src={artistCreator} />
          <img alt="Students learning with digital tools" src={educationLaptopKids} />
        </div>
      </section>

      <section className="info-page__section" aria-labelledby="featured-stories-title">
        <div className="info-page__section-heading">
          <p className="home-pill home-pill--flat">
            <BookOpen aria-hidden="true" />
            Featured stories
          </p>
          <h2 id="featured-stories-title">The kind of change that grows outward.</h2>
          <p>These example stories show the spirit behind FundBloom: practical ideas, thoughtful supporters, and progress people can feel.</p>
        </div>
        <div className="info-page__story-grid">
          {featuredStories.map(({ accent, category, description, image, title }) => (
            <article className={`info-page__story-card info-page__story-card--${accent}`} key={title}>
              <img alt="" src={image} />
              <div>
                <span>{category}</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <Link to="/explore">Explore similar campaigns <ArrowRight aria-hidden="true" /></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="info-page__band info-page__band--stories" aria-labelledby="stories-values-title">
        <div>
          <p className="home-pill home-pill--flat">
            <Sparkles aria-hidden="true" />
            What makes a story matter
          </p>
          <h2 id="stories-values-title">Progress is more powerful when it is shared.</h2>
          <p>
            FundBloom is built around the moments between a campaign launch and its outcome: the encouragement, the
            updates, and the people who keep showing up.
          </p>
        </div>
        <div className="info-page__feature-list">
          <article><Rocket aria-hidden="true" /><span><strong>Ideas with momentum</strong>Creators turn a clear need into a focused plan.</span></article>
          <article><UsersRound aria-hidden="true" /><span><strong>People with purpose</strong>Supporters bring curiosity, care, and encouragement.</span></article>
          <article><Leaf aria-hidden="true" /><span><strong>Impact that continues</strong>Each finished milestone makes the next one easier to imagine.</span></article>
        </div>
      </section>

      <section className="info-page__section info-page__section--voices" aria-labelledby="voices-title">
        <div className="info-page__section-heading">
          <p className="home-pill home-pill--flat">
            <Quote aria-hidden="true" />
            Community voices
          </p>
          <h2 id="voices-title">A little support can sound like a lot.</h2>
        </div>
        <div className="info-page__voice-grid">
          {voices.map(({ name, quote }) => (
            <article className="info-page__voice-card" key={name}>
              <Quote aria-hidden="true" />
              <p>{quote}</p>
              <strong>{name}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="info-page__cta" aria-labelledby="stories-cta-title">
        <div>
          <p className="home-pill home-pill--flat">
            <Heart aria-hidden="true" />
            Your story could be next
          </p>
          <h2 id="stories-cta-title">Bring an idea, a question, or a little hope.</h2>
          <div className="info-page__actions">
            <Link className="button button--primary" to="/register">Start a campaign</Link>
            <Link className="button button--secondary" to="/how-it-works">See how it works</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default StoriesPage
