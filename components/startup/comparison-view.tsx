import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Database, Calendar, MapPin, Code, Briefcase } from "lucide-react"
import type { Startup } from "@/lib/types"
import { DiffViewer } from "@/components/startup/diff-viewer"

interface ComparisonViewProps {
  startup: Startup
}

export function ComparisonView({ startup }: ComparisonViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Official vs Latest Data Comparison</CardTitle>
        <p className="text-sm text-muted-foreground">Compare official website data with latest crawler findings</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Official Data */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Official (Website)</h3>
              <Badge variant="outline" className="text-xs">
                {startup.official.updatedAt ? new Date(startup.official.updatedAt).toLocaleDateString() : "No date"}
              </Badge>
            </div>

            <div className="space-y-4">
              {startup.official.oneLiner && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">One-liner</label>
                  <p className="text-sm mt-1">{startup.official.oneLiner}</p>
                </div>
              )}

              {startup.official.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm mt-1">{startup.official.description}</p>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 inline mr-1" />
                Last updated:{" "}
                {startup.official.updatedAt ? new Date(startup.official.updatedAt).toLocaleDateString() : "Unknown"}
              </div>
            </div>
          </div>

          {/* Latest Data */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Latest (Crawler)</h3>
              <Badge variant="outline" className="text-xs">
                {startup.latest.updatedAt ? new Date(startup.latest.updatedAt).toLocaleDateString() : "No date"}
              </Badge>
            </div>

            <div className="space-y-4">
              {startup.latest.oneLiner && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">One-liner</label>
                  <p className="text-sm mt-1">{startup.latest.oneLiner}</p>
                </div>
              )}

              {startup.latest.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm mt-1">{startup.latest.description}</p>
                </div>
              )}

              {startup.latest.headquarters && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Headquarters</label>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{startup.latest.headquarters}</span>
                  </div>
                </div>
              )}

              {startup.latest.techStack && startup.latest.techStack.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tech Stack</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {startup.latest.techStack.map((tech, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Code className="h-3 w-3 mr-1" />
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {startup.latest.productUpdates && startup.latest.productUpdates.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Recent Updates</label>
                  <ul className="text-sm mt-1 space-y-1">
                    {startup.latest.productUpdates.map((update, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {update}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {startup.latest.hiring && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-green-600" />
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Currently Hiring
                  </Badge>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 inline mr-1" />
                Last updated:{" "}
                {startup.latest.updatedAt ? new Date(startup.latest.updatedAt).toLocaleDateString() : "Unknown"}
              </div>
            </div>
          </div>
        </div>

        {/* Diff Viewer for One-liner */}
        {startup.official.oneLiner &&
          startup.latest.oneLiner &&
          startup.official.oneLiner !== startup.latest.oneLiner && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-3">One-liner Changes</h4>
              <DiffViewer original={startup.official.oneLiner} modified={startup.latest.oneLiner} />
            </div>
          )}

        {/* Diff Viewer for Description */}
        {startup.official.description &&
          startup.latest.description &&
          startup.official.description !== startup.latest.description && (
            <div className="mt-4">
              <h4 className="font-medium mb-3">Description Changes</h4>
              <DiffViewer original={startup.official.description} modified={startup.latest.description} />
            </div>
          )}
      </CardContent>
    </Card>
  )
}
