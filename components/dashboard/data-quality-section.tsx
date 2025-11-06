import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Startup } from "@/lib/types"
import { formatRelativeTime } from "@/lib/utils"

interface DataQualitySectionProps {
  startups: Startup[]
}

export function DataQualitySection({ startups }: DataQualitySectionProps) {
  const lowQualityStartups = startups.filter((s) => s.quality.completenessPct < 80 || s.quality.freshnessDays > 60)

  const highDriftStartups = startups.filter((s) => s.quality.discrepancyScore >= 50)

  const staleStartups = startups.filter((s) => s.quality.freshnessDays > 90)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Low Quality Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-yellow-600">⚠️</span>
            Low Quality Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lowQualityStartups.slice(0, 5).map((startup) => (
              <div key={startup.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div>
                  <div className="font-medium text-sm">{startup.name}</div>
                  <div className="text-xs text-muted-foreground">{startup.quality.completenessPct}% complete</div>
                </div>
                <Button size="sm" variant="outline">
                  Review
                </Button>
              </div>
            ))}
            {lowQualityStartups.length === 0 && (
              <p className="text-sm text-muted-foreground">No quality issues found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* High Drift */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            High Drift ({highDriftStartups.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {highDriftStartups.slice(0, 5).map((startup) => (
              <div key={startup.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div>
                  <div className="font-medium text-sm">{startup.name}</div>
                  <div className="text-xs text-muted-foreground">{startup.quality.discrepancyScore}% discrepancy</div>
                </div>
                <Button size="sm" variant="outline">
                  Compare
                </Button>
              </div>
            ))}
            {highDriftStartups.length === 0 && <p className="text-sm text-muted-foreground">No high drift detected</p>}
          </div>
        </CardContent>
      </Card>

      {/* Stale Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-orange-600">⏰</span>
            Stale Data ({staleStartups.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {staleStartups.slice(0, 5).map((startup) => (
              <div key={startup.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div>
                  <div className="font-medium text-sm">{startup.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatRelativeTime(startup.quality.lastCheckedAt)}
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Re-crawl
                </Button>
              </div>
            ))}
            {staleStartups.length === 0 && <p className="text-sm text-muted-foreground">All data is fresh</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
