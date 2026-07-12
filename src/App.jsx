import { useState } from 'react'
import {
  ArrowRight,
  BriefcaseBusiness,
  CircleAlert,
  Layers3,
  Search,
  Sparkles,
  WalletCards,
} from 'lucide-react'
import Button from './components/ui/Button.jsx'
import DataTable from './components/ui/DataTable.jsx'
import EmptyState from './components/ui/EmptyState.jsx'
import LoadingState from './components/ui/LoadingState.jsx'
import Modal from './components/ui/Modal.jsx'
import SectionHeading from './components/ui/SectionHeading.jsx'
import StatPill from './components/ui/StatPill.jsx'
import Surface from './components/ui/Surface.jsx'

const reviewColumns = [
  {
    key: 'supporter',
    label: 'Supporter',
  },
  {
    key: 'campaign',
    label: 'Campaign',
  },
  {
    key: 'status',
    label: 'Status',
    render: (row) => <span className={`status-chip status-chip--${row.statusTone}`}>{row.status}</span>,
  },
  {
    key: 'credits',
    label: 'Credits',
    align: 'right',
  },
]

const reviewRows = [
  {
    id: 'row-1',
    supporter: 'Mina Chowdhury',
    campaign: 'River school solar lab',
    status: 'Pending review',
    statusTone: 'pending',
    credits: '120',
  },
  {
    id: 'row-2',
    supporter: 'Arif Hasan',
    campaign: 'Village maker hub',
    status: 'Approved',
    statusTone: 'approved',
    credits: '320',
  },
  {
    id: 'row-3',
    supporter: 'Nusrat Karim',
    campaign: 'Harvest cold storage',
    status: 'Needs follow-up',
    statusTone: 'attention',
    credits: '90',
  },
]

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <main className="app-shell" aria-labelledby="foundation-title">
        <section className="band band--hero">
          <div className="band__inner hero-layout">
            <div className="hero-copy">
              <p className="hero-copy__eyebrow">LanternRaise design foundation</p>
              <h1 id="foundation-title">A warmer, sharper visual system for trust-heavy fundraising flows.</h1>
              <p className="hero-copy__summary">
                This preview locks the typography, token palette, surfaces, table rhythm, modal shell, and feedback
                states before we start route and feature work.
              </p>
              <div className="hero-copy__actions">
                <Button icon={ArrowRight} iconPosition="right" onClick={() => setIsModalOpen(true)}>
                  Preview review modal
                </Button>
                <Button icon={Layers3} variant="secondary">
                  Inspect primitives
                </Button>
              </div>
            </div>
            <div className="hero-stats" aria-label="Design system snapshot">
              <StatPill label="Primary font" value="Sora" />
              <StatPill label="Editorial accent" value="Newsreader" />
              <StatPill label="Surface tones" value="4" />
              <StatPill label="Primitive groups" value="6" />
            </div>
          </div>
        </section>

        <section className="band band--light">
          <div className="band__inner">
            <SectionHeading
              eyebrow="Controls"
              title="Buttons, surfaces, and status language"
              description="The system leans on calm neutrals, ember highlights, and sturdy data-friendly spacing so dashboards can feel deliberate instead of generic."
            />
            <div className="primitive-grid">
              <Surface tone="default">
                <p className="surface__eyebrow">Button set</p>
                <h3>Clear command hierarchy</h3>
                <p>Primary actions carry the ember signal. Secondary and ghost variants stay quiet for dense dashboards.</p>
                <div className="button-row">
                  <Button icon={Sparkles}>Launch campaign</Button>
                  <Button icon={Search} variant="secondary">
                    Explore
                  </Button>
                  <Button icon={CircleAlert} variant="ghost">
                    Review
                  </Button>
                </div>
              </Surface>

              <Surface tone="accent">
                <p className="surface__eyebrow">Surface set</p>
                <h3>Framed where it matters</h3>
                <p>Cards stay compact and low-radius so data modules feel sturdy. Page bands do the wide-layout work.</p>
                <div className="badge-row">
                  <span className="status-chip status-chip--approved">Approved</span>
                  <span className="status-chip status-chip--pending">Pending</span>
                  <span className="status-chip status-chip--attention">Flagged</span>
                </div>
              </Surface>
            </div>
          </div>
        </section>

        <section className="band band--ink">
          <div className="band__inner">
            <SectionHeading
              eyebrow="Tables"
              title="A table primitive that can carry review-heavy workflows"
              description="This establishes caption styling, status chips, numeric alignment, and overflow behavior for contributions, payments, withdrawals, and reports."
            />
            <Surface className="surface--table" tone="contrast">
              <DataTable caption="Contribution review preview" columns={reviewColumns} rows={reviewRows} />
            </Surface>
          </div>
        </section>

        <section className="band band--light">
          <div className="band__inner">
            <SectionHeading
              eyebrow="States"
              title="Loading and empty states that already speak the same language"
              description="The goal here is consistency: feature slices can drop these in later without inventing their own spacing, copy rhythm, or fallback visuals."
            />
            <div className="state-grid">
              <LoadingState label="Loading contribution summary preview" lines={5} />
              <EmptyState
                action={
                  <Button icon={BriefcaseBusiness} variant="secondary">
                    Draft first campaign
                  </Button>
                }
                description="When a creator lands on a fresh dashboard, the absence should still feel intentional and encouraging."
                icon={WalletCards}
                title="No campaign activity yet"
              />
            </div>
          </div>
        </section>
      </main>

      <Modal
        description="This shell is meant for contribution reviews, payment details, and report triage once real data lands."
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Supporter note for River school solar lab"
      >
        <div className="modal-preview">
          <div>
            <p className="modal-preview__label">Supporter</p>
            <strong>Mina Chowdhury</strong>
          </div>
          <div>
            <p className="modal-preview__label">Contribution</p>
            <strong>120 credits</strong>
          </div>
          <div className="modal-preview__message">
            <p className="modal-preview__label">Message</p>
            <p>
              We want to fund the backup batteries first, because evening classes are where the local tutoring program
              grows the fastest.
            </p>
          </div>
          <div className="hero-copy__actions">
            <Button>Approve contribution</Button>
            <Button variant="ghost">Need more context</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default App
