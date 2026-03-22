export interface UserProfile {
  id: string
  name: string
  role: string
  openTo: string
  lastSeen: number // epoch ms
  isActive: boolean
}
