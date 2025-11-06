import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"
import type { Startup } from "@/lib/types"
import { formatRelativeTime } from "@/lib/utils"

interface MetricsSectionProps {
  startup: Startup
}

export function MetricsSection({ startup }: MetricsSectionProps) {
  const { quality } = startup

  // Calculate next crawl time (mock - in real app this would come from backend)
  const nextCrawl = new Date()
  nextCrawl.setHours(nextCrawl.getHours() + 24)

  const getFreshnessColor = (days: number) => {
    if (days <= 7) return "text-green-600"
    if (days <= 30) return "text-yellow-600"
    return "text-red-600"
  }

  const getCompletenessColor = (pct: number) => {
    if (pct >= 90) return "text-green-600"
    if (pct >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getDiscrepancyColor = (score: number) => {
    if (score <= 20) return "text-green-600"
    if (score <= 50) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Data Quality Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Freshness */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Freshness</span>
            </div>
            <span className={`text-sm font-bold ${getFreshnessColor(quality.freshnessDays)}`}>
              {quality.freshnessDays} days
            </span>
          </div>
          <Progress value={Math.max(0, 100 - (quality.freshnessDays / 180) * 100)} className="h-2" />
          <p className="text-xs text-muted-foreground">Data age since last update</p>
        </div>

        {/* Completeness */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Completeness</span>
            </div>
            <span className={`text-sm font-bold ${getCompletenessColor(quality.completenessPct)}`}>
              {quality.completenessPct}%
            </span>
          </div>
          <Progress value={quality.completenessPct} className="h-2" />
          <p className="text-xs text-muted-foreground">Profile fields populated</p>
        </div>

        {/* Discrepancy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Discrepancy</span>
            </div>
            <span className={`text-sm font-bold ${getDiscrepancyColor(quality.discrepancyScore)}`}>
              {quality.discrepancyScore}%
            </span>
          </div>
          <Progress value={quality.discrepancyScore} className="h-2" />
          <p className="text-xs text-muted-foreground">Drift from official data</p>
        </div>

        {/* Last Checked */}
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last checked:</span>
            <span className="font-medium">{formatRelativeTime(quality.lastCheckedAt)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Next crawl:</span>
            <div className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              <span className="font-medium">
                {nextCrawl.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </div>

        {/* Quality Badge */}
        <div className="pt-2">
          <div className="text-xs text-muted-foreground mb-2">Overall Quality:</div>
          <Badge
            variant="outline"
            className={`w-full justify-center ${
              quality.completenessPct >= 90 && quality.freshnessDays <= 7 && quality.discrepancyScore <= 20
                ? "border-green-600 text-green-600"
                : quality.completenessPct >= 70 && quality.freshnessDays <= 30 && quality.discrepancyScore <= 50
                  ? "border-yellow-600 text-yellow-600"
                  : "border-red-600 text-red-600"
            }`}
          >
            {quality.completenessPct >= 90 && quality.freshnessDays <= 7 && quality.discrepancyScore <= 20
              ? "Excellent"
              : quality.completenessPct >= 70 && quality.freshnessDays <= 30 && quality.discrepancyScore <= 50
                ? "Good"
                : "Needs Attention"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
