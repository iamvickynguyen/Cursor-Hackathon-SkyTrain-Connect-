import type { Connection } from '../types'

interface IncomingCardProps {
  connection: Connection
}

export default function IncomingCard({ connection }: IncomingCardProps) {
  const timeAgo = getTimeAgo(connection.createdAt)

  return (
    <div className="border border-primary bg-primary-light rounded-2xl p-5">
      <div className="flex items-center gap-4">
        {/* Photo */}
        <div className="w-14 h-14 rounded-full overflow-hidden bg-white border-2 border-primary/20 flex-shrink-0">
          {connection.fromPhotoUrl ? (
            <img
              src={connection.fromPhotoUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
              {connection.fromName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{connection.fromName}</p>
          <p className="text-xs text-gray-400">{connection.fromRole}</p>
          {connection.location && (
            <p className="text-sm text-primary mt-1">
              Meet at: <span className="font-medium">{connection.location}</span>
            </p>
          )}
          <p className="text-xs text-gray-300 mt-1">{timeAgo}</p>
        </div>
      </div>
    </div>
  )
}

function getTimeAgo(timestamp: number): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}
