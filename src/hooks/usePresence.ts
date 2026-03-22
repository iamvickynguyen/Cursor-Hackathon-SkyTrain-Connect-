import { useEffect, useRef } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

export function usePresence(userId: string | null, roomId: string | null) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!userId || !roomId) return

    const userRef = doc(db, 'users', userId)

    const updatePresence = () => {
      updateDoc(userRef, {
        lastSeen: Date.now(),
        isActive: true,
      }).catch(console.error)
    }

    updatePresence()
    intervalRef.current = setInterval(updatePresence, 30_000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      updateDoc(userRef, { isActive: false }).catch(console.error)
    }
  }, [userId, roomId])
}
