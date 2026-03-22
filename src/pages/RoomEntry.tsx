import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface RoomEntryProps {
  onJoinRoom: (roomId: string) => void
  onBack: () => void
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export default function RoomEntry({ onJoinRoom, onBack }: RoomEntryProps) {
  const [mode, setMode] = useState<'join' | 'create'>('join')
  const [roomCode, setRoomCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')

  const handleJoin = () => {
    const code = roomCode.trim().toUpperCase()
    if (code.length >= 4) {
      onJoinRoom(code)
    }
  }

  const handleCreate = () => {
    const code = generateRoomCode()
    setGeneratedCode(code)
  }

  const shareUrl = generatedCode
    ? `${window.location.origin}?room=${generatedCode}`
    : ''

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors"
        >
          &larr; Back
        </button>

        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Join a Train
        </h1>
        <p className="text-sm text-gray-400 mt-1 mb-8">
          Enter a room code or create one to share.
        </p>

        {/* Tab toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-8">
          <button
            onClick={() => setMode('join')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'join'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Join Room
          </button>
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'create'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Create Room
          </button>
        </div>

        {mode === 'join' ? (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. A3K9X2"
                maxLength={6}
                className="w-full border-b border-gray-200 px-0 py-2 text-2xl font-mono text-gray-900 placeholder-gray-300 focus:outline-none focus:border-primary transition-colors bg-transparent tracking-[0.3em] text-center"
              />
            </div>
            <button
              onClick={handleJoin}
              disabled={roomCode.trim().length < 4}
              className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Join
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {!generatedCode ? (
              <button
                onClick={handleCreate}
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-colors"
              >
                Generate Room Code
              </button>
            ) : (
              <div className="text-center space-y-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Your Room Code
                  </p>
                  <p className="text-4xl font-mono font-bold text-primary tracking-[0.3em]">
                    {generatedCode}
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <QRCodeSVG
                      value={shareUrl}
                      size={180}
                      level="M"
                      bgColor="transparent"
                      fgColor="#005aaf"
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-400">
                  Share this code or QR with fellow commuters.
                </p>

                <button
                  onClick={() => onJoinRoom(generatedCode)}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Enter Room
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
