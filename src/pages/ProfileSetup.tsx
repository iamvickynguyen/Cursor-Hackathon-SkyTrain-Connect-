import { useState, type FormEvent } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { UserProfile } from '../types'

interface ProfileSetupProps {
  onProfileSaved: (profile: UserProfile) => void
}

export default function ProfileSetup({ onProfileSaved }: ProfileSetupProps) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [openTo, setOpenTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !role.trim() || !openTo.trim()) return

    setLoading(true)
    setError(null)

    try {
      const userId = crypto.randomUUID()
      const now = Date.now()

      const profile: UserProfile = {
        id: userId,
        name: name.trim(),
        role: role.trim(),
        openTo: openTo.trim(),
        lastSeen: now,
        isActive: true,
      }

      await setDoc(doc(db, 'users', userId), {
        name: profile.name,
        role: profile.role,
        openTo: profile.openTo,
        lastSeen: now,
        isActive: true,
      })

      onProfileSaved(profile)
    } catch (err) {
      setError('Failed to save profile. Please check your connection and try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🚇</div>
          <h1 className="text-2xl font-bold text-gray-900">SkyTrain Connect</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Meet professionals on your commute
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alex Chen"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Role
            </label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g. Software Engineer, Designer, Founder"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Open To
            </label>
            <input
              type="text"
              value={openTo}
              onChange={e => setOpenTo(e.target.value)}
              placeholder="e.g. Networking, Collaboration, Mentorship"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors duration-150"
          >
            {loading ? 'Boarding...' : 'Board the Train'}
          </button>
        </form>
      </div>
    </div>
  )
}
