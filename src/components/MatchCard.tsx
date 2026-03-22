import type { UserProfile } from '../types'

interface MatchCardProps {
  user: UserProfile
}

export default function MatchCard({ user }: MatchCardProps) {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wide">
          Match Found!
        </span>
        <span className="text-emerald-500">✓</span>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-lg flex-shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-lg leading-tight">{user.name}</p>
          <p className="text-gray-600 text-sm mt-0.5">{user.role}</p>
          <div className="mt-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Open to</span>
            <p className="text-gray-700 text-sm mt-0.5">{user.openTo}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
