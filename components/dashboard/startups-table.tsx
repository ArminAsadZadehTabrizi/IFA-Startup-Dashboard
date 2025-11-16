"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Startup, SDG } from "@/lib/types"
import { formatRelativeTime, getStatusColor, getQualityColor } from "@/lib/utils"
import { StartupDetailsModal } from "./startup-details-modal"

interface StartupsTableProps {
  startups: Startup[]
  sdgs: SDG[]
  filters: {
    batches: string[]
    sectors: string[]
    sdgs: number[]
    statuses: string[]
    cities: string[]
    states: string[]
    organizations: string[]
    discrepancyRange: [number, number]
    freshnessRange: [number, number]
  }
  searchQuery: string
}

export function StartupsTable({ startups, sdgs, filters, searchQuery }: StartupsTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<{ name: string; email?: string; phone?: string; title?: string } | null>(null)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isStartupColumnFixed, setIsStartupColumnFixed] = useState(false)

  const filteredStartups = useMemo(() => {
    let result = [...startups]
    
    // Apply search filter - search across name, sector, city, and primary contact name
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(startup => {
        // Search in startup name
        if (startup.name.toLowerCase().includes(query)) return true
        
        // Search in sector
        if (startup.sector.toLowerCase().includes(query)) return true
        
        // Search in city
        if (startup.city?.toLowerCase().includes(query)) return true
        
        // Search in state
        if (startup.state?.toLowerCase().includes(query)) return true
        
        // Search in batch
        if (startup.batch?.toLowerCase().includes(query)) return true
        
        // Search in primary contact name
        if (startup.primaryContact?.name.toLowerCase().includes(query)) return true
        
        // Search in website
        if (startup.website?.toLowerCase().includes(query)) return true
        
        return false
      })
    }
    
    // Apply batch filter
    if (filters.batches?.length > 0) {
      result = result.filter(startup => 
        filters.batches.includes(startup.batch || '')
      )
    }
    
    // Apply sector filter
    if (filters.sectors?.length > 0) {
      result = result.filter(startup => 
        filters.sectors.includes(startup.sector)
      )
    }
    
    // Apply SDG filter
    if (filters.sdgs?.length > 0) {
      result = result.filter(startup => 
        filters.sdgs.some(sdgId => startup.sdgs.includes(sdgId))
      )
    }
    
    // Apply status/program phase filter
    if (filters.statuses?.length > 0) {
      result = result.filter(startup => 
        filters.statuses.includes(startup.programPhase || '')
      )
    }
    
    // Apply city filter
    if (filters.cities?.length > 0) {
      result = result.filter(startup => 
        filters.cities.includes(startup.city || '')
      )
    }
    
    // Apply state filter
    if (filters.states?.length > 0) {
      result = result.filter(startup => 
        filters.states.includes(startup.state || '')
      )
    }
    
    // Apply organization filter - exact match
    if (filters.organizations?.length > 0) {
      result = result.filter(startup => {
        const org = startup.organization?.trim() || ''
        return filters.organizations.some(filterOrg => filterOrg.trim() === org)
      })
    }
    
    return result
  }, [startups, searchQuery, filters])

  const getSdgNames = (sdgIds: number[]) => {
    return sdgIds.map((id) => sdgs.find((sdg) => sdg.id === id)?.name || `SDG ${id}`)
  }

  const handleViewStartup = (startup: Startup) => {
    setSelectedStartup(startup)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedStartup(null)
  }

  // Build active filters summary
  const activeFiltersSummary = []
  if (searchQuery) activeFiltersSummary.push(`Suche: "${searchQuery}"`)
  if (filters.batches.length > 0) activeFiltersSummary.push(`Batch: ${filters.batches.join(', ')}`)
  if (filters.sectors.length > 0) activeFiltersSummary.push(`Sektor: ${filters.sectors.join(', ')}`)
  if (filters.sdgs.length > 0) {
    const sdgNames = filters.sdgs.map(id => {
      const sdg = sdgs.find(s => s.id === id)
      return sdg ? `${sdg.id}: ${sdg.name}` : `SDG ${id}`
    })
    activeFiltersSummary.push(`SDG: ${sdgNames.join(', ')}`)
  }
  if (filters.statuses.length > 0) activeFiltersSummary.push(`Phase: ${filters.statuses.join(', ')}`)
  if (filters.cities.length > 0) activeFiltersSummary.push(`Stadt: ${filters.cities.join(', ')}`)
  if (filters.states.length > 0) activeFiltersSummary.push(`Bundesland: ${filters.states.join(', ')}`)
  if (filters.organizations.length > 0) activeFiltersSummary.push(`Organisation: ${filters.organizations.join(', ')}`)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle>Startups ({filteredStartups.length})</CardTitle>
            {activeFiltersSummary.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Aktive Filter: {activeFiltersSummary.join(' • ')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedRows.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{selectedRows.length} ausgewählt</span>
                <Button size="sm" variant="outline">
                  <span className="mr-2">⟳</span>
                  Neu crawlen
                </Button>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isStartupColumnFixed}
                onChange={(e) => setIsStartupColumnFixed(e.target.checked)}
                className="rounded"
              />
              Spalte fixieren
            </label>
            <Button size="sm" variant="outline">
              CSV exportieren
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={`w-12 ${isStartupColumnFixed ? 'sticky left-0 z-30 bg-card border-r shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)]' : ''}`}>
                  <input
                    type="checkbox"
                    className="rounded"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(filteredStartups.map((s, idx) => `${s.id}-${idx}`))
                      } else {
                        setSelectedRows([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead 
                  className={isStartupColumnFixed ? 'sticky z-30 bg-card shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)] border-r' : ''}
                  style={isStartupColumnFixed ? { 
                    left: '48px',
                    width: '220px',
                    minWidth: '220px'
                  } : undefined}
                >Startup</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Organisation</TableHead>
                <TableHead>Sektor</TableHead>
                <TableHead>SDGs</TableHead>
                <TableHead>Primary Contact</TableHead>
                <TableHead>Standort</TableHead>
                <TableHead>Programmphase</TableHead>
                <TableHead>Aktualität</TableHead>
                <TableHead>Abweichung</TableHead>
                <TableHead>Zuletzt geprüft</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStartups.map((startup, index) => (
                <TableRow key={`${startup.id}-${index}`}>
                  <TableCell className={isStartupColumnFixed ? 'sticky left-0 z-20 bg-card border-r shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)]' : ''}>
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedRows.includes(`${startup.id}-${index}`)}
                      onChange={(e) => {
                        const rowKey = `${startup.id}-${index}`
                        if (e.target.checked) {
                          setSelectedRows([...selectedRows, rowKey])
                        } else {
                          setSelectedRows(selectedRows.filter((id) => id !== rowKey))
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell 
                    className={isStartupColumnFixed ? 'sticky z-20 bg-card shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)] border-r' : ''}
                    style={isStartupColumnFixed ? {
                      left: '48px',
                      width: '220px',
                      minWidth: '220px'
                    } : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={startup.logoUrl || "/placeholder.svg"} alt={startup.name} />
                        <AvatarFallback>{startup.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium whitespace-nowrap">{startup.name}</div>
                        {startup.website && (
                          <div className="text-xs text-muted-foreground truncate">{startup.website.replace("https://", "").split('/')[0]}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{startup.batch}</Badge>
                  </TableCell>
                  <TableCell>
                    {startup.organization ? (
                      <Badge variant={startup.organization === "IFA" ? "default" : "secondary"}>
                        {startup.organization}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{startup.sector}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {startup.sdgs.slice(0, 2).map((sdgId) => {
                        const sdg = sdgs.find(s => s.id === sdgId)
                        return (
                          <Badge key={sdgId} variant="outline" className="text-xs" title={sdg?.name}>
                            {sdg?.name || `SDG ${sdgId}`}
                          </Badge>
                        )
                      })}
                      {startup.sdgs.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{startup.sdgs.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {startup.primaryContact ? (
                      <div className="text-sm">
                        <button
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                          onClick={() => {
                            setSelectedContact(startup.primaryContact!)
                            setIsContactModalOpen(true)
                          }}
                          title="Kontaktdaten anzeigen"
                        >
                          {startup.primaryContact.name}
                        </button>
                        {startup.primaryContact.title && (
                          <div className="text-xs text-muted-foreground">{startup.primaryContact.title}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {startup.city}, {startup.state}
                    </div>
                  </TableCell>
                  <TableCell>
                    {startup.programPhase ? (
                      <Badge variant="secondary">{startup.programPhase}</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className={`text-sm font-medium ${getQualityColor(100 - startup.quality.freshnessDays)}`}>
                      {startup.quality.freshnessDays}d
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`text-sm font-medium ${getQualityColor(100 - startup.quality.discrepancyScore)}`}>
                      {startup.quality.discrepancyScore}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatRelativeTime(startup.quality.lastCheckedAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleViewStartup(startup)}
                        title="Startup-Details anzeigen"
                      >
                        <span>👁</span>
                      </Button>
                      {startup.website && (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={startup.website} target="_blank" rel="noopener noreferrer" title="Website öffnen">
                            <span>↗</span>
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <StartupDetailsModal
        startup={selectedStartup}
        sdgs={sdgs}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Primary Contact Modal */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kontaktinformationen</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-base font-semibold mt-1">{selectedContact.name}</p>
              </div>
              {selectedContact.title && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Position</label>
                  <p className="text-base mt-1">{selectedContact.title}</p>
                </div>
              )}
              {selectedContact.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">E-Mail</label>
                  <p className="text-base mt-1">
                    <a 
                      href={`mailto:${selectedContact.email}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {selectedContact.email}
                    </a>
                  </p>
                </div>
              )}
              {selectedContact.phone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                  <p className="text-base mt-1">
                    <a 
                      href={`tel:${selectedContact.phone}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {selectedContact.phone}
                    </a>
                  </p>
                </div>
              )}
              {!selectedContact.email && !selectedContact.phone && (
                <div className="text-sm text-muted-foreground italic">
                  Keine Kontaktdaten verfügbar
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
