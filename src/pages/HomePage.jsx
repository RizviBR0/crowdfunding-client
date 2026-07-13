import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import {
  ArrowRight,
  BookOpen,
  ChartNoAxesCombined,
  Heart,
  Leaf,
  Rocket,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import 'swiper/css'
import 'swiper/css/pagination'
import artistCreator from '../assets/artist-creator.png'
import blobBlue from '../assets/blob-blue.svg'
import blobPink from '../assets/blob-pink.svg'
import campaignSuccessGroup from '../assets/campaign-success-group.png'
import childRoboticsLearner from '../assets/child-robotics-learner.png'
import childrenPaintingArt from '../assets/children-painting-art.png'
import communityGardenTeam from '../assets/community-garden-team.png'
import doodleLoop from '../assets/doodle-loop.svg'
import doodlePaperPlane from '../assets/doodle-paper-plane.svg'
import doodlePurpleBurst from '../assets/doodle-purple-burst.svg'
import doodleYellowBurst from '../assets/doodle-yellow-burst.svg'
import ecoTinyHome from '../assets/eco-tiny-home.png'
import educationLaptopKids from '../assets/education-laptop-kids.png'
import kidsReadingLibrary from '../assets/kids-reading-library.png'
import mobileClinicSupport from '../assets/mobile-clinic-support.png'
import robotPrototype from '../assets/robot-prototype.png'
import scallopedDividerLavender from '../assets/scalloped-divider-lavender.svg'
import cloudSvg from '../assets/cloud.svg'
import { getHomepageData } from '../services/homeService.js'

const fallbackCampaigns = [
  {
    id: 'fallback-1',
    title: 'Green Tiny Homes for Families',
    category: 'Environment',
    coverImageUrl: ecoTinyHome,
    creatorName: 'Nora Fields',
    fundingGoal: 100000,
    amountRaised: 82450,
  },
  {
    id: 'fallback-2',
    title: 'Code & Create: Robotics for Kids',
    category: 'Education',
    coverImageUrl: robotPrototype,
    creatorName: 'Bright Lab',
    fundingGoal: 100000,
    amountRaised: 67300,
  },
  {
    id: 'fallback-3',
    title: 'Art Supplies for Young Dreamers',
    category: 'Arts',
    coverImageUrl: artistCreator,
    creatorName: 'Mira Studio',
    fundingGoal: 60000,
    amountRaised: 45120,
  },
  {
    id: 'fallback-4',
    title: 'Mobile Health Clinics',
    category: 'Health',
    coverImageUrl: mobileClinicSupport,
    creatorName: 'Care Miles',
    fundingGoal: 92000,
    amountRaised: 78910,
  },
  {
    id: 'fallback-5',
    title: 'Community Garden Initiative',
    category: 'Community',
    coverImageUrl: communityGardenTeam,
    creatorName: 'Grow Local',
    fundingGoal: 60000,
    amountRaised: 36840,
  },
  {
    id: 'fallback-6',
    title: 'Digital Learning for All',
    category: 'Education',
    coverImageUrl: educationLaptopKids,
    creatorName: 'Open Class',
    fundingGoal: 100000,
    amountRaised: 91220,
  },
]

const fallbackImpact = {
  approvedCampaigns: 7450,
  totalRaisedCredits: 98000000,
  totalFundingGoal: 128000000,
  categoriesCount: 6,
}

const heroSlides = [
  {
    eyebrow: 'Ideas. People. Impact.',
    title: 'Fund the ideas that shape a better tomorrow',
    description: 'Discover creative projects, support causes you care about, and help bring bright ideas to life.',
    primaryLabel: 'Explore Campaigns',
    primaryHref: '/explore',
    secondaryLabel: 'Start a Campaign',
    secondaryHref: '/register',
    images: [artistCreator, robotPrototype, ecoTinyHome, campaignSuccessGroup],
  },
  {
    eyebrow: 'Support. Trust. Rewards.',
    title: 'Back creators. Spark meaningful change.',
    description: 'Use credits to support vetted campaigns, follow progress, and celebrate every milestone.',
    primaryLabel: 'Explore Campaigns',
    primaryHref: '/explore',
    secondaryLabel: 'See How It Works',
    secondaryHref: '/how-it-works',
    images: [childRoboticsLearner, communityGardenTeam, mobileClinicSupport, educationLaptopKids],
  },
  {
    eyebrow: 'Real stories. Real impact.',
    title: 'Turn small support into lasting change',
    description: 'Help communities, education projects, creative work, and practical causes bloom with confidence.',
    primaryLabel: 'Browse Stories',
    primaryHref: '/stories',
    secondaryLabel: 'Start a Campaign',
    secondaryHref: '/register',
    images: [kidsReadingLibrary, childrenPaintingArt, campaignSuccessGroup, artistCreator],
  },
]

const categories = [
  { label: 'Technology', description: 'Innovations that build a better tomorrow.', icon: ChartNoAxesCombined },
  { label: 'Arts & Culture', description: 'Creative projects that inspire and connect.', icon: Sparkles },
  { label: 'Education', description: 'Learning opportunities that open doors.', icon: BookOpen },
  { label: 'Health', description: 'Better health and well-being for all.', icon: Heart },
  { label: 'Community', description: 'Stronger neighborhoods through shared action.', icon: UsersRound },
  { label: 'Environment', description: 'Protecting our planet for future generations.', icon: Leaf },
]

const testimonials = [
  {
    quote: 'I love seeing ideas that empower kids to learn, create, and dream bigger.',
    name: 'Emily R.',
    role: 'Supporter',
  },
  {
    quote: 'Crowdfunding feels simple here. Small contributions create clear, lasting change.',
    name: 'Daniel K.',
    role: 'Parent & donor',
  },
  {
    quote: 'This platform connects thoughtful creators with people who truly care.',
    name: 'Priya S.',
    role: 'Community member',
  },
  {
    quote: 'Transparent, inspiring, and full of heart. It is my go-to place to support new work.',
    name: 'James T.',
    role: 'Supporter',
  },
]

const formatCredits = (value) => new Intl.NumberFormat('en-US').format(value ?? 0)

const getProgress = (campaign) => {
  if (!campaign.fundingGoal) {
    return 0
  }

  return Math.min(100, Math.round(((campaign.amountRaised ?? 0) / campaign.fundingGoal) * 100))
}

const getCampaignImage = (campaign, index) =>
  campaign.coverImageUrl || fallbackCampaigns[index % fallbackCampaigns.length].coverImageUrl

function HeroImageCluster({ images }) {
  return (
    <div className="home-hero__images" aria-hidden="true">
      {images.map((image, index) => (
        <img alt="" className={`home-hero__image home-hero__image--${index + 1}`} key={image} src={image} />
      ))}
      <span className="home-hero__badge home-hero__badge--heart">
        <Heart aria-hidden="true" />
      </span>
      <span className="home-hero__badge home-hero__badge--rocket">
        <Rocket aria-hidden="true" />
      </span>
    </div>
  )
}

function HomePage() {
  const { data } = useQuery({
    queryKey: ['homepage-data'],
    queryFn: getHomepageData,
    retry: false,
    staleTime: 60_000,
  })
  const campaigns = data?.campaigns?.length ? data.campaigns : fallbackCampaigns
  const impact = data?.impact ?? fallbackImpact
  const supportRate = impact.totalFundingGoal
    ? Math.min(100, Math.round((impact.totalRaisedCredits / impact.totalFundingGoal) * 100))
    : 0

  return (
    <div className="home-page">
      <section className="home-hero" aria-label="Featured FundBloom stories">
        <img alt="" className="home-doodle home-doodle--burst" src={doodlePurpleBurst} />
        <img alt="" className="home-doodle home-doodle--loop" src={doodleLoop} />
        <Swiper
          autoplay={{ delay: 5200, disableOnInteraction: false }}
          className="home-hero__slider"
          loop
          modules={[Autoplay, Pagination]}
          pagination={{ clickable: true }}
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.title}>
              <div className="home-hero__slide">
                <div className="home-hero__copy">
                  <p className="home-pill">
                    <Heart aria-hidden="true" />
                    {slide.eyebrow}
                  </p>
                  <h1>{slide.title}</h1>
                  <p className="home-hero__description">{slide.description}</p>
                  <div className="home-hero__actions">
                    <Link className="button button--primary" to={slide.primaryHref}>
                      <span>{slide.primaryLabel}</span>
                      <ArrowRight aria-hidden="true" className="button__icon" />
                    </Link>
                    <Link className="button button--secondary" to={slide.secondaryHref}>
                      {slide.secondaryLabel}
                    </Link>
                  </div>
                </div>
                <HeroImageCluster images={slide.images} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <section className="home-impact-section" aria-label="FundBloom impact">
        <div className="home-impact">
          <div className="home-impact__blob"></div>
          <div className="home-impact__intro">
            <h2>Numbers That Tell Our Story</h2>
            <p>Behind every number is a child's laugh, a parent's peace of mind, and a team that truly cares every single day.</p>
          </div>
          <div className="home-impact__stats">
            <article>
              <strong>{formatCredits(128000)}+</strong>
              <span>Supporters</span>
            </article>
            <article>
              <strong>{formatCredits(impact.approvedCampaigns)}+</strong>
              <span>Campaigns</span>
            </article>
            <article>
              <strong>{formatCredits(impact.totalRaisedCredits)}+</strong>
              <span>Credits Raised</span>
            </article>
            <article>
              <strong>{supportRate}%</strong>
              <span>Momentum</span>
            </article>
          </div>
        </div>
        <div className="home-impact__clouds">
          <img alt="" className="cloud-lavender" src={scallopedDividerLavender} />
          <img alt="" className="cloud-white" src={cloudSvg} />
        </div>
      </section>

      <section className="home-section home-section--campaigns" aria-labelledby="top-funded-title">
        <div className="home-section__heading">
          <p className="home-pill home-pill--flat">
            <Rocket aria-hidden="true" />
            Top funded campaigns
          </p>
          <h2 id="top-funded-title">Explore the most supported ideas</h2>
          <p>These campaigns are already blooming with community support.</p>
        </div>
        <div className="campaign-grid">
          {campaigns.slice(0, 6).map((campaign, index) => {
            const progress = getProgress(campaign)

            return (
              <article className="campaign-card" key={campaign.id ?? campaign.title}>
                <img alt="" src={getCampaignImage(campaign, index)} />
                <div className="campaign-card__body">
                  <span>{campaign.category || 'Campaign'}</span>
                  <h3>{campaign.title}</h3>
                  <p>Created by {campaign.creatorName || 'FundBloom creator'}</p>
                  <div className="campaign-card__meta">
                    <strong>{formatCredits(campaign.amountRaised)} raised</strong>
                    <small>{progress}% funded</small>
                  </div>
                  <div className="campaign-card__progress" aria-label={`${progress}% funded`}>
                    <i style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="home-section home-section--trust" aria-labelledby="trust-title">
        <div className="home-trust__media">
          <img alt="" src={childRoboticsLearner} />
          <img alt="" className="home-trust__blob home-trust__blob--blue" src={blobBlue} />
          <img alt="" className="home-trust__plane" src={doodlePaperPlane} />
        </div>
        <div className="home-trust__copy">
          <p className="home-pill home-pill--flat">
            <ShieldCheck aria-hidden="true" />
            Built on trust
          </p>
          <h2 id="trust-title">Your support. Real impact. Every step of the way.</h2>
          <p>
            FundBloom keeps crowdfunding simple, secure, and meaningful so supporters can give with confidence and
            creators can build with clarity.
          </p>
          <div className="home-feature-list">
            <article>
              <ShieldCheck aria-hidden="true" />
              <span>
                <strong>Verified creators</strong>
                Every creator is vetted before launching.
              </span>
            </article>
            <article>
              <ChartNoAxesCombined aria-hidden="true" />
              <span>
                <strong>Transparent progress</strong>
                Track updates, milestones, and funds in real time.
              </span>
            </article>
            <article>
              <Sparkles aria-hidden="true" />
              <span>
                <strong>Rewards that matter</strong>
                Supporters receive meaningful perks and updates.
              </span>
            </article>
          </div>
        </div>
      </section>

      <section className="home-section home-section--steps" aria-labelledby="steps-title">
        <div className="home-section__heading">
          <p className="home-pill home-pill--flat">
            <Heart aria-hidden="true" />
            How FundBloom works
          </p>
          <h2 id="steps-title">Simple steps. Big impact.</h2>
        </div>
        <div className="steps-grid">
          {[
            ['Buy Credits', 'Choose a credit pack that fits you. Every credit feels real change.', Heart],
            ['Back Campaigns', 'Browse ideas you care about and use your credits to support them.', Rocket],
            ['Track Impact', 'Watch progress in real time and earn rewards for your support.', ChartNoAxesCombined],
          ].map(([title, description, Icon], index) => (
            <article className="step-card" key={title}>
              <small>{index + 1}</small>
              <span>
                <Icon aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-section--categories" aria-labelledby="categories-title">
        <div className="home-section__heading">
          <p className="home-pill home-pill--flat">
            <BookOpen aria-hidden="true" />
            Explore by category
          </p>
          <h2 id="categories-title">Find the causes that inspire you</h2>
        </div>
        <div className="category-grid">
          {categories.map(({ description, icon: Icon, label }) => (
            <article className="category-card" key={label}>
              <span>
                <Icon aria-hidden="true" />
              </span>
              <h3>{label}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-section--testimonials" aria-labelledby="testimonials-title">
        <div className="home-section__heading">
          <p className="home-pill home-pill--flat">
            <Heart aria-hidden="true" />
            Supporter stories
          </p>
          <h2 id="testimonials-title">What supporters are saying</h2>
        </div>
        <Swiper
          autoplay={{ delay: 4800, disableOnInteraction: false }}
          breakpoints={{
            700: { slidesPerView: 2 },
            1020: { slidesPerView: 4 },
          }}
          className="testimonial-slider"
          modules={[Autoplay, Pagination]}
          pagination={{ clickable: true }}
          slidesPerView={1}
          spaceBetween={18}
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.name}>
              <article className="testimonial-card">
                <strong>"</strong>
                <p>{testimonial.quote}</p>
                <span>{testimonial.name}</span>
                <small>{testimonial.role}</small>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <section className="home-cta" aria-labelledby="home-cta-title">
        <div>
          <p className="home-pill home-pill--flat">
            <Sparkles aria-hidden="true" />
            Built for creators. Backed by community.
          </p>
          <h2 id="home-cta-title">Turn your next idea into real support</h2>
          <p>
            Whether you are creating or supporting, FundBloom is where bold ideas bloom into impact.
          </p>
          <div className="home-hero__actions">
            <Link className="button button--primary" to="/register">
              Start a Campaign
            </Link>
            <Link className="button button--secondary" to="/explore">
              Explore Opportunities
            </Link>
          </div>
        </div>
        <div className="home-cta__media" aria-hidden="true">
          <img alt="" src={campaignSuccessGroup} />
          <img alt="" src={blobPink} />
          <img alt="" src={doodleYellowBurst} />
        </div>
      </section>
    </div>
  )
}

export default HomePage
