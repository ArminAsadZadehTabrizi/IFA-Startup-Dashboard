"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useStartups, useCrawlRuns, useSDGs } from "@/hooks/use-dashboard-data"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { ChartsSection } from "@/components/dashboard/charts-section"
import { FilterBar } from "@/components/dashboard/filter-bar"
import { StartupsTable } from "@/components/dashboard/startups-table"
import { CrawlerSimulation } from "@/components/crawler-simulation"
import { FeedbackButton } from "@/components/feedback-modal"
import { signOut, useSession } from "next-auth/react"
import { LogOut, Newspaper } from "lucide-react"
import Image from "next/image"

export default function DashboardPage() {
  const { data: session } = useSession()
  const { data: startups, isLoading: startupsLoading, error: startupsError } = useStartups()
  const { data: crawlRuns, isLoading: crawlRunsLoading } = useCrawlRuns()
  const { data: sdgs, isLoading: sdgsLoading } = useSDGs()

  // Debug logging
  useEffect(() => {
    if (startups) {
      console.log('✅ Startups loaded in Dashboard:', startups.length, startups)
    }
    if (startupsError) {
      console.error('❌ Startups error in Dashboard:', startupsError)
    }
    console.log('Dashboard state:', { 
      startupsCount: startups?.length || 0, 
      isLoading: startupsLoading, 
      hasError: !!startupsError 
    })
  }, [startups, startupsLoading, startupsError])

  const [showCrawlerSimulation, setShowCrawlerSimulation] = useState(false)
  const [showTable, setShowTable] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    batches: [] as string[],
    sectors: [] as string[],
    sdgs: [] as number[],
    statuses: [] as string[],
    cities: [] as string[],
    states: [] as string[],
    organizations: [] as string[],
    discrepancyRange: [0, 100] as [number, number],
    freshnessRange: [0, 180] as [number, number],
  })

  const isLoading = startupsLoading || crawlRunsLoading || sdgsLoading

  // Zeige Fehler an falls Startups nicht geladen werden können
  if (startupsError && !isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="max-w-2xl">
          <CardHeader>
            <h2 className="text-xl font-bold text-red-600">Fehler beim Laden der Startups</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{startupsError.message}</p>
            <p className="text-sm text-muted-foreground">
              Stelle sicher, dass die Daten-Dateien im public/data/ Ordner vorhanden sind.
            </p>
            <Button onClick={() => window.location.reload()}>Seite neu laden</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="h-10 bg-muted rounded-lg w-96 animate-pulse"></div>
              <div className="h-5 bg-muted rounded w-80 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 bg-muted rounded-lg w-24 animate-pulse"></div>
              <div className="h-9 bg-muted rounded-lg w-28 animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="card-enhanced animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-8 space-y-8">
        {/* Header */}
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
              <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">Impact Startups Dashboard</h1>
              <p className="text-sm sm:text-lg text-slate-300 leading-relaxed">
                Überwachung und Vergleich von Startup-Daten aus der Impact Factory
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {session?.user && (
              <div className="text-slate-300 text-sm hidden sm:flex items-center gap-2">
                <span>Angemeldet als: <strong>{session.user.name}</strong></span>
              </div>
            )}
            <Button
              variant="outline"
              size="default"
              className="btn-modern bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white w-full sm:w-auto"
              asChild
            >
              <Link href="/news">
                <Newspaper className="w-4 h-4 mr-2" />
                News Feed
              </Link>
            </Button>
            <Button
              variant="outline"
              size="default"
              className="btn-modern bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white w-full sm:w-auto"
            >
              ↓ Exportieren
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="btn-modern bg-transparent border-red-600 text-red-300 hover:bg-red-700 hover:text-white w-full sm:w-auto flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Abmelden
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <KPICards startups={startups || []} crawlRuns={crawlRuns || []} />

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          startups={startups || []}
          sdgs={sdgs || []}
        />

        {/* Startups Table with Toggle */}
        <div className="relative">
          {/* Toggle Button */}
          <Button
            onClick={() => setShowTable(!showTable)}
            variant="outline"
            size="sm"
            className="absolute -top-12 right-0 z-10 flex items-center gap-2"
          >
            {showTable ? (
              <>
                <span>Liste ausblenden</span>
                <span>▲</span>
              </>
            ) : (
              <>
                <span>Liste anzeigen</span>
                <span>▼</span>
              </>
            )}
          </Button>
          
          {showTable && (
            <StartupsTable startups={startups || []} sdgs={sdgs || []} filters={filters} searchQuery={searchQuery} />
          )}
        </div>

        {/* Charts Section */}
        <ChartsSection startups={startups || []} sdgs={sdgs || []} />
      </div>

      <CrawlerSimulation isOpen={showCrawlerSimulation} onClose={() => setShowCrawlerSimulation(false)} />
      
      {/* Feedback Button - Fixed Bottom Right */}
      <FeedbackButton />
    </div>
  )
}
