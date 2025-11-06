export type SDG = {
  id: number
  name: string
}

export type SourceHit = {
  id: string
  source: "website" | "linkedin" | "news" | "crunchbase" | "x" | "press"
  url: string
  title: string
  publishedAt?: string // ISO
  snippet?: string
  confidence: number // 0..1
}

export type PrimaryContact = {
  id: string
  name: string
  email?: string
  phone?: string
  title?: string
}

export type Startup = {
  id: string
  name: string
  logoUrl?: string
  website?: string
  batch?: string // e.g., "Batch 13"
  city?: string
  state?: string
  country?: string
  sdgs: number[] // SDG ids
  sector:
    | "Healthcare"
    | "Food"
    | "Consumer Products"
    | "Bau"
    | "Gesellschaft & Soziales"
    | "Kreislaufwirtschaft"
    | "Lebenswerte Städte & Mobilität"
    | "Bildung & Inklusion"
    | "Demokratie & resiliente Gesellschaft"
    | "Klimaschutz & erneuerbare Energien"
    | "Ernährung & nachhaltige Landwirtschaft"
    | "Gesundheit & Pflege"
  status: "active" | "pivoted" | "acquired" | "dormant"
  programPhase?: string // Programmphase from Salesforce
  primaryContact?: PrimaryContact // Primary Contact from Salesforce
  headcount?: number
  lastFundingRound?: {
    stage: "Pre-seed" | "Seed" | "Series A" | null
    date?: string
    amountEUR?: number
  }
  description?: string // Detailed description for the modal
  official: {
    // from Impact-Factory website
    oneLiner?: string
    description?: string
    updatedAt?: string
  }
  latest: {
    // aggregated by crawler
    oneLiner?: string
    description?: string
    headquarters?: string
    productUpdates?: string[] // short bullets
    techStack?: string[]
    hiring?: boolean
    socials?: { linkedin?: string; x?: string }
    updatedAt?: string
  }
  quality: {
    freshnessDays: number
    completenessPct: number // 0..100
    discrepancyScore: number // 0..100 (higher = more drift vs official)
    lastCheckedAt: string
  }
  sources: SourceHit[]
  notes: { id: string; author: string; text: string; createdAt: string }[]
}

export type CrawlRun = {
  id: string
  startedAt: string
  finishedAt?: string
  status: "running" | "success" | "partial" | "failed"
  totalTargets: number
  scanned: number
  updated: number
  errors: number
  durationSec?: number
  sources: ("website" | "linkedin" | "news" | "crunchbase" | "x" | "press")[]
  message?: string
}

