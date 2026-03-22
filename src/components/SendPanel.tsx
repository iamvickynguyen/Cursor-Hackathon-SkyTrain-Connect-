import { useState } from 'react'
import type { UserProfile, ScoredMatch } from '../types'

interface SendPanelProps {
  profile: UserProfile
  match: ScoredMatch
  onSend: (location: string) => void
  onBack: () => void
}

export default function SendPanel({ profile, match, onSend, onBack }: SendPanelProps) {
  const [location, setLocation] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    setSending(true)
    await onSend(location.trim())
  }

  return (
    <div className="border border-primary bg-primary-light rounded-2xl p-6">
      <button
        onClick={onBack}
        className="text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors"
      >
        &larr; Back
      </button>

      <p className="text-xs font-medium text-primary uppercase tracking-wider mb-4">
        Send your info to {match.user.isGhost ? 'Anonymous' : match.user.name}
      </p>

      {/* Your photo preview */}
      <div className="flex justify-center mb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-white border-2 border-primary/20">
          {profile.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt="Your photo"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-sm text-gray-500 mb-6">
        Your photo will be shared with them.
      </p>

      {/* Location input */}
      <div className="mb-6">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
          Meeting spot <span className="text-gray-300 normal-case">(optional)</span>
        </label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="e.g. Car 3, by the door"
          className="w-full border-b border-gray-200 px-0 py-2 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-primary transition-colors bg-transparent"
        />
      </div>

      <button
        onClick={handleSend}
        disabled={sending}
        className="w-full py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-dark disabled:bg-gray-300 transition-colors"
      >
        {sending ? 'Sending...' : 'Send'}
      </button>
    </div>
  )
}
