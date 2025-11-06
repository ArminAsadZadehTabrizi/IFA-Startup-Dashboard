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
  const insight = aiInsightsData?.insights?.find((i) => i.startup_id === startupId)

  return {
    data: insight,
    error,
    isLoading,
  }
}

