import { useState, useCallback } from 'react'
import { supabase } from '../blink/client'
import type { UserProfile, UserSkill, UserProject, CareerIntent, TargetRole } from '../types'

interface DbRow {
  id: string
  user_id: string
  target_role: string | null
  modules: UserSkill[] | string[]
  skills: UserSkill[]
  projects: UserProject[]
  career_intent: CareerIntent
  inferred_skills: UserSkill[]
  onboarding_step: number
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

function rowToProfile(row: DbRow): UserProfile {
  return {
    id: row.id,
    userId: row.user_id,
    targetRole: (row.target_role as TargetRole) ?? null,
    modules: (row.modules ?? []) as string[],
    skills: row.skills ?? [],
    projects: row.projects ?? [],
    careerIntent: row.career_intent ?? {},
    inferredSkills: row.inferred_skills ?? [],
    onboardingStep: row.onboarding_step ?? 0,
    onboardingComplete: row.onboarding_complete ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchProfile = useCallback(async (userId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle()

      if (error) throw error
      setProfile(data ? rowToProfile(data as DbRow) : null)
    } catch (err) {
      console.error('Error fetching profile', err)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const createProfile = useCallback(async (userId: string) => {
    const id = `profile_${userId}`
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id,
          user_id: userId,
          target_role: null,
          modules: [],
          skills: [],
          projects: [],
          career_intent: {},
          inferred_skills: [],
          onboarding_step: 0,
          onboarding_complete: false,
        })
        .select()
        .single()

      if (error) throw error
      const fresh = rowToProfile(data as DbRow)
      setProfile(fresh)
      return fresh
    } catch (err) {
      console.error('Error creating profile', err)
      return null
    }
  }, [])

  const updateProfile = useCallback(async (
    profileId: string,
    updates: Partial<{
      targetRole: TargetRole
      modules: string[]
      skills: UserSkill[]
      projects: UserProject[]
      careerIntent: CareerIntent
      inferredSkills: UserSkill[]
      onboardingStep: number
      onboardingComplete: boolean
    }>
  ) => {
    // Map camelCase app fields to snake_case DB columns
    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (updates.targetRole      !== undefined) dbUpdates.target_role       = updates.targetRole
    if (updates.modules         !== undefined) dbUpdates.modules           = updates.modules
    if (updates.skills          !== undefined) dbUpdates.skills            = updates.skills
    if (updates.projects        !== undefined) dbUpdates.projects          = updates.projects
    if (updates.careerIntent    !== undefined) dbUpdates.career_intent     = updates.careerIntent
    if (updates.inferredSkills  !== undefined) dbUpdates.inferred_skills   = updates.inferredSkills
    if (updates.onboardingStep  !== undefined) dbUpdates.onboarding_step   = updates.onboardingStep
    if (updates.onboardingComplete !== undefined) dbUpdates.onboarding_complete = updates.onboardingComplete

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(dbUpdates)
        .eq('id', profileId)

      if (error) throw error
      setProfile(prev => prev ? { ...prev, ...updates } : prev)
    } catch (err) {
      console.error('Error updating profile', err)
    }
  }, [])

  return { profile, loading, fetchProfile, createProfile, updateProfile }
}
