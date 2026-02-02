"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Newspaper, RefreshCw, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NewsCard } from "@/components/news/news-card"
import { NewsFilter } from "@/components/news/news-filter"
import { NewsletterForm } from "@/components/newsletter-form"
import type { NewsFeed, NewsCategory, NewsItem } from "@/lib/types-news"

export default function NewsPage() {
  const [newsFeed, setNewsFeed] = useState<NewsFeed | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<NewsCategory[]>([])
  const [showHighImpactOnly, setShowHighImpactOnly] = useState(false)
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)
  
  // Lade News beim ersten Rendern
  useEffect(() => {
    loadNews()
  }, [])
  
  const loadNews = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/news')
      
      if (!response.ok) {
        throw new Error(`Failed to load news: ${response.status}`)
      }
      
      const data: NewsFeed = await response.json()
      setNewsFeed(data)
    } catch (err) {
      console.error('Error loading news:', err)
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Filtere News basierend auf aktiven Filtern
  const filteredNews = useMemo(() => {
    if (!newsFeed?.news) return []
    
    return newsFeed.news.filter(news => {
      // Kategorie-Filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(news.category)) {
        return false
      }
      
      // High Impact Filter
      if (showHighImpactOnly && news.impact !== "high") {
        return false
      }
      
      // Verified Filter
      if (showVerifiedOnly && !news.verified) {
        return false
      }
      
      // Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesHeadline = news.headline.toLowerCase().includes(query)
        const matchesSummary = news.summary.toLowerCase().includes(query)
        const matchesStartup = news.startup_name.toLowerCase().includes(query)
        
        if (!matchesHeadline && !matchesSummary && !matchesStartup) {
          return false
        }
      }
      
      return true
    })
  }, [newsFeed, selectedCategories, showHighImpactOnly, showVerifiedOnly, searchQuery])
  
  // Statistiken berechnen
  const stats = useMemo(() => {
    if (!newsFeed?.news) return { total: 0, highImpact: 0, verified: 0, categories: {} }
    
    const categoryCount: Record<string, number> = {}
    let highImpact = 0
    let verified = 0
    
    newsFeed.news.forEach(news => {
      categoryCount[news.category] = (categoryCount[news.category] || 0) + 1
      if (news.impact === "high") highImpact++
      if (news.verified) verified++
    })
    
    return {
      total: newsFeed.news.length,
      highImpact,
      verified,
      categories: categoryCount
    }
  }, [newsFeed])
  
  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 sm:p-8 space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between bg-slate-800 rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-slate-700 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-8 w-48 bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-64 bg-slate-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
          
          {/* Content Skeleton */}
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">News werden geladen...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 sm:p-8 space-y-8">
          {/* Header */}
          <NewsPageHeader />
          
          {/* Error Card */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Fehler beim Laden der News</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{error}</p>
              <div className="flex gap-2">
                <Button onClick={loadNews}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Erneut versuchen
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Zum Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  // Empty State
  if (!newsFeed || newsFeed.news.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 sm:p-8 space-y-8">
          {/* Header */}
          <NewsPageHeader />
          
          {/* Empty Card */}
          <Card className="max-w-2xl mx-auto text-center py-12">
            <CardContent className="space-y-4">
              <Newspaper className="w-12 h-12 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-semibold">Noch keine News vorhanden</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Der News Feed ist leer. Führe das News-Generator-Skript aus, um aktuelle News zu sammeln.
              </p>
              <pre className="bg-muted p-4 rounded-lg text-sm text-left max-w-md mx-auto overflow-x-auto">
                <code>node scripts/generate-news-feed.mjs</code>
              </pre>
              <div className="flex gap-2 justify-center pt-4">
                <Button onClick={loadNews} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Erneut prüfen
                </Button>
                <Button asChild>
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Zum Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  // Main Content
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-8 space-y-8">
        {/* Header */}
        <NewsPageHeader 
          lastUpdated={newsFeed.last_updated}
          totalNews={stats.total}
          onRefresh={loadNews}
        />
        
        {/* Newsletter Signup */}
        <div className="max-w-xl">
          <NewsletterForm />
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            label="Gesamt News" 
            value={stats.total} 
            icon="📰"
          />
          <StatCard 
            label="High Impact" 
            value={stats.highImpact} 
            icon="🔥"
            highlight
          />
          <StatCard 
            label="Verifiziert" 
            value={stats.verified} 
            icon="✅"
          />
          <StatCard 
            label="Kategorien" 
            value={Object.keys(stats.categories).length} 
            icon="🏷️"
          />
        </div>
        
        {/* Filter Bar */}
        <Card>
          <CardContent className="pt-6">
            <NewsFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategories={selectedCategories}
              onCategoriesChange={setSelectedCategories}
              showHighImpactOnly={showHighImpactOnly}
              onHighImpactChange={setShowHighImpactOnly}
              showVerifiedOnly={showVerifiedOnly}
              onVerifiedChange={setShowVerifiedOnly}
              totalNews={stats.total}
              filteredCount={filteredNews.length}
            />
          </CardContent>
        </Card>
        
        {/* News Grid */}
        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map(news => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">
                Keine News entsprechen den ausgewählten Filtern.
              </p>
              <Button 
                variant="link" 
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategories([])
                  setShowHighImpactOnly(false)
                  setShowVerifiedOnly(false)
                }}
              >
                Filter zurücksetzen
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

/**
 * Page Header Component
 */
function NewsPageHeader({ 
  lastUpdated, 
  totalNews,
  onRefresh 
}: { 
  lastUpdated?: string
  totalNews?: number
  onRefresh?: () => void
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between bg-slate-800 rounded-xl p-4 sm:p-6 -mx-2 gap-4 sm:gap-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="flex-shrink-0">
          <Image
            src="/images/impact-factory-logo.png"
            alt="Impact Factory Logo"
            width={120}
            height={60}
            className="h-8 sm:h-12 w-auto object-contain"
            priority
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              📰 News Feed
            </h1>
            {totalNews !== undefined && (
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {totalNews} News
              </span>
            )}
          </div>
          <p className="text-sm sm:text-lg text-slate-300 leading-relaxed">
            Aktuelle Nachrichten aus dem Startup-Ökosystem
            {lastUpdated && (
              <span className="text-slate-400 ml-2 text-sm">
                • Zuletzt aktualisiert: {new Date(lastUpdated).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
        {onRefresh && (
          <Button
            variant="outline"
            size="default"
            className="btn-modern bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white w-full sm:w-auto"
            onClick={onRefresh}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Aktualisieren
          </Button>
        )}
        <Button
          variant="outline"
          size="default"
          className="btn-modern bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white w-full sm:w-auto"
          asChild
        >
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}

/**
 * Stat Card Component
 */
function StatCard({ 
  label, 
  value, 
  icon,
  highlight = false 
}: { 
  label: string
  value: number
  icon: string
  highlight?: boolean
}) {
  return (
    <Card className={`card-enhanced ${highlight ? 'ring-2 ring-primary/30' : ''}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

