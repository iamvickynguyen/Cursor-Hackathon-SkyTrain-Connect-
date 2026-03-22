import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { UserProfile } from '../types'
import { usePresence } from '../hooks/usePresence'
import { useRoom } from '../hooks/useRoom'
import MatchCard from '../components/MatchCard'

interface TrainViewProps {
  profile: UserProfile
  onLeave: () => void
  onToggleGhost: (ghost: boolean) => void
}

export default function TrainView({ profile, onLeave, onToggleGhost }: TrainViewProps) {
  usePresence(profile.id, profile.roomId)
  const { nearbyUsers, matches, loading } = useRoom(profile)

  const handleLeave = async () => {
    try {
      await updateDoc(doc(db, 'users', profile.id), {
        isActive: false,
        roomId: '',
      })
    } catch (err) {
      console.error(err)
    }
    onLeave()
  }

  const handleToggleGhost = async () => {
    const newGhost = !profile.isGhost
    try {
      await updateDoc(doc(db, 'users', profile.id), { isGhost: newGhost })
      onToggleGhost(newGhost)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Room {profile.roomId}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              <span className="text-xs text-gray-400">
                {nearbyUsers.length} {nearbyUsers.length === 1 ? 'person' : 'people'} nearby
              </span>
            </div>
          </div>
          <button
            onClick={handleLeave}
            className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
          >
            Leave
          </button>
        </div>

        {/* Your info bar */}
        <div className="flex items-center justify-between py-3 border-y border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-xs">
              {profile.isGhost ? '?' : profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {profile.isGhost ? 'Anonymous' : profile.name}
              </p>
              <p className="text-xs text-gray-400">{profile.role}</p>
            </div>
          </div>
          <button
            onClick={handleToggleGhost}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
              profile.isGhost
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            Ghost {profile.isGhost ? 'On' : 'Off'}
          </button>
        </div>

        {/* Matches */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Matches
          </p>

          {loading ? (
            <div className="flex items-center gap-2 py-8 justify-center">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Scanning...</p>
            </div>
          ) : matches.length > 0 ? (
            <div className="space-y-3">
              {matches.map(match => (
                <MatchCard key={match.user.id} match={match} />
              ))}
            </div>
          ) : nearbyUsers.length > 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">No skill overlap found.</p>
              <p className="text-xs text-gray-300 mt-1">
                Try adding more skills to your profile.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">No one else is here yet.</p>
              <p className="text-xs text-gray-300 mt-1">
                Share the room code with fellow commuters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
