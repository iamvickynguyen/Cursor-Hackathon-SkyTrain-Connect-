import { useState, useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import ProfileSetup from './pages/ProfileSetup'
import RoomEntry from './pages/RoomEntry'
import TrainView from './pages/TrainView'
import type { UserProfile } from './types'

type View = 'profile' | 'room' | 'train'

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [view, setView] = useState<View>('profile')

  useEffect(() => {
    const stored = localStorage.getItem('skyconnect_profile')
    if (stored) {
      const parsed = JSON.parse(stored) as UserProfile
      setProfile(parsed)
      setView(parsed.roomId ? 'train' : 'room')
    }

    // Check URL for room param (from QR scan)
    const params = new URLSearchParams(window.location.search)
    const roomFromUrl = params.get('room')
    if (roomFromUrl && stored) {
      const parsed = JSON.parse(stored) as UserProfile
      handleJoinRoom(roomFromUrl, parsed)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const saveProfile = (p: UserProfile) => {
    localStorage.setItem('skyconnect_profile', JSON.stringify(p))
    setProfile(p)
  }

  const handleProfileSaved = (p: UserProfile) => {
    saveProfile(p)
    setView('room')
  }

  const handleJoinRoom = async (roomId: string, p?: UserProfile) => {
    const current = p ?? profile
    if (!current) return

    const updated = { ...current, roomId, isActive: true, lastSeen: Date.now() }
    saveProfile(updated)

    try {
      await updateDoc(doc(db, 'users', current.id), {
        roomId,
        isActive: true,
        lastSeen: Date.now(),
      })
    } catch (err) {
      console.error(err)
    }

    setView('train')
  }

  const handleLeave = () => {
    if (profile) {
      const updated = { ...profile, roomId: '', isActive: false }
      saveProfile(updated)
    }
    setView('room')
  }

  const handleToggleGhost = (ghost: boolean) => {
    if (profile) {
      saveProfile({ ...profile, isGhost: ghost })
    }
  }

  const handleReset = () => {
    localStorage.removeItem('skyconnect_profile')
    setProfile(null)
    setView('profile')
  }

  if (view === 'profile' || !profile) {
    return <ProfileSetup onProfileSaved={handleProfileSaved} />
  }

  if (view === 'room') {
    return (
      <RoomEntry
        onJoinRoom={roomId => handleJoinRoom(roomId)}
        onBack={handleReset}
      />
    )
  }

  return (
    <TrainView
      profile={profile}
      onLeave={handleLeave}
      onToggleGhost={handleToggleGhost}
    />
  )
}
