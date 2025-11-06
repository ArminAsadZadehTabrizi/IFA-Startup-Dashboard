import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ExternalLink, RefreshCw, Linkedin, Twitter, MapPin, Users, TrendingUp } from "lucide-react"
import type { Startup, SDG } from "@/lib/types"
import { getStatusColor, formatCurrency } from "@/lib/utils"

interface StartupHeaderProps {
  startup: Startup
  sdgs: SDG[]
}

export function StartupHeader({ startup, sdgs }: StartupHeaderProps) {
  const getSdgName = (id: number) => sdgs.find((sdg) => sdg.id === id)?.name || `SDG ${id}`

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Logo and Basic Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={startup.logoUrl || "/placeholder.svg"} alt={startup.name} />
              <AvatarFallback className="text-lg">{startup.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{startup.name}</h1>
                <Badge className={getStatusColor(startup.status)}>{startup.status}</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                {startup.city && startup.state && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {startup.city}, {startup.state}
                  </div>
                )}

                {startup.headcount && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {startup.headcount} employees
                  </div>
                )}

                {startup.batch && <Badge variant="outline">{startup.batch}</Badge>}

                <Badge variant="secondary">{startup.sector}</Badge>
              </div>

              {/* SDGs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {startup.sdgs.map((sdgId) => (
                  <Badge key={sdgId} variant="outline" className="text-xs">
                    {getSdgName(sdgId)}
                  </Badge>
                ))}
              </div>

              {/* Funding Info */}
              {startup.lastFundingRound && (
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span>
                    {startup.lastFundingRound.stage} - {formatCurrency(startup.lastFundingRound.amountEUR || 0)}
                  </span>
                  {startup.lastFundingRound.date && (
                    <span className="text-muted-foreground">
                      ({new Date(startup.lastFundingRound.date).toLocaleDateString()})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 lg:ml-auto">
            <div className="flex gap-2">
              {startup.website && (
                <Button variant="outline" size="sm" asChild>
                  <a href={startup.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
              )}

              <Button size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-crawl Now
              </Button>
            </div>

            {/* Social Links */}
            {startup.latest.socials && (
              <div className="flex gap-2">
                {startup.latest.socials.linkedin && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={startup.latest.socials.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {startup.latest.socials.x && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={startup.latest.socials.x} target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
