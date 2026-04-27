/**
 * dataService.ts
 * Centralised data access layer for SkillPathly.
 * Seed data acts as the single source of truth now;
 * this layer is structured so each function can later be
 * swapped to a database/API call with zero changes to callers.
 */

import type { SkillDemand, ProjectRec, CertRec, UserSkill, UserProject } from '../types'
import {
  MARKET_DEMAND,
  PROJECT_RECS,
  CERT_RECS,
  MODULE_SKILL_MAP,
  ALL_SKILLS,
} from '../data/seed'

// ── Market Demand ──────────────────────────────────────────────────────────

export function getMarketDemand(role: string): SkillDemand[] {
  return MARKET_DEMAND[role] ?? MARKET_DEMAND['Data Analyst']
}

export function getAllRoles(): string[] {
  return Object.keys(MARKET_DEMAND)
}

// ── Project Recommendations ────────────────────────────────────────────────

export function getProjectRecommendations(skill: string): ProjectRec[] {
  return PROJECT_RECS.filter(
    p => p.forSkill.toLowerCase() === skill.toLowerCase()
  )
}

export function getAllProjects(): ProjectRec[] {
  return [...PROJECT_RECS]
}

// ── Certification Recommendations ─────────────────────────────────────────

export function getCertificationRecommendation(skill: string): CertRec | undefined {
  return CERT_RECS.find(c => c.forSkill.toLowerCase() === skill.toLowerCase())
}

export function getAllCertifications(): CertRec[] {
  return [...CERT_RECS]
}

// ── Skill Inference ────────────────────────────────────────────────────────

export function inferSkillsFromModules(modules: string[]): UserSkill[] {
  const skillMap = new Map<string, UserSkill>()

  for (const mod of modules) {
    const lower = mod.toLowerCase().trim()
    for (const [key, mappedSkills] of Object.entries(MODULE_SKILL_MAP)) {
      if (lower.includes(key)) {
        for (const s of mappedSkills) {
          if (!skillMap.has(s.skill)) {
            skillMap.set(s.skill, { ...s, name: s.skill, inferred: true })
          }
        }
      }
    }
  }

  return Array.from(skillMap.values())
}

export function inferSkillsFromProjects(projects: UserProject[]): UserSkill[] {
  const skillMap = new Map<string, UserSkill>()

  for (const project of projects) {
    for (const tool of project.tools) {
      const normalized = ALL_SKILLS.find(
        s => s.toLowerCase() === tool.toLowerCase()
      )
      if (normalized && !skillMap.has(normalized)) {
        skillMap.set(normalized, { name: normalized, level: 'Beginner', inferred: true })
      }
    }
  }

  return Array.from(skillMap.values())
}

export function mergeSkills(
  explicitSkills: UserSkill[],
  inferredSkills: UserSkill[]
): UserSkill[] {
  const result = new Map<string, UserSkill>()
  for (const s of explicitSkills) result.set(s.name, s)
  for (const s of inferredSkills) {
    if (!result.has(s.name)) result.set(s.name, s)
  }
  return Array.from(result.values())
}

export { ALL_SKILLS }
