import type { SkillDemand } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export async function analyseRole(role: string): Promise<SkillDemand[]> {
  const res = await fetch(`${API_URL}/api/analyse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, country: 'gb' }),
  })
  if (!res.ok) throw new Error(`Server error ${res.status}`)
  const data = await res.json()
  return data.skills as SkillDemand[]
}
