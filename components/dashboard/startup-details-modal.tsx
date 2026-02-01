"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import type { Startup, SDG } from "@/lib/types"
import { getStatusColor } from "@/lib/utils"
import { AIInsightsSection } from "@/components/startup/ai-insights-section"

interface StartupDetailsModalProps {
  startup: Startup | null
  sdgs: SDG[]
  isOpen: boolean
  onClose: () => void
}

export function StartupDetailsModal({ startup, sdgs, isOpen, onClose }: StartupDetailsModalProps) {
  if (!startup) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto">
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
            {startup.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={startup.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Website
                </a>
              </Button>
            )}
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
