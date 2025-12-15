"use client"

import { useState } from "react"

export type CrawlStatus = "idle" | "running" | "success" | "error"

export interface CrawlerState {
  status: CrawlStatus
  progress: number
  currentTarget?: string
  message?: string
  scannedCount: number
  updatedCount: number
  errorCount: number
}

export function useCrawler() {
  const [state, setState] = useState<CrawlerState>({
    status: "idle",
    progress: 0,
    scannedCount: 0,
    updatedCount: 0,
    errorCount: 0,
  })

  const startCrawl = async (targets: string[]) => {
    setState({
      status: "running",
      progress: 0,
      scannedCount: 0,
      updatedCount: 0,
      errorCount: 0,
      message: "Initialisiere Crawler...",
    })

    // Note: This is a placeholder - in the original project, this would
    // trigger the actual crawling logic via API calls
    // For the static frontend, this is just a UI simulation
    
    try {
      for (let i = 0; i < targets.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setState(prev => ({
          ...prev,
          progress: ((i + 1) / targets.length) * 100,
          currentTarget: targets[i],
          scannedCount: i + 1,
          message: `Crawle ${targets[i]}...`,
        }))
      }

      setState({
        status: "success",
        progress: 100,
        scannedCount: targets.length,
        updatedCount: targets.length,
        errorCount: 0,
        message: "Crawl abgeschlossen",
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      }))
    }
  }

  const reset = () => {
    setState({
      status: "idle",
      progress: 0,
      scannedCount: 0,
      updatedCount: 0,
      errorCount: 0,
    })
  }

  return {
    ...state,
    startCrawl,
    reset,
  }
}






