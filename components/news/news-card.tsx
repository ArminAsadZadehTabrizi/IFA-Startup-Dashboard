"use client"

import { ExternalLink, Calendar, Building2, BadgeCheck, Flame } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { NewsItem, CATEGORY_CONFIG, IMPACT_CONFIG } from "@/lib/types-news"

interface NewsCardProps {
  news: NewsItem
}

/**
 * Formatiert ein Datum im deutschen Format
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    })
  } catch {
    return dateString
  }
}

/**
 * Berechnet wie viele Tage seit dem News-Datum vergangen sind
 */
function getDaysAgo(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Heute"
    if (diffDays === 1) return "Gestern"
    if (diffDays < 7) return `vor ${diffDays} Tagen`
    if (diffDays < 14) return "vor 1 Woche"
    if (diffDays < 30) return `vor ${Math.floor(diffDays / 7)} Wochen`
    return `vor ${Math.floor(diffDays / 30)} Monaten`
  } catch {
    return ""
  }
}

export function NewsCard({ news }: NewsCardProps) {
  const categoryConfig = CATEGORY_CONFIG[news.category] || CATEGORY_CONFIG.product
  const impactConfig = IMPACT_CONFIG[news.impact] || IMPACT_CONFIG.medium
  
  return (
    <Card className="card-enhanced hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Farbiger Top-Border basierend auf Kategorie */}
      <div className={`h-1 w-full ${categoryConfig.bgColor.replace('bg-', 'bg-').replace('-50', '-400')}`} />
      
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Kategorie Badge */}
          <Badge 
            variant="outline" 
            className={`${categoryConfig.bgColor} ${categoryConfig.color} ${categoryConfig.borderColor} font-medium`}
          >
            <span className="mr-1">{categoryConfig.emoji}</span>
            {categoryConfig.label}
          </Badge>
          
          {/* High Impact Badge */}
          {news.impact === "high" && (
            <Badge 
              variant="outline" 
              className="bg-red-50 text-red-700 border-red-200 font-medium"
            >
              <Flame className="w-3 h-3 mr-1" />
              High Impact
            </Badge>
          )}
          
          {/* Verifiziert Badge */}
          {news.verified && (
            <Badge 
              variant="outline" 
              className="bg-green-50 text-green-700 border-green-200"
            >
              <BadgeCheck className="w-3 h-3 mr-1" />
              Verifiziert
            </Badge>
          )}
        </div>
        
        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
          {news.headline}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Startup & Datum Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            <span className="font-medium text-foreground">{news.startup_name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(news.date)}</span>
            <span className="text-xs opacity-70">({getDaysAgo(news.date)})</span>
          </div>
        </div>
        
        {/* Summary */}
        <p className="text-muted-foreground leading-relaxed line-clamp-3">
          {news.summary}
        </p>
        
        {/* Actions */}
        {news.source_url && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="btn-modern group/btn"
              asChild
            >
              <a 
                href={news.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <span>Quelle lesen</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 transition-transform group-hover/btn:translate-x-0.5" />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Kompakte News-Karte für Listen
 */
export function NewsCardCompact({ news }: NewsCardProps) {
  const categoryConfig = CATEGORY_CONFIG[news.category] || CATEGORY_CONFIG.product
  
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group">
      {/* Kategorie Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${categoryConfig.bgColor} flex items-center justify-center text-lg`}>
        {categoryConfig.emoji}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm leading-tight truncate group-hover:text-primary transition-colors">
              {news.headline}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {news.startup_name} • {getDaysAgo(news.date)}
            </p>
          </div>
          
          {news.impact === "high" && (
            <Flame className="w-4 h-4 text-red-500 flex-shrink-0" />
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
          {news.summary}
        </p>
      </div>
      
      {/* Link */}
      {news.source_url && (
        <a 
          href={news.source_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  )
}

