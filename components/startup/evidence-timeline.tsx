"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExternalLink, Globe, Linkedin, Twitter, FileText, Newspaper, Database } from "lucide-react"
import type { Startup } from "@/lib/types"
import { formatRelativeTime } from "@/lib/utils"

interface EvidenceTimelineProps {
  startup: Startup
}

const SOURCE_ICONS = {
  website: Globe,
  linkedin: Linkedin,
  x: Twitter,
  news: Newspaper,
  crunchbase: Database,
  press: FileText,
}

const SOURCE_COLORS = {
  website: "text-blue-600",
  linkedin: "text-blue-700",
  x: "text-black",
  news: "text-orange-600",
  crunchbase: "text-green-600",
  press: "text-purple-600",
}

export function EvidenceTimeline({ startup }: EvidenceTimelineProps) {
  const [sourceFilter, setSourceFilter] = useState<string>("all")

  const filteredSources = startup.sources.filter((source) => sourceFilter === "all" || source.source === sourceFilter)

  const uniqueSources = [...new Set(startup.sources.map((s) => s.source))]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Evidence & Timeline</CardTitle>
            <p className="text-sm text-muted-foreground">Source hits and data collection history</p>
          </div>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {uniqueSources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source.charAt(0).toUpperCase() + source.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredSources.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No sources found for this startup</p>
            <p className="text-sm">Data will appear here after the next crawl</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSources
              .sort((a, b) => new Date(b.publishedAt || "").getTime() - new Date(a.publishedAt || "").getTime())
              .map((source, index) => {
                const Icon = SOURCE_ICONS[source.source]
                const colorClass = SOURCE_COLORS[source.source]

                return (
                  <div key={source.id} className="flex gap-4 p-4 rounded-lg border bg-card/50">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-full bg-muted ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm leading-tight mb-1">{source.title}</h4>

                          {source.snippet && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{source.snippet}</p>
                          )}

                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {source.source}
                            </Badge>

                            <span className="flex items-center gap-1">
                              Confidence: {Math.round(source.confidence * 100)}%
                            </span>

                            {source.publishedAt && <span>{formatRelativeTime(source.publishedAt)}</span>}
                          </div>
                        </div>

                        <Button variant="ghost" size="sm" asChild>
                          <a href={source.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
