import { useState, useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import ProfileSetup from './pages/ProfileSetup'
import RoomEntry from './pages/RoomEntry'
import TrainView from './pages/TrainView'
import type { UserProfile } from './types'

type View = 'profile' | 'room' | 'train'

const STORAGE_KEY = 'skyconnect_profile'

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [view, setView] = useState<View>('profile')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return

    const parsed = JSON.parse(stored) as UserProfile
    setProfile(parsed)
    setView(parsed.roomId ? 'train' : 'room')

    const params = new URLSearchParams(window.location.search)
    const roomFromUrl = params.get('room')
    if (roomFromUrl) {
      handleJoinRoom(roomFromUrl, parsed)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const saveProfile = (p: UserProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
    setProfile(p)
  }

  const handleJoinRoom = async (roomId: string, p?: UserProfile) => {
    const current = p ?? profile
    if (!current) return

    saveProfile({ ...current, roomId, isActive: true, lastSeen: Date.now() })

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

  if (view === 'profile' || !profile) {
    return (
      <ProfileSetup
        onProfileSaved={p => {
          saveProfile(p)
          setView('room')
        }}
      />
    )
  }

  if (view === 'room') {
    return (
      <RoomEntry
        onJoinRoom={roomId => handleJoinRoom(roomId)}
        onBack={() => {
          localStorage.removeItem(STORAGE_KEY)
          setProfile(null)
          setView('profile')
        }}
      />
    )
  }

  return (
    <TrainView
      profile={profile}
      onLeave={() => {
        saveProfile({ ...profile, roomId: '', isActive: false })
        setView('room')
      }}
      onToggleGhost={ghost => saveProfile({ ...profile, isGhost: ghost })}
    />
  )
}
