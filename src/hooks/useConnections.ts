import { useEffect, useState, useCallback } from 'react'
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Interest, Connection, UserProfile } from '../types'

export function useConnections(profile: UserProfile | null) {
  // Interests I sent
  const [sentInterests, setSentInterests] = useState<Map<string, Interest>>(new Map())
  // Interests others sent to me
  const [receivedInterests, setReceivedInterests] = useState<Interest[]>([])
  // Connections (photo+location) sent to me
  const [incoming, setIncoming] = useState<Connection[]>([])
  // IDs I already sent connections to
  const [sentTo, setSentTo] = useState<Set<string>>(new Set())

  // Listen for interests I sent
  useEffect(() => {
    if (!profile?.id || !profile.roomId) return
    const q = query(
      collection(db, 'interests'),
      where('from', '==', profile.id),
      where('roomId', '==', profile.roomId),
    )
    return onSnapshot(q, snap => {
      const map = new Map<string, Interest>()
      snap.forEach(d => {
        const data = d.data()
        map.set(data.to as string, {
          id: d.id,
          from: data.from as string,
          to: data.to as string,
          fromName: data.fromName as string,
          fromRole: data.fromRole as string,
          fromSkills: (data.fromSkills as string[]) ?? [],
          status: data.status as Interest['status'],
          roomId: data.roomId as string,
          createdAt: data.createdAt as number,
        })
      })
      setSentInterests(map)
    })
  }, [profile?.id, profile?.roomId])

  // Listen for pending interests sent to me
  useEffect(() => {
    if (!profile?.id || !profile.roomId) return
    const q = query(
      collection(db, 'interests'),
      where('to', '==', profile.id),
      where('roomId', '==', profile.roomId),
      where('status', '==', 'pending'),
    )
    return onSnapshot(q, snap => {
      const list: Interest[] = []
      snap.forEach(d => {
        const data = d.data()
        list.push({
          id: d.id,
          from: data.from as string,
          to: data.to as string,
          fromName: data.fromName as string,
          fromRole: data.fromRole as string,
          fromSkills: (data.fromSkills as string[]) ?? [],
          status: 'pending',
          roomId: data.roomId as string,
          createdAt: data.createdAt as number,
        })
      })
      list.sort((a, b) => b.createdAt - a.createdAt)
      setReceivedInterests(list)
    })
  }, [profile?.id, profile?.roomId])

  // Listen for connections sent TO me
  useEffect(() => {
    if (!profile?.id || !profile.roomId) return
    const q = query(
      collection(db, 'connections'),
      where('to', '==', profile.id),
      where('roomId', '==', profile.roomId),
    )
    return onSnapshot(q, snap => {
      const conns: Connection[] = []
      snap.forEach(d => {
        const data = d.data()
        conns.push({
          id: d.id,
          from: data.from as string,
          to: data.to as string,
          fromName: data.fromName as string,
          fromPhotoUrl: data.fromPhotoUrl as string,
          fromRole: data.fromRole as string,
          location: data.location as string,
          roomId: data.roomId as string,
          createdAt: data.createdAt as number,
        })
      })
      conns.sort((a, b) => b.createdAt - a.createdAt)
      setIncoming(conns)
    })
  }, [profile?.id, profile?.roomId])

  // Listen for connections I sent
  useEffect(() => {
    if (!profile?.id || !profile.roomId) return
    const q = query(
      collection(db, 'connections'),
      where('from', '==', profile.id),
      where('roomId', '==', profile.roomId),
    )
    return onSnapshot(q, snap => {
      const ids = new Set<string>()
      snap.forEach(d => ids.add(d.data().to as string))
      setSentTo(ids)
    })
  }, [profile?.id, profile?.roomId])

  // Send interest (pending)
  const sendInterest = useCallback(
    async (toUserId: string) => {
      if (!profile) return
      const id = `${profile.id}_${toUserId}`
      await setDoc(doc(db, 'interests', id), {
        from: profile.id,
        to: toUserId,
        fromName: profile.isGhost ? 'Anonymous' : profile.name,
        fromRole: profile.role,
        fromSkills: profile.skills,
        status: 'pending',
        roomId: profile.roomId,
        createdAt: Date.now(),
      })
    },
    [profile],
  )

  // Respond to an interest (accept/decline)
  const respondToInterest = useCallback(
    async (interestId: string, response: 'accepted' | 'declined') => {
      await updateDoc(doc(db, 'interests', interestId), { status: response })
    },
    [],
  )

  // Send connection (photo + location)
  const sendConnection = useCallback(
    async (toUserId: string, location: string) => {
      if (!profile) return
      const connId = `${profile.id}_${toUserId}`
      await setDoc(doc(db, 'connections', connId), {
        from: profile.id,
        to: toUserId,
        fromName: profile.name,
        fromPhotoUrl: profile.photoUrl,
        fromRole: profile.role,
        location,
        roomId: profile.roomId,
        createdAt: Date.now(),
      } satisfies Omit<Connection, 'id'>)
    },
    [profile],
  )

  // Get the status of my interest toward a user
  const getInterestStatus = useCallback(
    (userId: string): 'none' | 'pending' | 'accepted' | 'declined' => {
      const interest = sentInterests.get(userId)
      return interest?.status ?? 'none'
    },
    [sentInterests],
  )

  return {
    sentInterests,
    receivedInterests,
    incoming,
    sentTo,
    sendInterest,
    respondToInterest,
    sendConnection,
    getInterestStatus,
  }
}
