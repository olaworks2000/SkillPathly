import type { UserProfile, DashboardData, SkillDemand } from '../types'
import {
  getMarketDemand,
  getProjectRecommendations,
  getCertificationRecommendation,
  mergeSkills,
} from './dataService'

export function computeDashboard(profile: UserProfile, overrideDemand?: SkillDemand[]): DashboardData {
  const role = profile.targetRole ?? 'Data Analyst'
  const demand = overrideDemand ?? getMarketDemand(role)

  const allUserSkills = mergeSkills(profile.skills, profile.inferredSkills)
  const userSkillNames = new Set(allUserSkills.map(s => s.name.toLowerCase()))
  const topSkillNames = new Set(demand.map(d => d.skill.toLowerCase()))

  // Matched skills: user has the skill AND it's in top demand
  const matchedSkills = allUserSkills
    .filter(s => topSkillNames.has(s.name.toLowerCase()))
    .map(s => {
      const demandEntry = demand.find(d => d.skill.toLowerCase() === s.name.toLowerCase())
      return { ...s, demand: demandEntry?.demand }
    })
    .sort((a, b) => (b.demand ?? 0) - (a.demand ?? 0))

  // Missing skills: in demand but user doesn't have
  const missingSkills = demand
    .filter(d => !userSkillNames.has(d.skill.toLowerCase()))
    .map(d => {
      const projects = getProjectRecommendations(d.skill)
      const cert = getCertificationRecommendation(d.skill)
      return { ...d, projects, cert }
    })
    .sort((a, b) => b.demand - a.demand)

  return {
    matchedSkills,
    missingSkills,
    totalTopSkills: demand.length,
    matchCount: matchedSkills.length,
    marketDemand: demand,
  }
}
