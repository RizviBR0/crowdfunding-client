import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  HeartHandshake,
  Lightbulb,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from 'lucide-react'
import campaignSuccessGroup from '../assets/campaign-success-group.png'
import communityGardenTeam from '../assets/community-garden-team.png'
import doodlePaperPlane from '../assets/doodle-paper-plane.svg'
import robotPrototype from '../assets/robot-prototype.png'

const steps = [
  {
    number: '01',
    title: 'Find an idea worth backing',
    description: 'Explore approved campaigns by category, deadline, funding goal, or the kind of change you want to see.',
    icon: Lightbulb,
  },
  {
    number: '02',
    title: 'Choose your credits',
    description: 'Purchase a credit package securely, then use your balance to support the campaigns that matter to you.',
    icon: WalletCards,
  },
  {
    number: '03',
    title: 'Make a thoughtful contribution',
    description: 'Send credits with an optional message. Your contribution stays visible while the creator reviews it.',
    icon: HeartHandshake,
  },
  {
    number: '04',
    title: 'Follow the impact',
    description: 'See whether your contribution is pending, approved, or refunded, and keep your progress in one place.',
    icon: BellRing,
  },
]

const faqs = [
  {
    question: 'What are FundBloom credits?',
    answer: 'Credits are the platform balance supporters use to contribute to approved campaigns. Your available balance and every contribution are visible in your dashboard.',
  },
  {
    question: 'Can I create a campaign?',
    answer: 'Yes. Register as a Creator, complete the campaign details, and submit it for moderation. Approved campaigns become discoverable to supporters.',
  },
  {
    question: 'What happens when a creator rejects my contribution?',
    answer: 'Rejected contributions are refunded according to the platform rules, and the updated status appears in your contribution history.',
  },
]

function HowItWorksPage() {
  return (
    <main className="info-page info-page--how">
      <section className="info-page__hero" aria-labelledby="how-it-works-title">
        <div className="info-page__hero-copy">
          <p className="home-pill home-pill--flat">
            <Sparkles aria-hidden="true" />
            How FundBloom works
          </p>
          <h1 id="how-it-works-title">A clear path from idea to impact.</h1>
          <p>
            FundBloom makes crowdfunding feel human: discover a meaningful project, support it with credits, and follow
            what your contribution helps make possible.
          </p>
          <div className="info-page__actions">
            <Link className="button button--primary" to="/explore">
              <span>Explore campaigns</span>
              <ArrowRight aria-hidden="true" className="button__icon" />
            </Link>
            <Link className="button button--secondary" to="/register">
              Start a campaign
            </Link>
          </div>
        </div>
        <div className="info-page__hero-media" aria-label="FundBloom community impact">
          <img alt="A community team gathered around a garden project" src={communityGardenTeam} />
          <img alt="A robotics project ready to grow" src={robotPrototype} />
          <img alt="Supporters celebrating a successful campaign" src={campaignSuccessGroup} />
          <img alt="" className="info-page__doodle" src={doodlePaperPlane} />
        </div>
      </section>

      <section className="info-page__quick-stats" aria-label="FundBloom at a glance">
        <article>
          <strong>4</strong>
          <span>simple steps</span>
        </article>
        <article>
          <strong>1</strong>
          <span>clear contribution history</span>
        </article>
        <article>
          <strong>100%</strong>
          <span>community-minded</span>
        </article>
      </section>

      <section className="info-page__section" aria-labelledby="how-steps-title">
        <div className="info-page__section-heading">
          <p className="home-pill home-pill--flat">
            <HeartHandshake aria-hidden="true" />
            The FundBloom flow
          </p>
          <h2 id="how-steps-title">Small actions, visible progress.</h2>
          <p>Every part of the journey is designed to keep supporters informed and creators focused.</p>
        </div>
        <div className="info-page__step-grid">
          {steps.map(({ description, icon: Icon, number, title }) => (
            <article className="info-page__step-card" key={number}>
              <span className="info-page__step-number">{number}</span>
              <span className="info-page__step-icon">
                <Icon aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="info-page__band" aria-labelledby="how-trust-title">
        <div>
          <p className="home-pill home-pill--flat">
            <ShieldCheck aria-hidden="true" />
            Built for confidence
          </p>
          <h2 id="how-trust-title">Know where your support stands.</h2>
          <p>
            Campaign moderation, server-checked roles, contribution statuses, and clear dashboard updates make it easier
            to support with confidence.
          </p>
        </div>
        <div className="info-page__feature-list">
          <article>
            <CheckCircle2 aria-hidden="true" />
            <span><strong>Approved campaigns</strong>Discover projects that have passed moderation.</span>
          </article>
          <article>
            <MessageCircleHeart aria-hidden="true" />
            <span><strong>Meaningful messages</strong>Share encouragement with creators when you contribute.</span>
          </article>
          <article>
            <BellRing aria-hidden="true" />
            <span><strong>Helpful updates</strong>See decisions and contribution changes in your dashboard.</span>
          </article>
        </div>
      </section>

      <section className="info-page__section info-page__section--faq" aria-labelledby="how-faq-title">
        <div className="info-page__section-heading">
          <p className="home-pill home-pill--flat">
            <Sparkles aria-hidden="true" />
            Good to know
          </p>
          <h2 id="how-faq-title">A few helpful answers.</h2>
        </div>
        <div className="info-page__faq-list">
          {faqs.map(({ answer, question }) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="info-page__cta" aria-labelledby="how-cta-title">
        <div>
          <p className="home-pill home-pill--flat">
            <Sparkles aria-hidden="true" />
            Ready to make something bloom?
          </p>
          <h2 id="how-cta-title">Your next small action can move a big idea forward.</h2>
          <div className="info-page__actions">
            <Link className="button button--primary" to="/explore">Find a campaign</Link>
            <Link className="button button--secondary" to="/register">Join FundBloom</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default HowItWorksPage
