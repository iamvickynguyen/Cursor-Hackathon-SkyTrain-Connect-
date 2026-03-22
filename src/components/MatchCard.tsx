import type { ScoredMatch } from '../types'

interface MatchCardProps {
  match: ScoredMatch
  status: 'none' | 'pending' | 'accepted' | 'declined'
  onYes: () => void
  onNo: () => void
}

export default function MatchCard({ match, status, onYes, onNo }: MatchCardProps) {
  const { user, score, sharedSkills } = match
  const displayName = user.isGhost ? 'Anonymous' : user.name

  return (
    <div className="border border-gray-100 rounded-2xl p-6">
      {/* Avatar placeholder (no photo) */}
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center text-primary text-3xl font-light">
          {user.isGhost ? '?' : user.name.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Info */}
      <div className="text-center mb-4">
        <p className="font-semibold text-gray-900 text-lg">{displayName}</p>
        <p className="text-sm text-gray-400 mt-0.5">{user.role}</p>
        <p className="text-xs text-gray-300 mt-1">{score}% match</p>
      </div>

      {/* Skills */}
      {sharedSkills.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 mb-4">
          {sharedSkills.map(skill => (
            <span
              key={skill}
              className="text-xs bg-primary text-white px-2.5 py-0.5 rounded-full"
            >
              {skill}
            </span>
          ))}
          {user.skills
            .filter(
              s =>
                !sharedSkills
                  .map(ss => ss.toLowerCase())
                  .includes(s.toLowerCase()),
            )
            .map(skill => (
              <span
                key={skill}
                className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full"
              >
                {skill}
              </span>
            ))}
        </div>
      )}

      {user.openTo && (
        <p className="text-xs text-gray-400 text-center mb-6">
          Open to: {user.openTo}
        </p>
      )}

      {/* Action buttons */}
      {status === 'pending' ? (
        <div className="text-center py-3 bg-primary-light rounded-xl">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-primary">
              Waiting for response...
            </p>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={onNo}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={onYes}
            className="flex-1 py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors"
          >
            Interested
          </button>
        </div>
      )}
    </div>
  )
}
