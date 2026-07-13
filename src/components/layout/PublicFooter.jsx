import { ArrowRight, Github, Linkedin, Facebook } from 'lucide-react'
import BrandLogo from '../brand/BrandLogo.jsx'
import { siteConfig } from '../../config/site.js'

const iconMap = {
  GitHub: <Github aria-hidden="true" />,
  LinkedIn: <Linkedin aria-hidden="true" />,
  Facebook: <Facebook aria-hidden="true" />,
}

function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__scallop" aria-hidden="true" />
      <div className="site-footer__inner">
        <section className="site-footer__brand" aria-label="FundBloom summary">
          <BrandLogo className="brand-logo--footer" />
          <p>{siteConfig.description}</p>
          <div className="site-footer__socials">
            {siteConfig.socialLinks.map((link) => (
              <a
                aria-label={link.label}
                className="site-footer__social"
                href={link.href}
                key={link.label}
                rel="noreferrer"
                target="_blank"
              >
                {iconMap[link.label] || link.shortLabel}
              </a>
            ))}
          </div>
        </section>

        {siteConfig.footerSections.map((section) => (
          <section className="site-footer__section" key={section.title}>
            <h2>{section.title}</h2>
            <ul>
              {section.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="site-footer__newsletter" aria-labelledby="newsletter-title">
          <h2 id="newsletter-title">Stay in the loop</h2>
          <p>Get campaign stories, creator tips, and platform updates delivered to your inbox.</p>
          <form className="newsletter-form">
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <input id="newsletter-email" placeholder="Enter your email" type="email" />
            <button aria-label="Join the mailing list" type="submit">
              <ArrowRight aria-hidden="true" />
            </button>
          </form>
        </section>
      </div>

      <div className="site-footer__wordmark" aria-hidden="true">
        FundBloom
      </div>
      <div className="site-footer__legal">
        <p>© 2026 FundBloom. All rights reserved.</p>
        <div>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms & Conditions</a>
          <a href="/cookies">Cookies</a>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter
