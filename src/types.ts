export interface UserProfile {
  id: string
  name: string
  photoUrl: string
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

export interface Interest {
  id: string
  from: string
  to: string
  fromName: string
  fromRole: string
  fromSkills: string[]
  status: 'pending' | 'accepted' | 'declined'
  roomId: string
  createdAt: number
}

export interface Connection {
  id: string
  from: string
  to: string
  fromName: string
  fromPhotoUrl: string
  fromRole: string
  location: string
  roomId: string
  createdAt: number
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
