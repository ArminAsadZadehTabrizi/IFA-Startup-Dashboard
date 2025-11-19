"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Startup, SDG } from "@/lib/types"
import type { JSX } from "react/jsx-runtime" // Import JSX to fix the undeclared variable error

interface ChartsSectionProps {
  startups: Startup[]
  sdgs: SDG[]
}

const SECTOR_COLORS: Record<string, string> = {
  Healthcare: "#dc2626",
  Food: "#ea580c",
  "Consumer Products": "#0891b2",
  Bau: "#ca8a04",
  "Gesellschaft & Soziales": "#be185d",
  Kreislaufwirtschaft: "#059669",
  "Lebenswerte Städte & Mobilität": "#7c3aed",
  "Bildung & Inklusion": "#3b82f6",
  "Demokratie & resiliente Gesellschaft": "#be185d",
  "Klimaschutz & erneuerbare Energien": "#16a34a",
  "Ernährung & nachhaltige Landwirtschaft": "#ea580c",
  "Gesundheit & Pflege": "#dc2626",
}

export function ChartsSection({ startups, sdgs }: ChartsSectionProps) {
  // Prepare scatter plot data
  const scatterData = startups.map((startup) => ({
    x: startup.quality.freshnessDays,
    y: startup.quality.discrepancyScore,
    name: startup.name,
    sector: startup.sector,
    batch: startup.batch,
    color: SECTOR_COLORS[startup.sector] || "#6b7280",
  }))

  // Prepare SDG data
  const sdgData = sdgs
    .map((sdg) => {
      const count = startups.filter((startup) => startup.sdgs.includes(sdg.id)).length
      return {
        id: sdg.id,
        name: sdg.name,
        count,
      }
    })
    .filter((item) => item.count > 0)
    .sort((a, b) => a.id - b.id) // Sort by SDG number

  // Prepare program phase data
  const programPhaseColors = [
    "#16a34a", // green
    "#3b82f6", // blue
    "#eab308", // yellow
    "#dc2626", // red
    "#7c3aed", // purple
    "#0891b2", // cyan
    "#ea580c", // orange
    "#be185d", // pink
  ]

  const phaseData = Object.entries(
    startups.reduce(
      (acc, startup) => {
        if (startup.programPhase) {
          acc[startup.programPhase] = (acc[startup.programPhase] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    ),
  )
    .map(([phase, count], index) => ({
      name: phase,
      value: count,
      percentage: Math.round((count / startups.length) * 100),
      color: programPhaseColors[index % programPhaseColors.length],
    }))
    .sort((a, b) => b.value - a.value) // Sort by count descending

  // Prepare sector data
  const sectorData = Object.entries(
    startups.reduce(
      (acc, startup) => {
        acc[startup.sector] = (acc[startup.sector] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  )
    .map(([sector, count]) => ({
      name: sector,
      count,
      color: SECTOR_COLORS[sector] || "#6b7280",
    }))
    .sort((a, b) => b.count - a.count) // Sort by count descending

  const maxSDGCount = Math.max(...sdgData.map((item) => item.count))
  const maxSectorCount = Math.max(...sectorData.map((item) => item.count))
  const maxFreshness = Math.max(...scatterData.map((item) => item.x))
  const maxDiscrepancy = Math.max(...scatterData.map((item) => item.y))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Data Quality Scatter Plot */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Data Quality Overview</CardTitle>
          <p className="text-sm text-muted-foreground">Discrepancy vs Freshness by Sector</p>
        </CardHeader>
        <CardContent>
          <div className="relative h-80 bg-gray-50 rounded-lg p-4">
            {/* Axes */}
            <div className="absolute bottom-4 left-4 right-4 h-px bg-gray-300"></div>
            <div className="absolute bottom-4 left-4 top-4 w-px bg-gray-300"></div>

            {/* Axis labels */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
              Freshness (days)
            </div>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-gray-600">
              Discrepancy (%)
            </div>

            {/* Data points */}
            {scatterData.map((point, index) => (
              <div
                key={index}
                className="absolute w-3 h-3 rounded-full cursor-pointer hover:scale-125 transition-transform"
                style={{
                  backgroundColor: point.color,
                  left: `${20 + (point.x / maxFreshness) * 70}%`,
                  bottom: `${15 + (point.y / maxDiscrepancy) * 70}%`,
                }}
                title={`${point.name} - ${point.sector}\nFreshness: ${point.x} days\nDiscrepancy: ${point.y}%`}
              />
            ))}

            {/* Grid lines */}
            <div className="absolute inset-4 opacity-20">
              {[0, 25, 50, 75, 100].map((percent) => (
                <div key={percent} className="absolute border-l border-gray-300" style={{ left: `${percent}%` }} />
              ))}
              {[0, 25, 50, 75, 100].map((percent) => (
                <div key={percent} className="absolute border-t border-gray-300" style={{ bottom: `${percent}%` }} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Programmphase Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Programmphase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {phaseData.length > 0 ? (
              <>
                {phaseData.map((phase, index) => (
                  <div key={phase.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: phase.color }} />
                      <span className="text-sm font-medium">{phase.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{phase.value}</div>
                      <div className="text-xs text-gray-500">{phase.percentage}%</div>
                    </div>
                  </div>
                ))}

                {/* Visual pie representation */}
                <div className="mt-6 flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {
                        phaseData.reduce(
                          (acc, phase, index) => {
                            const startAngle = acc.currentAngle
                            const angle = (phase.percentage / 100) * 360
                            const endAngle = startAngle + angle

                            const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
                            const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
                            const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180)
                            const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180)

                            const largeArc = angle > 180 ? 1 : 0
                            const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`

                            acc.paths.push(
                              <path
                                key={index}
                                d={pathData}
                                fill={phase.color}
                                className="hover:opacity-80 transition-opacity"
                              />,
                            )

                            acc.currentAngle = endAngle
                            return acc
                          },
                          { paths: [] as JSX.Element[], currentAngle: 0 },
                        ).paths
                      }
                    </svg>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Keine Programmphase-Daten verfügbar
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SDG Bar Chart */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Startups by SDG</CardTitle>
          <p className="text-sm text-muted-foreground">Distribution across Sustainable Development Goals</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sdgData.map((sdg, index) => (
              <div key={sdg.id} className="flex items-center gap-4">
                <div className="w-16 text-sm font-bold" title={sdg.name}>
                  SDG {sdg.id}
                </div>
                <div className="flex-1 relative">
                  <div className="h-8 bg-gray-100 rounded-md overflow-hidden">
                    <div
                      className="h-full bg-[#D4AE36] transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${(sdg.count / maxSDGCount) * 100}%` }}
                      title={sdg.name}
                    >
                      <span className="text-xs font-bold text-white">{sdg.count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sector Bar Chart */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Startups by Sector</CardTitle>
          <p className="text-sm text-muted-foreground">Distribution across sectors</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sectorData.map((sector, index) => (
              <div key={sector.name} className="flex items-center gap-4">
                <div className="w-64 text-sm font-medium truncate" title={sector.name}>
                  {sector.name}
                </div>
                <div className="flex-1 relative">
                  <div className="h-8 bg-gray-100 rounded-md overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ 
                        width: `${(sector.count / maxSectorCount) * 100}%`,
                        backgroundColor: sector.color
                      }}
                    >
                      <span className="text-xs font-bold text-white">{sector.count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
