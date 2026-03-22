import type { ScoredMatch } from '../types'

interface MatchCardProps {
  match: ScoredMatch
}

export default function MatchCard({ match }: MatchCardProps) {
  const { user, score, sharedSkills } = match
  const displayName = user.isGhost ? 'Anonymous' : user.name

  return (
    <div className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-sm flex-shrink-0">
            {user.isGhost ? '?' : user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{displayName}</p>
            <p className="text-xs text-gray-400">{user.role}</p>
          </div>
        </div>
        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
          {score}%
        </span>
      </div>

      {sharedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {sharedSkills.map(skill => (
            <span
              key={skill}
              className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full"
            >
              {skill}
            </span>
          ))}
          {user.skills
            .filter(s => !sharedSkills.map(ss => ss.toLowerCase()).includes(s.toLowerCase()))
            .map(skill => (
              <span
                key={skill}
                className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
              >
                {skill}
              </span>
            ))}
        </div>
      )}

      {user.openTo && (
        <p className="text-xs text-gray-400 mt-2">
          Open to: {user.openTo}
        </p>
      )}
    </div>
  )
}
