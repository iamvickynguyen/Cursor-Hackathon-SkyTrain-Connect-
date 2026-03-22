import type { UserProfile, ScoredMatch } from '../types'

export function calculateMatchScore(
  currentUser: UserProfile,
  otherUser: UserProfile
): ScoredMatch {
  const mySkills = new Set(currentUser.skills.map(s => s.toLowerCase()))
  const theirSkills = new Set(otherUser.skills.map(s => s.toLowerCase()))

  const shared = [...mySkills].filter(s => theirSkills.has(s))
  const union = new Set([...mySkills, ...theirSkills])

  const score = union.size === 0 ? 0 : shared.length / union.size

  return {
    user: otherUser,
    score: Math.round(score * 100),
    sharedSkills: shared.map(s =>
      otherUser.skills.find(sk => sk.toLowerCase() === s) ?? s
    ),
  }
}

export function findMatches(
  currentUser: UserProfile,
  others: UserProfile[]
): ScoredMatch[] {
  return others
    .map(user => calculateMatchScore(currentUser, user))
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
}
