"use client"

import { useState, useEffect } from "react"
import type { Startup, CrawlRun, SDG } from "@/lib/types"

// Static data fetcher - loads from public/data folder
const fetcher = async (url: string) => {
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Data loading error [${response.status}]:`, errorText)
      throw new Error(`Failed to load ${url}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log(`Loaded ${url}:`, Array.isArray(data) ? `${data.length} items` : 'object')
    return data
  } catch (error) {
    console.error(`Load error for ${url}:`, error)
    throw error
  }
}

function useAsyncData<T>(url: string) {
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await fetcher(url)
        if (!cancelled) {
          setData(result as T)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Unknown error"))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [url])

  return { data, error, isLoading }
}

export function useStartups() {
  return useAsyncData<Startup[]>("/data/startups.json")
}

export function useCrawlRuns() {
  return useAsyncData<CrawlRun[]>("/data/crawl-runs.json")
}

export function useSDGs() {
  return useAsyncData<SDG[]>("/data/sdgs.json")
}

export function useStartup(id: string) {
  const { data: startups, error, isLoading } = useStartups()
  const startup = startups?.find((s) => s.id === id)

  return {
    data: startup,
    error: error || (!startup && !isLoading ? new Error("Startup not found") : null),
    isLoading,
  }
}

export function useAIInsights() {
  return useAsyncData<{ insights: any[]; lastUpdated?: string }>("/data/ai-insights.json")
}

export function useAIInsight(startupId: string) {
  const { data: aiInsightsData, error, isLoading } = useAIInsights()
  const rawInsight = aiInsightsData?.insights?.find((i) => i.startup_id === startupId)

  // Transform the data structure to match the component's expectations
  const insight = rawInsight ? {
    startup_id: rawInsight.startup_id,
    startup_name: rawInsight.startup_name,
    analyzed_at: rawInsight.analyzed_at,
    status: rawInsight.status || 'unknown',
    // Transform updates/recent_updates to match expected structure
    updates: (rawInsight.recent_updates || rawInsight.updates || []).map((update: any) => ({
      date: update.date,
      title: update.title || update.description?.substring(0, 50) + '...' || 'Update',
      description: update.description,
      source: update.source || update.source_url,
      category: update.category,
      impact_score: update.impact_score,
      verified: update.verified,
    })),
    business_metrics: rawInsight.business_metrics ? {
      estimated_revenue_trend: rawInsight.business_metrics.revenue_trend || rawInsight.business_metrics.estimated_revenue_trend,
      team_size_trend: rawInsight.business_metrics.team_growth || rawInsight.business_metrics.team_size_trend,
      team_size: typeof rawInsight.team_size === 'number' ? rawInsight.team_size : 
                 rawInsight.business_metrics.team_size !== undefined && rawInsight.business_metrics.team_size !== 'Unknown' ? rawInsight.business_metrics.team_size : undefined,
      team_size_source: rawInsight.team_size_source !== 'Unknown' ? rawInsight.team_size_source : rawInsight.business_metrics.team_size_source,
      market_presence: rawInsight.business_metrics.market_presence,
      funding_status: rawInsight.business_metrics.funding_status,
      last_active_date: rawInsight.business_metrics.last_active_date,
    } : undefined,
    founders: rawInsight.founders,
    ai_analysis: {
      summary: rawInsight.ai_summary || rawInsight.ai_analysis?.summary,
      strengths: rawInsight.strengths || rawInsight.ai_analysis?.strengths || [],
      concerns: rawInsight.concerns || rawInsight.ai_analysis?.concerns || [],
      recommendation: rawInsight.recommendation || rawInsight.ai_analysis?.recommendation,
      confidence_score: rawInsight.confidence_score || rawInsight.ai_analysis?.confidence_score,
      data_quality: rawInsight.data_quality !== undefined ? `${rawInsight.data_quality}%` : rawInsight.ai_analysis?.data_quality,
    },
    sector_classification: rawInsight.sector_classification,
    sources_checked: rawInsight.sources_checked,
    data_freshness: rawInsight.data_freshness || 'none',
    search_notes: rawInsight.search_notes,
  } : undefined

  return {
    data: insight,
    error,
    isLoading,
  }
}

