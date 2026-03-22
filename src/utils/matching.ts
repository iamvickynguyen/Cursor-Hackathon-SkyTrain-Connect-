import type { UserProfile } from '../types'

// Jaccard similarity on word tokens
export function jaccardSimilarity(a: string, b: string): number {
  const tokenize = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(Boolean)
    )
  const setA = tokenize(a)
  const setB = tokenize(b)
  const intersection = new Set([...setA].filter(x => setB.has(x)))
  const union = new Set([...setA, ...setB])
  if (union.size === 0) return 0
  return intersection.size / union.size
}

export function findBestMatch(
  currentUser: UserProfile,
  others: UserProfile[]
): UserProfile | null {
  if (others.length === 0) return null
  const currentText = `${currentUser.role} ${currentUser.openTo}`
  const scored = others
    .map(user => ({
      user,
      score: jaccardSimilarity(currentText, `${user.role} ${user.openTo}`),
    }))
    .sort((a, b) => b.score - a.score)

  // Pick randomly from top 3
  const topN = scored.slice(0, Math.min(3, scored.length))
  const picked = topN[Math.floor(Math.random() * topN.length)]
  return picked.user
}
