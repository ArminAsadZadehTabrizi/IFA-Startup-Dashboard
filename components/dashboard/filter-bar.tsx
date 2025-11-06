"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Startup, SDG } from "@/lib/types"

interface FilterBarProps {
  filters: {
    batches: string[]
    sectors: string[]
    sdgs: number[]
    statuses: string[]
    cities: string[]
    states: string[]
    discrepancyRange: [number, number]
    freshnessRange: [number, number]
  }
  onFiltersChange: (filters: any) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  startups: Startup[]
  sdgs: SDG[]
}

export function FilterBar({ filters, onFiltersChange, searchQuery, onSearchChange, startups, sdgs }: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false)

  // Sort batches numerically (Batch 1, Batch 2, ..., Batch 13)
  const uniqueBatches = [...new Set(startups.map((s) => s.batch).filter(Boolean))].sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0
    const numB = parseInt(b.replace(/\D/g, '')) || 0
    return numA - numB
  })
  
  const uniqueSectors = [...new Set(startups.map((s) => s.sector))]
  
  // Use programPhase instead of status
  const uniqueProgramPhases = [...new Set(startups.map((s) => s.programPhase).filter(Boolean))]
  
  const uniqueCities = [...new Set(startups.map((s) => s.city).filter(Boolean))].sort()
  
  const uniqueStates = [...new Set(startups.map((s) => s.state).filter(Boolean))].sort()

  // Get unique SDGs that are actually used by startups
  const uniqueSdgIds = [...new Set(startups.flatMap((s) => s.sdgs).filter(id => id != null && !isNaN(id)))].sort((a, b) => a - b)
  const availableSdgs = sdgs.filter(sdg => uniqueSdgIds.includes(sdg.id))

  const activeFiltersCount =
    filters.batches.length +
    filters.sectors.length +
    filters.sdgs.length +
    filters.statuses.length +
    filters.cities.length +
    filters.states.length

  const clearAllFilters = () => {
    onFiltersChange({
      batches: [],
      sectors: [],
      sdgs: [],
      statuses: [],
      cities: [],
      states: [],
      discrepancyRange: [0, 100] as [number, number],
      freshnessRange: [0, 180] as [number, number],
    })
  }

  return (
    <Card className="sticky top-6 z-10 card-enhanced backdrop-blur-md bg-card/95">
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-lg">🔍</span>
            <Input
              placeholder="Startups durchsuchen..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-11 bg-background border-border/50 focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="relative btn-modern h-11 px-6"
          >
            <span className="mr-2 text-base">🔽</span>
            Filter
            {activeFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-3 h-6 w-6 p-0 text-xs font-semibold bg-primary text-primary-foreground"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="default" onClick={clearAllFilters} className="btn-modern h-11">
              <span className="mr-2">✕</span>
              Löschen
            </Button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-border/50 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {/* Batch Filter */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center justify-between">
                  <span>Batch</span>
                  {filters.batches.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, batches: [] })}
                      className="h-6 px-2 text-xs"
                    >
                      ✕
                    </Button>
                  )}
                </label>
                <Select
                  value={filters.batches[0] || undefined}
                  onValueChange={(value) => {
                    onFiltersChange({ ...filters, batches: [value] })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Batch auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueBatches.map((batch) => (
                      <SelectItem key={batch} value={batch}>
                        {batch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sector Filter */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center justify-between">
                  <span>Sektor</span>
                  {filters.sectors.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, sectors: [] })}
                      className="h-6 px-2 text-xs"
                    >
                      ✕
                    </Button>
                  )}
                </label>
                <Select
                  value={filters.sectors[0] || undefined}
                  onValueChange={(value) => {
                    onFiltersChange({ ...filters, sectors: [value] })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sektor auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueSectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* SDG Filter */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center justify-between">
                  <span>SDG-Ziel</span>
                  {filters.sdgs.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, sdgs: [] })}
                      className="h-6 px-2 text-xs"
                    >
                      ✕
                    </Button>
                  )}
                </label>
                <Select
                  value={filters.sdgs[0]?.toString() || undefined}
                  onValueChange={(value) => {
                    onFiltersChange({ ...filters, sdgs: [parseInt(value)] })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="SDG auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSdgs.map((sdg) => (
                      <SelectItem key={sdg.id} value={sdg.id.toString()}>
                        {sdg.id}: {sdg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Programmphase Filter */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center justify-between">
                  <span>Programmphase</span>
                  {filters.statuses.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, statuses: [] })}
                      className="h-6 px-2 text-xs"
                    >
                      ✕
                    </Button>
                  )}
                </label>
                <Select
                  value={filters.statuses[0] || undefined}
                  onValueChange={(value) => {
                    onFiltersChange({ ...filters, statuses: [value] })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Programmphase auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Community">Community</SelectItem>
                    <SelectItem value="Early">Early</SelectItem>
                    <SelectItem value="Scale">Scale</SelectItem>
                    <SelectItem value="IFA Scale">IFA Scale</SelectItem>
                    <SelectItem value="abgebrochen">abgebrochen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* City Filter */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center justify-between">
                  <span>Stadt</span>
                  {filters.cities.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, cities: [] })}
                      className="h-6 px-2 text-xs"
                    >
                      ✕
                    </Button>
                  )}
                </label>
                <Select
                  value={filters.cities[0] || undefined}
                  onValueChange={(value) => {
                    onFiltersChange({ ...filters, cities: [value] })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Stadt auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* State/Bundesland Filter */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center justify-between">
                  <span>Bundesland</span>
                  {filters.states.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, states: [] })}
                      className="h-6 px-2 text-xs"
                    >
                      ✕
                    </Button>
                  )}
                </label>
                <Select
                  value={filters.states[0] || undefined}
                  onValueChange={(value) => {
                    onFiltersChange({ ...filters, states: [value] })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Bundesland auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  )
}
