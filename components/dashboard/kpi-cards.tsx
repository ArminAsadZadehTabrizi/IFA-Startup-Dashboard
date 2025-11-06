import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Startup, CrawlRun } from "@/lib/types"

interface KPICardsProps {
  startups: Startup[]
  crawlRuns: CrawlRun[]
}

export function KPICards({ startups, crawlRuns }: KPICardsProps) {
  const totalStartups = startups.length

  // Count startups by program phase
  const phaseCounts = startups.reduce(
    (acc, startup) => {
      if (startup.programPhase) {
        acc[startup.programPhase] = (acc[startup.programPhase] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  // Get the top 3 phases for display
  const topPhases = Object.entries(phaseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  const phaseValue = topPhases.map(([phase, count]) => `${count}× ${phase}`).join(" | ")
  const phaseSubtitle = Object.keys(phaseCounts).length > 0 
    ? `${Object.keys(phaseCounts).length} verschiedene Phasen`
    : "Keine Phasen-Daten"

  const kpis = [
    {
      title: "Startups Gesamt",
      value: totalStartups.toString(),
      icon: "👥",
      trend: `Mit Programmphase: ${Object.values(phaseCounts).reduce((a, b) => a + b, 0)}`,
      color: "text-primary",
      bgColor: "bg-primary/5",
    },
    {
      title: "Programmphase",
      value: phaseValue || "—",
      subtitle: phaseSubtitle,
      icon: "📊",
      trend: `Insgesamt ${Object.values(phaseCounts).reduce((a, b) => a + b, 0)} Startups`,
      color: "text-secondary",
      bgColor: "bg-secondary/5",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {kpis.map((kpi, index) => (
        <Card key={index} className="card-enhanced group hover:scale-[1.02] transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
              {kpi.title}
            </CardTitle>
            <div className={`text-2xl p-2 rounded-lg ${kpi.bgColor} transition-colors duration-200`}>{kpi.icon}</div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className={`text-2xl font-bold ${kpi.color} tracking-tight`}>{kpi.value}</div>
            {kpi.subtitle && (
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">{kpi.subtitle}</p>
            )}
            <p className="text-xs text-muted-foreground leading-relaxed">{kpi.trend}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
