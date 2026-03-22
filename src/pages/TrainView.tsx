import { useState, useMemo, useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { UserProfile } from '../types'
import { usePresence } from '../hooks/usePresence'
import { useRoom } from '../hooks/useRoom'
import { useConnections } from '../hooks/useConnections'
import MatchCard from '../components/MatchCard'
import SendPanel from '../components/SendPanel'
import InviteCard from '../components/InviteCard'
import IncomingCard from '../components/IncomingCard'

interface TrainViewProps {
  profile: UserProfile
  onLeave: () => void
  onToggleGhost: (ghost: boolean) => void
}

export default function TrainView({ profile, onLeave, onToggleGhost }: TrainViewProps) {
  usePresence(profile.id, profile.roomId)
  const { nearbyUsers, matches, loading } = useRoom(profile)
  const {
    receivedInterests,
    incoming,
    sentTo,
    sendInterest,
    respondToInterest,
    sendConnection,
    getInterestStatus,
  } = useConnections(profile)

  const [skipped, setSkipped] = useState<Set<string>>(new Set())
  const [showSendFor, setShowSendFor] = useState<string | null>(null)

  const currentMatch = useMemo(() => {
    return (
      matches.find(m => {
        const status = getInterestStatus(m.user.id)
        return (
          !skipped.has(m.user.id) &&
          status === 'none' &&
          !sentTo.has(m.user.id)
        )
      }) ?? null
    )
  }, [matches, skipped, getInterestStatus, sentTo])

  const waitingMatch = useMemo(() => {
    return (
      matches.find(m => getInterestStatus(m.user.id) === 'pending') ?? null
    )
  }, [matches, getInterestStatus])

  const acceptedMatch = useMemo(() => {
    return (
      matches.find(
        m => getInterestStatus(m.user.id) === 'accepted' && !sentTo.has(m.user.id),
      ) ?? null
    )
  }, [matches, getInterestStatus, sentTo])

  useEffect(() => {
    if (acceptedMatch && !showSendFor) {
      setShowSendFor(acceptedMatch.user.id)
      if (navigator.vibrate) navigator.vibrate([100, 50, 100])
    }
  }, [acceptedMatch, showSendFor])

  const sendPanelMatch = useMemo(() => {
    if (!showSendFor) return null
    return matches.find(m => m.user.id === showSendFor) ?? null
  }, [matches, showSendFor])

  const handleNo = () => {
    if (!currentMatch) return
    setSkipped(prev => new Set(prev).add(currentMatch.user.id))
  }

  const handleYes = async () => {
    if (!currentMatch) return
    await sendInterest(currentMatch.user.id)
  }

  const handleAcceptInvite = async (interestId: string, fromUserId: string) => {
    await respondToInterest(interestId, 'accepted')
    setShowSendFor(fromUserId)
  }

  const handleDeclineInvite = async (interestId: string) => {
    await respondToInterest(interestId, 'declined')
  }

  const handleSend = async (location: string) => {
    if (!showSendFor) return
    await sendConnection(showSendFor, location)
    setShowSendFor(null)
  }

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

  const showingWaiting = !showSendFor && waitingMatch && !currentMatch
  const showingSendPanel = showSendFor && sendPanelMatch

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Room {profile.roomId}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              <span className="text-xs text-gray-400">
                {nearbyUsers.length}{' '}
                {nearbyUsers.length === 1 ? 'person' : 'people'} nearby
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

        <div className="flex items-center justify-between py-3 border-y border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center text-primary font-medium text-xs overflow-hidden">
              {profile.isGhost ? (
                '?'
              ) : profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
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
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            Ghost {profile.isGhost ? 'On' : 'Off'}
          </button>
        </div>

        {receivedInterests.length > 0 && (
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-wider mb-3">
              Someone is interested in you
            </p>
            <div className="space-y-3">
              {receivedInterests.map(interest => (
                <InviteCard
                  key={interest.id}
                  interest={interest}
                  onAccept={() => handleAcceptInvite(interest.id, interest.from)}
                  onDecline={() => handleDeclineInvite(interest.id)}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Discover
          </p>

          {loading ? (
            <div className="flex items-center gap-2 py-12 justify-center">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Scanning...</p>
            </div>
          ) : showingSendPanel && sendPanelMatch ? (
            <div>
              <div className="text-center py-4 mb-4">
                <p className="text-lg font-semibold text-primary">
                  It's a match!
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Send your photo and meeting spot.
                </p>
              </div>
              <SendPanel
                profile={profile}
                match={sendPanelMatch}
                onSend={handleSend}
                onBack={() => setShowSendFor(null)}
              />
            </div>
          ) : showingWaiting && waitingMatch ? (
            <MatchCard
              match={waitingMatch}
              status="pending"
              onYes={() => {}}
              onNo={() => {}}
            />
          ) : currentMatch ? (
            <MatchCard
              match={currentMatch}
              status="none"
              onYes={handleYes}
              onNo={handleNo}
            />
          ) : nearbyUsers.length > 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400">
                {skipped.size > 0
                  ? "You've seen everyone nearby."
                  : 'No skill overlap found.'}
              </p>
              {skipped.size > 0 && (
                <button
                  onClick={() => setSkipped(new Set())}
                  className="text-xs text-primary underline mt-2"
                >
                  Reset skipped
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400">No one else is here yet.</p>
              <p className="text-xs text-gray-300 mt-1">
                Share the room code with fellow commuters.
              </p>
            </div>
          )}
        </div>

        {incoming.length > 0 && (
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-wider mb-3">
              Someone wants to meet you
            </p>
            <div className="space-y-3">
              {incoming.map(conn => (
                <IncomingCard key={conn.id} connection={conn} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
