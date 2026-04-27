import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
import 'dotenv/config'

const app = express()
const port = process.env.PORT || 4000

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://skillpathly.vercel.app'],
}))
app.use(express.json())

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

app.post('/api/analyse', async (req, res) => {
  const { role, country = 'gb' } = req.body
  if (!role) return res.status(400).json({ error: 'role is required' })

  // Fetch job listings from Adzuna
  const adzunaUrl =
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1` +
    `?app_id=${process.env.ADZUNA_APP_ID}` +
    `&app_key=${process.env.ADZUNA_APP_KEY}` +
    `&what=${encodeURIComponent(role)}` +
    `&results_per_page=20`

  let descriptions
  try {
    const adzunaRes = await fetch(adzunaUrl)
    if (!adzunaRes.ok) throw new Error(`Adzuna error ${adzunaRes.status}`)
    const data = await adzunaRes.json()
    descriptions = (data.results ?? []).map(j => j.description).filter(Boolean)
  } catch (err) {
    return res.status(502).json({ error: 'Failed to fetch job data', detail: err.message })
  }

  if (descriptions.length === 0) {
    return res.status(404).json({ error: 'No job listings found for that role and country' })
  }

  // Ask Claude to extract skill demand from the descriptions
  const prompt = `You are a career analyst. Below are ${descriptions.length} job descriptions for "${role}" roles.

Extract the top skills mentioned and estimate the demand percentage (0–100) for each skill based on how frequently it appears across the listings.

Return ONLY a valid JSON array — no markdown, no explanation — in this exact shape:
[{ "skill": "SQL", "demand": 72 }, ...]

Aim for 8–15 skills ordered by demand descending.

Job descriptions:
${descriptions.map((d, i) => `[${i + 1}] ${d.slice(0, 400)}`).join('\n\n')}`

  let skills
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = message.content.find(b => b.type === 'text')?.text ?? ''
    skills = JSON.parse(text)
  } catch (err) {
    return res.status(500).json({ error: 'Claude analysis failed', detail: err.message })
  }

  res.json({ role, country, skills })
})

app.listen(port, () => console.log(`SkillPathly server listening on port ${port}`))
