import { useEffect, useState } from 'react'
import { doc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import type { UserProfile } from '../types'
import { findBestMatch } from '../utils/matching'
import MatchCard from '../components/MatchCard'

interface TrainViewProps {
  profile: UserProfile
  onLeave: () => void
}

export default function TrainView({ profile, onLeave }: TrainViewProps) {
  const [activeUsers, setActiveUsers] = useState(0)
  const [bestMatch, setBestMatch] = useState<UserProfile | null>(null)
  const [scanning, setScanning] = useState(true)

  useEffect(() => {
    // Update lastSeen immediately on mount
    const updatePresence = () => {
      updateDoc(doc(db, 'users', profile.id), {
        lastSeen: Date.now(),
        isActive: true,
      }).catch(console.error)
    }

    updatePresence()

    // Keepalive every 30 seconds
    const interval = setInterval(updatePresence, 30_000)

    // Real-time listener for active users
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('isActive', '==', true))

    const unsubscribe = onSnapshot(q, snapshot => {
      const now = Date.now()
      const cutoff = now - 5 * 60 * 1000

      const others: UserProfile[] = []

      snapshot.forEach(docSnap => {
        const data = docSnap.data()
        const lastSeen: number =
          typeof data.lastSeen === 'number'
            ? data.lastSeen
            : data.lastSeen?.toMillis?.() ?? 0

        if (docSnap.id === profile.id) return
        if (lastSeen < cutoff) return

        others.push({
          id: docSnap.id,
          name: data.name as string,
          role: data.role as string,
          openTo: data.openTo as string,
          lastSeen,
          isActive: data.isActive as boolean,
        })
      })

      setActiveUsers(others.length)
      setBestMatch(findBestMatch(profile, others))
      setScanning(false)
    })

    return () => {
      clearInterval(interval)
      unsubscribe()
      updateDoc(doc(db, 'users', profile.id), { isActive: false }).catch(console.error)
    }
  }, [profile])

  const handleLeave = async () => {
    try {
      await updateDoc(doc(db, 'users', profile.id), { isActive: false })
    } catch (err) {
      console.error(err)
    }
    onLeave()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pt-4 pb-2">
          <div>
            <h1 className="text-white font-bold text-xl">SkyTrain Connect</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
              <span className="text-green-300 text-xs font-medium">Broadcasting</span>
            </div>
          </div>
          <button
            onClick={handleLeave}
            className="text-white/70 hover:text-white text-sm border border-white/30 hover:border-white/60 rounded-lg px-3 py-1.5 transition-colors duration-150"
          >
            Leave Train
          </button>
        </div>

        {/* Your profile card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5">
          <p className="text-white/60 text-xs uppercase tracking-wide font-medium mb-3">
            Your Profile
          </p>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-300 flex items-center justify-center text-blue-900 font-bold text-lg flex-shrink-0">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-semibold text-lg leading-tight">{profile.name}</p>
              <p className="text-blue-200 text-sm mt-0.5">{profile.role}</p>
              <div className="mt-2">
                <span className="text-white/50 text-xs uppercase tracking-wide font-medium">Open to</span>
                <p className="text-blue-100 text-sm mt-0.5">{profile.openTo}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active users count */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3 flex items-center gap-2">
          <span className="text-2xl">👥</span>
          <p className="text-white text-sm">
            <span className="font-bold">{activeUsers}</span>{' '}
            {activeUsers === 1 ? 'person' : 'people'} on this train right now
          </p>
        </div>

        {/* Match section */}
        <div className="bg-white rounded-xl p-5 shadow-lg">
          <p className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-3">
            Best Match
          </p>

          {scanning ? (
            <div className="flex items-center gap-3 py-2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Scanning for matches...</p>
            </div>
          ) : bestMatch ? (
            <MatchCard user={bestMatch} />
          ) : (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">🔍</div>
              <p className="text-gray-500 text-sm">No other active users found.</p>
              <p className="text-gray-400 text-xs mt-1">Share the app with fellow commuters!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
