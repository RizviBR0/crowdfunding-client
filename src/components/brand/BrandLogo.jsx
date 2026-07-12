import { Link } from 'react-router-dom'
import logoMark from '../../assets/fundbloom-logo-mark.svg'
import { siteConfig } from '../../config/site.js'

function BrandLogo({ className = '' }) {
  const classes = ['brand-logo', className].filter(Boolean).join(' ')

  return (
    <Link aria-label={`${siteConfig.name} home`} className={classes} to="/">
      <img alt="" className="brand-logo__mark" src={logoMark} />
      <span className="brand-logo__text">{siteConfig.name}</span>
    </Link>
  )
}

export default BrandLogo
