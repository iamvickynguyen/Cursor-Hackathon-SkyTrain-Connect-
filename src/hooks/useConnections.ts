import { useEffect, useState, useCallback } from 'react'
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Interest, Connection, UserProfile } from '../types'

function parseInterest(d: QueryDocumentSnapshot<DocumentData>): Interest {
  const data = d.data()
  return {
    id: d.id,
    from: data.from as string,
    to: data.to as string,
    fromName: data.fromName as string,
    fromRole: data.fromRole as string,
    fromSkills: (data.fromSkills as string[]) ?? [],
    status: data.status as Interest['status'],
    roomId: data.roomId as string,
    createdAt: data.createdAt as number,
  }
}

function parseConnection(d: QueryDocumentSnapshot<DocumentData>): Connection {
  const data = d.data()
  return {
    id: d.id,
    from: data.from as string,
    to: data.to as string,
    fromName: data.fromName as string,
    fromPhotoUrl: data.fromPhotoUrl as string,
    fromRole: data.fromRole as string,
    location: data.location as string,
    roomId: data.roomId as string,
    createdAt: data.createdAt as number,
  }
}

function useFirestoreQuery<T>(
  profileId: string | undefined,
  roomId: string | undefined,
  collectionName: string,
  direction: 'from' | 'to',
  extraFilters: Record<string, unknown> | null,
  parser: (d: QueryDocumentSnapshot<DocumentData>) => T,
) {
  const [data, setData] = useState<T[]>([])

  useEffect(() => {
    if (!profileId || !roomId) return

    const constraints = [
      where(direction, '==', profileId),
      where('roomId', '==', roomId),
    ]
    if (extraFilters) {
      Object.entries(extraFilters).forEach(([key, val]) => {
        constraints.push(where(key, '==', val))
      })
    }

    const q = query(collection(db, collectionName), ...constraints)
    return onSnapshot(q, snap => {
      const items: T[] = []
      snap.forEach(d => items.push(parser(d)))
      setData(items)
    })
  }, [profileId, roomId, collectionName, direction])

  return data
}

export function useConnections(profile: UserProfile | null) {
  const pid = profile?.id
  const rid = profile?.roomId

  const sentInterestsList = useFirestoreQuery(pid, rid, 'interests', 'from', null, parseInterest)
  const receivedInterests = useFirestoreQuery(pid, rid, 'interests', 'to', { status: 'pending' }, parseInterest)
  const incomingConnections = useFirestoreQuery(pid, rid, 'connections', 'to', null, parseConnection)
  const sentConnectionsList = useFirestoreQuery(pid, rid, 'connections', 'from', null, parseConnection)

  const sentInterests = new Map(sentInterestsList.map(i => [i.to, i]))
  const incoming = [...incomingConnections].sort((a, b) => b.createdAt - a.createdAt)
  const sentTo = new Set(sentConnectionsList.map(c => c.to))

  const sendInterest = useCallback(
    async (toUserId: string) => {
      if (!profile) return
      await setDoc(doc(db, 'interests', `${profile.id}_${toUserId}`), {
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

  const respondToInterest = useCallback(
    async (interestId: string, response: 'accepted' | 'declined') => {
      await updateDoc(doc(db, 'interests', interestId), { status: response })
    },
    [],
  )

  const sendConnection = useCallback(
    async (toUserId: string, location: string) => {
      if (!profile) return
      await setDoc(doc(db, 'connections', `${profile.id}_${toUserId}`), {
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

  const getInterestStatus = useCallback(
    (userId: string): Interest['status'] | 'none' => {
      return sentInterests.get(userId)?.status ?? 'none'
    },
    [sentInterests],
  )

  return {
    receivedInterests: [...receivedInterests].sort((a, b) => b.createdAt - a.createdAt),
    incoming,
    sentTo,
    sendInterest,
    respondToInterest,
    sendConnection,
    getInterestStatus,
  }
}
