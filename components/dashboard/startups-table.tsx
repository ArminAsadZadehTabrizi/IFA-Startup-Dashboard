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
  filters: any
  searchQuery: string
}

export function StartupsTable({ startups, sdgs, filters, searchQuery }: StartupsTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<{ name: string; email?: string; phone?: string; title?: string } | null>(null)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isStartupColumnFixed, setIsStartupColumnFixed] = useState(true)

  const filteredStartups = useMemo(() => {
    return startups.filter((startup) => {
      // Search filter
      if (
        searchQuery &&
        !startup.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !startup.website?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // Batch filter
      if (filters.batches.length > 0 && !filters.batches.includes(startup.batch || '')) {
        return false
      }

      // Sector filter
      if (filters.sectors.length > 0 && !filters.sectors.includes(startup.sector)) {
        return false
      }

      // SDG filter - check if startup has any of the filtered SDGs
      if (filters.sdgs.length > 0) {
        const hasMatchingSdg = filters.sdgs.some(sdgId => startup.sdgs.includes(sdgId))
        if (!hasMatchingSdg) {
          return false
        }
      }

      // Programmphase filter (using statuses array)
      if (filters.statuses.length > 0 && !filters.statuses.includes(startup.programPhase || '')) {
        return false
      }

      // City filter
      if (filters.cities.length > 0 && !filters.cities.includes(startup.city || '')) {
        return false
      }

      // State/Bundesland filter
      if (filters.states && filters.states.length > 0 && !filters.states.includes(startup.state || '')) {
        return false
      }

      return true
    })
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Startups ({filteredStartups.length})</CardTitle>
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
              <TableRow className={isStartupColumnFixed ? 'relative' : ''}>
                <TableHead className={`w-12 ${isStartupColumnFixed ? 'sticky left-0 z-30 bg-white dark:bg-gray-950 border-r after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-border' : ''}`}>
                  <input
                    type="checkbox"
                    className="rounded"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(filteredStartups.map((s) => s.id))
                      } else {
                        setSelectedRows([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead className={`${isStartupColumnFixed ? 'sticky left-0 z-30 relative' : ''}`} style={isStartupColumnFixed ? { 
                  backgroundColor: 'white',
                  width: '220px',
                  minWidth: '220px',
                  paddingLeft: '60px',
                  paddingRight: '24px',
                  boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
                  borderRight: '1px solid #e5e7eb'
                } : {}}>Startup</TableHead>
                <TableHead className={isStartupColumnFixed ? 'pl-6' : ''}>Batch</TableHead>
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
              {filteredStartups.map((startup) => (
                <TableRow key={startup.id} className={isStartupColumnFixed ? 'relative' : ''}>
                  <TableCell className={isStartupColumnFixed ? 'sticky left-0 z-20 bg-white dark:bg-gray-950 border-r after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-border' : ''}>
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedRows.includes(startup.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows([...selectedRows, startup.id])
                        } else {
                          setSelectedRows(selectedRows.filter((id) => id !== startup.id))
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className={`${isStartupColumnFixed ? 'sticky left-0 z-20 relative' : ''}`} style={isStartupColumnFixed ? {
                    backgroundColor: 'white',
                    width: '220px',
                    minWidth: '220px',
                    paddingLeft: '60px',
                    paddingRight: '24px',
                    boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
                    borderRight: '1px solid #e5e7eb'
                  } : {}}>
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
                  <TableCell className={isStartupColumnFixed ? 'pl-6' : ''}>
                    <Badge variant="outline">{startup.batch}</Badge>
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
