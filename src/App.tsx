import { useState, useEffect } from 'react'
import ProfileSetup from './pages/ProfileSetup'
import TrainView from './pages/TrainView'
import type { UserProfile } from './types'

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('skyconnect_profile')
    if (stored) {
      setProfile(JSON.parse(stored))
    }
  }, [])

  const handleProfileSaved = (p: UserProfile) => {
    localStorage.setItem('skyconnect_profile', JSON.stringify(p))
    setProfile(p)
  }

  const handleLeave = () => {
    localStorage.removeItem('skyconnect_profile')
    setProfile(null)
  }

  if (!profile) {
    return <ProfileSetup onProfileSaved={handleProfileSaved} />
  }

  return <TrainView profile={profile} onLeave={handleLeave} />
}
