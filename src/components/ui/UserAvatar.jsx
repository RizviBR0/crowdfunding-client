import { useState } from 'react'

export default function UserAvatar({ user, className = '' }) {
  const [imgFailed, setImgFailed] = useState(false)
  const photoUrl = user?.photoUrl
  const name = user?.displayName || user?.email || 'F'
  const firstLetter = name.trim().charAt(0).toUpperCase()

  if (photoUrl && !imgFailed) {
    return (
      <img
        alt=""
        src={photoUrl}
        onError={() => setImgFailed(true)}
        className={className}
      />
    )
  }

  return (
    <div className={`avatar-fallback ${className}`} aria-label={name}>
      {firstLetter}
    </div>
  )
}
