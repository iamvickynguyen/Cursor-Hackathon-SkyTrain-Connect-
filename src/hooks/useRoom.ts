import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import type { UserProfile, ScoredMatch } from '../types'
import { findMatches } from '../utils/matching'

export function useRoom(profile: UserProfile | null) {
  const [nearbyUsers, setNearbyUsers] = useState<UserProfile[]>([])
  const [matches, setMatches] = useState<ScoredMatch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.roomId) return

    const usersRef = collection(db, 'users')
    const q = query(
      usersRef,
      where('isActive', '==', true),
      where('roomId', '==', profile.roomId)
    )

    const unsubscribe = onSnapshot(q, snapshot => {
      const now = Date.now()
      const cutoff = now - 5 * 60 * 1000

      const others: UserProfile[] = []

      snapshot.forEach(docSnap => {
        if (docSnap.id === profile.id) return

        const data = docSnap.data()
        const lastSeen: number =
          typeof data.lastSeen === 'number'
            ? data.lastSeen
            : data.lastSeen?.toMillis?.() ?? 0

        if (lastSeen < cutoff) return

        others.push({
          id: docSnap.id,
          name: data.name as string,
          photoUrl: (data.photoUrl as string) ?? '',
          role: data.role as string,
          skills: (data.skills as string[]) ?? [],
          openTo: (data.openTo as string) ?? '',
          roomId: (data.roomId as string) ?? '',
          isGhost: (data.isGhost as boolean) ?? false,
          lastSeen,
          isActive: true,
        })
      })

      setNearbyUsers(others)
      setMatches(findMatches(profile, others))
      setLoading(false)

      if (others.length > 0 && navigator.vibrate) {
        navigator.vibrate(100)
      }
    })

    return () => unsubscribe()
  }, [profile?.id, profile?.roomId, profile?.skills?.join(',')])

  return { nearbyUsers, matches, loading }
}
