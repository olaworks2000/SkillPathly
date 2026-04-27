export type TargetRole =
  | 'Data Analyst'
  | 'Data Scientist'
  | 'Data Engineer'
  | 'Product Analyst'
  | 'ML Engineer'

export interface UserSkill {
  name: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  inferred?: boolean
}

export interface UserProject {
  id: string
  title: string
  description: string
  tools: string[]
  domain: string
  githubLink?: string
}

export interface CareerIntent {
  q1?: string
  q2?: string
  q3?: string
  q4?: string
}

export interface UserProfile {
  id: string
  userId: string
  targetRole: TargetRole | null
  modules: string[]
  skills: UserSkill[]
  projects: UserProject[]
  careerIntent: CareerIntent
  inferredSkills: UserSkill[]
  onboardingStep: number
  onboardingComplete: boolean
  createdAt: string
  updatedAt: string
}

export interface SkillDemand {
  skill: string
  demand: number // percentage
}

export interface ProjectRec {
  id: string
  title: string
  domain: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  description: string
  forSkill: string
}

export interface CertRec {
  id: string
  name: string
  provider: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  link: string
  forSkill: string
}

export interface DashboardData {
  matchedSkills: (UserSkill & { demand?: number })[]
  missingSkills: (SkillDemand & { projects: ProjectRec[]; cert?: CertRec })[]
  totalTopSkills: number
  matchCount: number
  marketDemand: SkillDemand[]
}
