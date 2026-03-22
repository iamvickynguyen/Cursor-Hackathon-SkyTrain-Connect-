export interface UserProfile {
  id: string
  name: string
  role: string
  skills: string[]
  openTo: string
  roomId: string
  isGhost: boolean
  lastSeen: number
  isActive: boolean
}

export interface ScoredMatch {
  user: UserProfile
  score: number
  sharedSkills: string[]
}

export const SKILL_OPTIONS = [
  'React',
  'TypeScript',
  'Python',
  'Node.js',
  'Design',
  'Product',
  'Marketing',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'Mobile',
  'Backend',
  'Frontend',
  'Cloud',
  'Startup',
  'Mentorship',
  'Networking',
  'Leadership',
] as const

export const ROLE_PRESETS = [
  'Software Engineer',
  'Designer',
  'Product Manager',
  'Data Scientist',
  'DevOps Engineer',
  'Founder / CEO',
  'Marketing',
  'Student',
  'Other',
] as const
