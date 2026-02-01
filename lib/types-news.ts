/**
 * News Feed Type Definitions
 * 
 * Diese Typen definieren die Struktur der News-Daten aus news-feed.json.
 * Sie sind separat von den bestehenden Startup-Typen, um Konflikte zu vermeiden.
 */

export type NewsCategory = 
  | "funding"
  | "product"
  | "award"
  | "partnership"
  | "team"
  | "customer"

export type NewsImpact = "high" | "medium" | "low"

export type NewsItem = {
  id: string
  startup_id: string
  startup_name: string
  date: string // ISO date string (YYYY-MM-DD)
  headline: string
  summary: string
  category: NewsCategory
  source_url: string
  impact: NewsImpact
  verified: boolean
  added_at: string // ISO datetime string
}

export type NewsFeed = {
  last_updated: string // ISO datetime string
  total_news: number
  news: NewsItem[]
}

// Kategorie-Konfiguration für UI
export const CATEGORY_CONFIG: Record<NewsCategory, {
  label: string
  emoji: string
  color: string
  bgColor: string
  borderColor: string
}> = {
  funding: {
    label: "Finanzierung",
    emoji: "💰",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200"
  },
  product: {
    label: "Produkt",
    emoji: "🚀",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  award: {
    label: "Auszeichnung",
    emoji: "🏆",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  },
  partnership: {
    label: "Partnerschaft",
    emoji: "🤝",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  team: {
    label: "Team",
    emoji: "👥",
    color: "text-cyan-700",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200"
  },
  customer: {
    label: "Kunde",
    emoji: "🎯",
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200"
  }
}

// Impact-Konfiguration für UI
export const IMPACT_CONFIG: Record<NewsImpact, {
  label: string
  emoji: string
  color: string
}> = {
  high: {
    label: "High Impact",
    emoji: "🔥",
    color: "text-red-600"
  },
  medium: {
    label: "Medium",
    emoji: "📊",
    color: "text-yellow-600"
  },
  low: {
    label: "Low",
    emoji: "📝",
    color: "text-gray-500"
  }
}

