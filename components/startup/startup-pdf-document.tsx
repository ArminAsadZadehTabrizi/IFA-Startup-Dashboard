'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'
import type { Startup } from '@/lib/types'
import type { AIInsight } from './ai-insights-section'

// Color palette
const colors = {
  primary: '#1e3a5f',       // Dark blue
  secondary: '#2563eb',     // Blue
  accent: '#059669',        // Green
  warning: '#d97706',       // Orange
  text: '#1f2937',          // Gray 800
  textLight: '#6b7280',     // Gray 500
  background: '#f8fafc',    // Slate 50
  border: '#e2e8f0',        // Slate 200
  white: '#ffffff',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    backgroundColor: colors.white,
    color: colors.text,
  },
  // Header
  header: {
    flexDirection: 'row',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  logoContainer: {
    width: 60,
    height: 60,
    marginRight: 15,
    backgroundColor: colors.background,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: 'contain',
  },
  logoFallback: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    color: colors.text,
  },
  badgeActive: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  badgeDormant: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  // Sections
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionIcon: {
    width: 20,
    height: 20,
    backgroundColor: colors.secondary,
    borderRadius: 4,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  sectionContent: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  // Text styles
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    color: colors.text,
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 10,
    color: colors.text,
    marginBottom: 8,
  },
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    width: '48%',
    marginBottom: 8,
  },
  // AI Evaluation
  strengthsBox: {
    backgroundColor: '#dcfce7',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  concernsBox: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    width: 15,
    fontSize: 10,
  },
  listText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.5,
  },
  recommendationBox: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  recommendationText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confidenceText: {
    color: '#cbd5e1',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 4,
  },
  // Updates
  updateItem: {
    backgroundColor: colors.white,
    padding: 10,
    marginBottom: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  updateTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  updateDate: {
    fontSize: 8,
    color: colors.textLight,
  },
  updateDescription: {
    fontSize: 9,
    color: colors.textLight,
    lineHeight: 1.4,
  },
  updateCategory: {
    fontSize: 8,
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 8,
    color: colors.textLight,
  },
  footerLogo: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.primary,
  },
  // Empty state
  emptyText: {
    fontSize: 9,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  // Summary box
  summaryBox: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: colors.text,
  },
})

interface StartupPDFDocumentProps {
  startup: Startup
  insight: AIInsight | null
}

// Helper functions
const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

const getRecommendationText = (rec: string) => {
  switch (rec) {
    case 'continue_support':
      return 'Empfehlung: Weiter unterstützen'
    case 'monitor':
      return 'Empfehlung: Beobachten'
    case 'alumni_inactive':
      return 'Status: Alumni - Inaktiv'
    case 'insufficient_data':
      return 'Status: Unzureichende Daten'
    default:
      return `Empfehlung: ${rec}`
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Aktiv'
    case 'dormant':
      return 'Ruhend'
    case 'acquired':
      return 'Übernommen'
    case 'pivoted':
      return 'Pivot'
    default:
      return status
  }
}

const getCategoryText = (category: string) => {
  switch (category) {
    case 'funding':
      return 'Finanzierung'
    case 'product':
      return 'Produkt'
    case 'team':
      return 'Team'
    case 'partnership':
      return 'Partnerschaft'
    case 'news':
      return 'News'
    case 'impact':
      return 'Impact'
    default:
      return category
  }
}

export function StartupPDFDocument({ startup, insight }: StartupPDFDocumentProps) {
  const currentDate = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  // Helper functions to get data from insight
  const getAISummary = () =>
    insight?.german_summary || insight?.ai_analysis?.summary || ''
  const getStrengths = () => {
    // If we have strengths array, use it
    if (insight?.ai_analysis?.strengths && insight.ai_analysis.strengths.length > 0) {
      return insight.ai_analysis.strengths
    }
    // Otherwise, extract positive points from summary
    const summary = getAISummary()
    if (!summary) return []
    
    // Look for positive indicators in the summary
    const positiveKeywords = ['aktiv', 'erfolgreich', 'wachstum', 'expansion', 'partnerschaft', 'award', 'auszeichnung', 'finanzierung', 'förderung']
    const sentences = summary.split(/[.!?]+/).filter(s => s.trim())
    const strengths = sentences.filter(s => 
      positiveKeywords.some(kw => s.toLowerCase().includes(kw))
    ).slice(0, 3)
    
    return strengths.length > 0 ? strengths : []
  }
  const getConcerns = () => {
    // If we have concerns array, use it
    if (insight?.ai_analysis?.concerns && insight.ai_analysis.concerns.length > 0) {
      return insight.ai_analysis.concerns
    }
    // Otherwise, extract concerning points from summary
    const summary = getAISummary()
    if (!summary) return []
    
    // Look for negative indicators in the summary
    const negativeKeywords = ['inaktiv', 'unbekannt', 'keine', 'begrenzt', 'limited', 'ruhend', 'dormant', 'schwach']
    const sentences = summary.split(/[.!?]+/).filter(s => s.trim())
    const concerns = sentences.filter(s => 
      negativeKeywords.some(kw => s.toLowerCase().includes(kw))
    ).slice(0, 3)
    
    return concerns.length > 0 ? concerns : []
  }
  const getRecommendation = () =>
    insight?.ai_analysis?.recommendation || 'insufficient_data'
  const getConfidenceScore = () => insight?.ai_analysis?.confidence_score || 0
  const getUpdates = () => insight?.updates || []

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {startup.logoUrl ? (
              <Image style={styles.logo} src={startup.logoUrl} />
            ) : (
              <Text style={styles.logoFallback}>
                {startup.name.substring(0, 2).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{startup.name}</Text>
            <Text style={styles.subtitle}>
              {startup.sector} • {startup.city || startup.country || 'Standort unbekannt'}
            </Text>
            {startup.website && (
              <Text style={styles.subtitle}>{startup.website}</Text>
            )}
            <View style={styles.badgeRow}>
              <Text
                style={[
                  styles.badge,
                  startup.status === 'active'
                    ? styles.badgeActive
                    : startup.status === 'dormant'
                    ? styles.badgeDormant
                    : {},
                ]}
              >
                {getStatusText(startup.status)}
              </Text>
              {startup.batch && <Text style={styles.badge}>{startup.batch}</Text>}
              {startup.organization && (
                <Text style={styles.badge}>{startup.organization}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Business Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Business Overview</Text>
          </View>
          <View style={styles.sectionContent}>
            {/* Description */}
            <Text style={styles.label}>Beschreibung</Text>
            <Text style={styles.value}>
              {startup.description ||
                startup.official?.description ||
                startup.latest?.description ||
                startup.official?.oneLiner ||
                startup.latest?.oneLiner ||
                'Keine Beschreibung verfügbar'}
            </Text>

            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Status</Text>
                <Text style={styles.value}>{getStatusText(startup.status)}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Team-Größe</Text>
                <Text style={styles.value}>
                  {startup.headcount
                    ? `${startup.headcount} Mitarbeiter`
                    : insight?.business_metrics?.team_size
                    ? `${insight.business_metrics.team_size} Mitarbeiter`
                    : 'Keine Angabe'}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Programmphase</Text>
                <Text style={styles.value}>
                  {startup.programPhase || 'Keine Angabe'}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Letzte Finanzierung</Text>
                <Text style={styles.value}>
                  {startup.lastFundingRound?.stage || 'Keine Angabe'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* AI Evaluation */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#8b5cf6' }]} />
            <Text style={styles.sectionTitle}>KI-Evaluation</Text>
          </View>

          {insight ? (
            <View>
              {/* Summary */}
              {getAISummary() && (
                <View style={styles.summaryBox}>
                  <Text style={[styles.label, { color: '#1e40af', marginBottom: 6 }]}>
                    Zusammenfassung
                  </Text>
                  <Text style={styles.summaryText}>{getAISummary()}</Text>
                </View>
              )}

              {/* Status & Verification */}
              {(insight.status || insight.company_verified) && (
                <View style={styles.summaryBox}>
                  <View style={styles.grid}>
                    {insight.status && (
                      <View style={styles.gridItem}>
                        <Text style={styles.label}>Status</Text>
                        <Text style={styles.value}>
                          {insight.status === 'active' ? 'Aktiv' : insight.status}
                        </Text>
                      </View>
                    )}
                    {insight.company_verified !== undefined && (
                      <View style={styles.gridItem}>
                        <Text style={styles.label}>Verifiziert</Text>
                        <Text style={styles.value}>
                          {insight.company_verified ? 'Ja' : 'Nein'}
                        </Text>
                      </View>
                    )}
                  </View>
                  {insight.verification_note && (
                    <View style={{ marginTop: 8 }}>
                      <Text style={[styles.listText, { fontSize: 8, color: '#6b7280' }]}>
                        {insight.verification_note}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Strengths and Concerns side by side if available */}
              {(getStrengths().length > 0 || getConcerns().length > 0) && (
                <View style={styles.grid}>
                  {/* Strengths */}
                  {getStrengths().length > 0 && (
                    <View style={[styles.gridItem, { width: getConcerns().length > 0 ? '48%' : '100%' }]}>
                      <View style={styles.strengthsBox}>
                        <Text style={[styles.label, { color: '#166534', marginBottom: 6 }]}>
                          Stärken
                        </Text>
                        {getStrengths().map((strength, idx) => (
                          <View key={idx} style={styles.listItem}>
                            <Text style={[styles.bullet, { color: '#059669' }]}>✓</Text>
                            <Text style={[styles.listText, { color: '#166534' }]}>
                              {strength}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Concerns */}
                  {getConcerns().length > 0 && (
                    <View style={[styles.gridItem, { width: getStrengths().length > 0 ? '48%' : '100%' }]}>
                      <View style={styles.concernsBox}>
                        <Text style={[styles.label, { color: '#92400e', marginBottom: 6 }]}>
                          Bedenken
                        </Text>
                        {getConcerns().map((concern, idx) => (
                          <View key={idx} style={styles.listItem}>
                            <Text style={[styles.bullet, { color: '#d97706' }]}>!</Text>
                            <Text style={[styles.listText, { color: '#92400e' }]}>
                              {concern}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* Recommendation */}
              <View style={styles.recommendationBox}>
                <Text style={styles.recommendationText}>
                  {getRecommendationText(getRecommendation())}
                </Text>
                {getConfidenceScore() > 0 && (
                  <Text style={styles.confidenceText}>
                    Vertrauenswert:{' '}
                    {getConfidenceScore() > 100
                      ? Math.round(getConfidenceScore() / 100)
                      : Math.round(getConfidenceScore())}
                    %
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.sectionContent}>
              <Text style={styles.emptyText}>
                Keine KI-Evaluation verfügbar für dieses Startup.
              </Text>
            </View>
          )}
        </View>

        {/* Recent Updates */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#059669' }]} />
            <Text style={styles.sectionTitle}>Kürzliche Updates</Text>
          </View>

          {getUpdates().length > 0 ? (
            getUpdates()
              .slice(0, 5)
              .map((update, idx) => (
                <View key={idx} style={styles.updateItem}>
                  <View style={styles.updateHeader}>
                    <Text style={styles.updateTitle}>
                      {update.title || update.category || 'Update'}
                    </Text>
                    <Text style={styles.updateDate}>{formatDate(update.date)}</Text>
                  </View>
                  {update.description && (
                    <Text style={styles.updateDescription}>
                      {update.description}
                    </Text>
                  )}
                  <Text style={styles.updateCategory}>
                    {getCategoryText(update.category)}
                  </Text>
                </View>
              ))
          ) : (
            <View style={styles.sectionContent}>
              <Text style={styles.emptyText}>Keine kürzlichen Updates verfügbar.</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generiert vom IFA Startup Dashboard • {currentDate}
          </Text>
          <Text style={styles.footerLogo}>IMPACT FACTORY</Text>
        </View>
      </Page>
    </Document>
  )
}

