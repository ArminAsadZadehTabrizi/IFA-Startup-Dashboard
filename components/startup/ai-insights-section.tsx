'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Target,
  BarChart3,
  Users,
  DollarSign,
  Award,
  Search,
  Clock,
  Shield,
  UserCircle2,
  Linkedin
} from 'lucide-react'

// Interfaces defined inline to ensure compatibility
export interface AIUpdate {
  date: string
  title: string
  description: string
  source: string
  category: 'funding' | 'product' | 'team' | 'partnership' | 'news' | 'impact' | 'other'
  impact_score: number
  verified?: boolean
}

export interface AIInsight {
  startup_id: string
  startup_name: string
  analyzed_at: string
  status: 'active' | 'dormant' | 'acquired' | 'pivoted' | 'unknown'
  german_summary?: string // New: Professional German summary for alumni analysis
  updates: AIUpdate[]
  business_metrics?: {
    team_size?: number
    team_size_source?: string
    funding_status?: 'seed_funded' | 'series_a' | 'series_b' | 'angel_funded' | 'acquired' | 'bootstrapped' | 'funded' | 'unknown'
    last_activity_date?: string
    awards?: string[]
    key_partnerships?: string[]
    // Legacy fields for backwards compatibility
    estimated_revenue_trend?: 'growing' | 'stable' | 'declining' | 'unknown'
    team_size_trend?: 'growing' | 'stable' | 'declining' | 'unknown'
    market_presence?: 'strong' | 'moderate' | 'weak' | 'unknown'
    last_active_date?: string
  }
  founders?: {
    name: string
    role?: string
    linkedin_url?: string
    linkedin_followers?: number
    last_checked?: string
  }[]
  ai_analysis?: {
    summary: string
    strengths: string[]
    concerns: string[]
    recommendation: 'continue_support' | 'monitor' | 'alumni_inactive' | 'insufficient_data'
    confidence_score: number
    data_quality?: string
  }
  sector_classification?: {
    sector: string
    confidence: number
    reasoning: string
    classified_at: string
  }
  sources_checked?: string[]
  data_freshness: 'fresh' | 'stale' | 'none'
  search_notes?: string
}

interface AIInsightsSectionProps {
  startupId: string
  startupName?: string
}

export function AIInsightsSection({ startupId }: AIInsightsSectionProps) {
  const [insight, setInsight] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useState(() => {
    async function fetchInsights() {
      try {
        // Try to fetch from the static JSON file first (common in global dashboard)
        // or the API if it exists
        try {
          const response = await fetch('/data/ai-insights.json')
          if (response.ok) {
            const data = await response.json()
            const insights = data.insights || []
            const match = insights.find((i: any) => i.startup_id === startupId)
            setInsight(match || null)
            setLoading(false)
            return
          }
        } catch (e) {
          // ignore
        }

        // Fallback to API route
        const response = await fetch('/api/ai-insights')
        if (!response.ok) throw new Error('Failed to fetch insights')

        const data = await response.json()
        const insights = data.insights || []
        const match = insights.find((i: any) => i.startup_id === startupId)

        setInsight(match || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  })

  // Helper functions to handle both data structures
  // PRIORITIZE GERMAN SUMMARY
  const getAISummary = () => insight?.german_summary || insight?.ai_analysis?.summary || insight?.ai_summary || ''

  const getStrengths = () => insight?.ai_analysis?.strengths || insight?.strengths || []
  const getConcerns = () => insight?.ai_analysis?.concerns || insight?.concerns || []
  const getRecommendation = () => insight?.ai_analysis?.recommendation || insight?.recommendation || 'insufficient_data'
  const getConfidenceScore = () => insight?.ai_analysis?.confidence_score || insight?.confidence_score || 0
  const getDataQuality = () => insight?.ai_analysis?.data_quality || insight?.data_quality || 'N/A'
  const getUpdates = () => {
    const updates = insight?.updates || insight?.recent_updates || []
    return updates.map((u: any) => ({
      ...u,
      title: u.title || u.category || 'Update',
      source: u.source || u.source_url || '',
      description: u.description || ''
    }))
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
          <div className="text-sm text-muted-foreground">Lade KI-Analyse...</div>
        </div>
      </Card>
    )
  }

  if (error || !insight) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-700 border-green-200'
      case 'dormant': return 'bg-orange-500/10 text-orange-700 border-orange-200'
      case 'unknown': return 'bg-gray-500/10 text-gray-700 border-gray-200'
      default: return 'bg-blue-500/10 text-blue-700 border-blue-200'
    }
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'continue_support': return 'bg-green-500/10 text-green-700 border-green-200'
      case 'monitor': return 'bg-blue-500/10 text-blue-700 border-blue-200'
      case 'alumni_inactive': return 'bg-orange-500/10 text-orange-700 border-orange-200'
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200'
    }
  }

  const getRecommendationText = (rec: string) => {
    switch (rec) {
      case 'continue_support': return 'Weiter unterstützen'
      case 'monitor': return 'Beobachten'
      case 'alumni_inactive': return 'Alumni - Inaktiv'
      case 'insufficient_data': return 'Unzureichende Daten'
      default: return rec
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'funding': return <DollarSign className="w-4 h-4" />
      case 'product': return <Target className="w-4 h-4" />
      case 'team': return <Users className="w-4 h-4" />
      case 'partnership': return <Award className="w-4 h-4" />
      default: return <Sparkles className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'funding': return 'bg-green-500/10 text-green-700 border-green-200'
      case 'product': return 'bg-purple-500/10 text-purple-700 border-purple-200'
      case 'team': return 'bg-blue-500/10 text-blue-700 border-blue-200'
      case 'partnership': return 'bg-orange-500/10 text-orange-700 border-orange-200'
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200'
    }
  }

  const getFreshnessColor = (freshness: string) => {
    switch (freshness) {
      case 'fresh': return 'text-green-600'
      case 'stale': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const getImpactColor = (score: number) => {
    if (score >= 8) return 'text-red-600 font-bold'
    if (score >= 5) return 'text-orange-600 font-semibold'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header Card */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50 max-w-full overflow-x-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  KI-gestützte Alumni-Analyse
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`${getStatusColor(insight.status)} border`}>
                    {insight.status === 'active' ? 'Aktiv' : insight.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(insight.analyzed_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Data Quality Indicator */}
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <Shield className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">
                  {getDataQuality()}
                </span>
              </div>
              <div className={`text-xs flex items-center gap-1 justify-end ${getFreshnessColor(insight.data_freshness)}`}>
                <Clock className="w-3 h-3" />
                {insight.data_freshness === 'fresh' ? 'Aktiv (kürzlich aktiv)' : insight.data_freshness === 'stale' ? 'Inaktiv (länger keine Aktivität)' : 'Aktivität unbekannt'}
              </div>
            </div>
          </div>

          {/* AI Summary (GERMAN) */}
          {getAISummary() && (
            <div className="bg-white/50 rounded-lg p-4 mb-4 max-h-40 overflow-y-auto">
              <p className="text-sm text-gray-700 leading-relaxed break-words">
                {getAISummary()}
              </p>
            </div>
          )}

          {/* Recommendation & Confidence */}
          <div className="flex items-center gap-3">
            <Badge className={`${getRecommendationColor(getRecommendation())} border text-sm px-3 py-1`}>
              {getRecommendationText(getRecommendation())}
            </Badge>
            {getConfidenceScore() > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BarChart3 className="w-4 h-4" />
                <span>Vertrauenswert: {getConfidenceScore() > 100 ? Math.round(getConfidenceScore() / 100) : Math.round(getConfidenceScore())}%</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Sector Classification */}
      {insight.sector_classification && (
        <Card className="border-blue-200 bg-blue-50/30 max-w-full overflow-x-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-blue-600" />
              <h4 className="text-md font-semibold text-gray-900">Sektorzuordnung</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  {insight.sector_classification.sector}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BarChart3 className="w-4 h-4" />
                  <span>Confidence: {insight.sector_classification.confidence}%</span>
                </div>
              </div>
              {insight.sector_classification.reasoning && (
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed break-words">
                    <span className="font-medium">Begründung:</span> {insight.sector_classification.reasoning}
                  </p>
                </div>
              )}
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Klassifiziert am {formatDate(insight.sector_classification.classified_at)}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Strengths & Concerns */}
      {(getStrengths().length > 0 || getConcerns().length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          {getStrengths().length > 0 && (
            <Card className="border-green-200 bg-green-50/30 max-w-full overflow-x-hidden">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">Stärken</h4>
                </div>
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                  {getStrengths().map((strength: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-green-800">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}

          {/* Concerns */}
          {getConcerns().length > 0 && (
            <Card className="border-orange-200 bg-orange-50/30 max-w-full overflow-x-hidden">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <h4 className="font-semibold text-orange-900">Bedenken</h4>
                </div>
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                  {getConcerns().map((concern: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-orange-800">
                      <span className="text-orange-600 mt-0.5">•</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Founders & LinkedIn Followers */}
      {insight.founders && insight.founders.length > 0 && (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 max-w-full overflow-x-hidden">
          <div className="p-5">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserCircle2 className="w-5 h-5 text-blue-600" />
              Hauptgründer & LinkedIn-Follower
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {insight.founders.map((founder: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-4 border border-blue-100 hover:border-blue-300 transition-all hover:shadow-md min-w-0"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-gray-900 text-sm mb-1 break-words">
                        {founder.name}
                      </h5>
                      {founder.role && (
                        <p className="text-xs text-muted-foreground mb-2 break-words">
                          {founder.role}
                        </p>
                      )}
                    </div>
                    <Linkedin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  </div>

                  {founder.linkedin_followers != null ? (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-md p-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        LinkedIn-Follower
                      </div>
                      <div className="text-2xl font-bold text-blue-900 flex items-baseline gap-2">
                        {founder.linkedin_followers.toLocaleString('de-DE')}
                        <span className="text-xs font-normal text-muted-foreground">
                          Follower
                        </span>
                      </div>
                      {founder.last_checked && (
                        <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(founder.last_checked)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic p-3 bg-gray-50 rounded-md">
                      Keine Follower-Daten verfügbar
                    </div>
                  )}

                  {founder.linkedin_url && (
                    <a
                      href={founder.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline max-w-full overflow-hidden"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      LinkedIn-Profil öffnen
                    </a>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1 bg-blue-50/50 rounded-md p-2">
              <Shield className="w-3 h-3" />
              Daten werden automatisch über LinkedIn-Suche und Google Search Grounding ermittelt
            </div>
          </div>
        </Card>
      )}

      {/* Business Metrics */}
      {insight.business_metrics && (
        <Card className="max-w-full overflow-x-hidden">
          <div className="p-5">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Geschäftskennzahlen
            </h4>

            {/* Exact Team Size - Prominently displayed */}
            {insight.business_metrics.team_size !== undefined && (
              <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Aktuelle Teamgröße</div>
                    <div className="text-3xl font-bold text-blue-900 flex items-baseline gap-2">
                      {insight.business_metrics.team_size}
                      <span className="text-sm font-normal text-muted-foreground">Mitarbeiter</span>
                    </div>
                    {insight.business_metrics.team_size_source && (
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <span>Quelle:</span>
                        <Badge variant="outline" className="text-xs">
                          {insight.business_metrics.team_size_source === 'website' ? 'Website' :
                            insight.business_metrics.team_size_source === 'linkedin' ? 'LinkedIn' :
                              insight.business_metrics.team_size_source}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <Users className="w-12 h-12 text-blue-400 opacity-50" />
                </div>
              </div>
            )}

            {/* New Enriched Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Funding Status */}
              {insight.business_metrics.funding_status && insight.business_metrics.funding_status !== 'unknown' && (
                <div className="space-y-2 p-3 bg-green-50/50 rounded-lg border border-green-100">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Finanzierung
                  </div>
                  <div className="text-sm font-medium">
                    {insight.business_metrics.funding_status === 'seed_funded' ? '🌱 Seed-Finanziert' :
                      insight.business_metrics.funding_status === 'series_a' ? '💰 Series A' :
                        insight.business_metrics.funding_status === 'series_b' ? '💰💰 Series B' :
                          insight.business_metrics.funding_status === 'angel_funded' ? '👼 Angel-Finanziert' :
                            insight.business_metrics.funding_status === 'acquired' ? '🎯 Übernommen' :
                              insight.business_metrics.funding_status === 'bootstrapped' ? '🚀 Bootstrapped' :
                                insight.business_metrics.funding_status === 'funded' ? '💵 Finanziert' :
                                  insight.business_metrics.funding_status}
                  </div>
                </div>
              )}

              {/* Last Activity Date */}
              {insight.business_metrics.last_activity_date && (
                <div className="space-y-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Letzte Aktivität
                  </div>
                  <div className="text-sm font-medium">
                    {formatDate(insight.business_metrics.last_activity_date)}
                  </div>
                </div>
              )}
            </div>

            {/* Awards */}
            {insight.business_metrics.awards && insight.business_metrics.awards.length > 0 && (
              <div className="mt-4 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Auszeichnungen ({insight.business_metrics.awards.length})
                </div>
                <ul className="space-y-1">
                  {insight.business_metrics.awards.map((award: string, idx: number) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">🏆</span>
                      <span>{award}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Partnerships */}
            {insight.business_metrics.key_partnerships && insight.business_metrics.key_partnerships.length > 0 && (
              <div className="mt-4 p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Partnerschaften ({insight.business_metrics.key_partnerships.length})
                </div>
                <ul className="space-y-1">
                  {insight.business_metrics.key_partnerships.map((partnership: string, idx: number) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">🤝</span>
                      <span>{partnership}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Updates Timeline */}
      {getUpdates().length > 0 && (
        <Card className="max-w-full overflow-x-hidden">
          <div className="p-5">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Kürzliche Updates ({getUpdates().length})
            </h4>
            <div className="space-y-4">
              {getUpdates().map((update: any, idx: number) => (
                <div key={idx} className="border-l-2 border-purple-200 pl-4 pb-4 last:pb-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {update.verified && (
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        )}
                        <h5 className="font-medium text-gray-900 text-sm line-clamp-2 break-words">
                          {update.title}
                        </h5>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 max-h-20 overflow-y-auto break-words">
                        {update.description}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={`${getCategoryColor(update.category)} border text-xs`}>
                          <span className="flex items-center gap-1">
                            {getCategoryIcon(update.category)}
                            {update.category}
                          </span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(update.date)}
                        </span>
                        <span className={`text-xs ${getImpactColor(update.impact_score)}`}>
                          Auswirkung: {update.impact_score}/10
                        </span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={update.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2 hover:underline max-w-full"
                  >
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{update.source}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Search Notes & Sources */}
      {(insight.search_notes || insight.sources_checked) && (
        <Card className="border-blue-200 bg-blue-50/20 max-w-full overflow-x-hidden">
          <div className="p-5">
            {insight.search_notes && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-4 h-4 text-blue-600" />
                  <h5 className="text-sm font-semibold text-gray-900">Suchhinweise</h5>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed break-words">
                  {insight.search_notes}
                </p>
              </div>
            )}

            {insight.sources_checked && insight.sources_checked.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-2">
                  Geprüfte Quellen ({insight.sources_checked.length})
                </h5>
                <div className="flex flex-wrap gap-2">
                  {insight.sources_checked.slice(0, 5).map((source: string, idx: number) => {
                    // Check if source is a valid URL
                    let displayText = source
                    let isValidUrl = false

                    try {
                      const url = new URL(source)
                      displayText = url.hostname.replace('www.', '')
                      isValidUrl = true
                    } catch {
                      // Not a valid URL, just display as text
                      displayText = source
                    }

                    return isValidUrl ? (
                      <a
                        key={idx}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 bg-white border border-blue-200 rounded hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">{displayText}</span>
                      </a>
                    ) : (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-white border border-gray-200 rounded flex items-center gap-1"
                      >
                        <span className="truncate max-w-[150px]">{displayText}</span>
                      </span>
                    )
                  })}
                  {insight.sources_checked.length > 5 && (
                    <span className="text-xs text-muted-foreground px-2 py-1">
                      +{insight.sources_checked.length - 5} mehr
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
