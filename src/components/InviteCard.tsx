import type { Interest } from '../types'

interface InviteCardProps {
  interest: Interest
  onAccept: () => void
  onDecline: () => void
}

export default function InviteCard({ interest, onAccept, onDecline }: InviteCardProps) {
  return (
    <div className="border border-primary bg-primary-light rounded-2xl p-5">
      <p className="text-xs font-medium text-primary uppercase tracking-wider mb-3">
        Incoming interest
      </p>

      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg flex-shrink-0">
          {interest.fromName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-gray-900">{interest.fromName}</p>
          <p className="text-xs text-gray-400">{interest.fromRole}</p>
        </div>
      </div>

      {interest.fromSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {interest.fromSkills.map(skill => (
            <span
              key={skill}
              className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onDecline}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          Decline
        </button>
        <button
          onClick={onAccept}
          className="flex-1 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
