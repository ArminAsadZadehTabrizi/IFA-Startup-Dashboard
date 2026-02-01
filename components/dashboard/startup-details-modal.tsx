"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import type { Startup, SDG } from "@/lib/types"
import { getStatusColor } from "@/lib/utils"
import { AIInsightsSection, type AIInsight } from "@/components/startup/ai-insights-section"
import { DownloadReportButton } from "@/components/startup/download-report-button"

interface StartupDetailsModalProps {
  startup: Startup | null
  sdgs: SDG[]
  isOpen: boolean
  onClose: () => void
}

export function StartupDetailsModal({ startup, sdgs, isOpen, onClose }: StartupDetailsModalProps) {
  const [insight, setInsight] = useState<AIInsight | null>(null)
  const [insightLoading, setInsightLoading] = useState(false)

  // Fetch AI insights when modal opens
  useEffect(() => {
    if (!startup || !isOpen) {
      setInsight(null)
      return
    }

    async function fetchInsights() {
      setInsightLoading(true)
      try {
        // Try to fetch from the static JSON file first
        try {
          const response = await fetch('/data/ai-insights.json')
          if (response.ok) {
            const data = await response.json()
            const insights = data.insights || []
            const match = insights.find((i: AIInsight) => i.startup_id === startup?.id)
            setInsight(match || null)
            setInsightLoading(false)
            return
          }
        } catch {
          // ignore
        }

        // Fallback to API route
        const response = await fetch('/api/ai-insights')
        if (!response.ok) throw new Error('Failed to fetch insights')

        const data = await response.json()
        const insights = data.insights || []
        const match = insights.find((i: AIInsight) => i.startup_id === startup?.id)
        setInsight(match || null)
      } catch {
        setInsight(null)
      } finally {
        setInsightLoading(false)
      }
    }

    fetchInsights()
  }, [startup, isOpen])

  if (!startup) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full sm:max-w-5xl md:max-w-5xl lg:max-w-6xl xl:max-w-6xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={startup.logoUrl || "/placeholder.svg"} alt={startup.name} />
              <AvatarFallback className="text-lg">{startup.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{startup.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(startup.status)}>{startup.status}</Badge>
                <Badge variant="outline">{startup.batch}</Badge>
                <Badge variant="secondary">{startup.sector}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {startup.website && (
                <Button variant="outline" size="sm" asChild>
                  <a href={startup.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
              <DownloadReportButton
                startup={startup}
                insight={insight}
              />
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI-Powered Insights - Main content */}
          <AIInsightsSection startupId={startup.id} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
