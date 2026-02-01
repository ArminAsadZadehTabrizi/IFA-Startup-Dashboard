'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
} from '@react-pdf/renderer'
import type { Startup } from '@/lib/types'
import type { AIInsight } from './ai-insights-section'

// =============================================================================
// HELPER FUNCTION: Calculate IFA Health Score
// =============================================================================
const calculateHealthScore = (startup: Startup, insight: AIInsight | null): number => {
  let score = 50 // Base score

  // +20 points if status is 'active'
  if (startup.status === 'active') {
    score += 20
  }

  // +10 points if team_size > 1
  const teamSize = startup.headcount || insight?.business_metrics?.team_size || 0
  if (teamSize > 1) {
    score += 10
  }

  // +10 points if recent_updates exist (length > 0)
  const updates = insight?.updates || []
  if (updates.length > 0) {
    score += 10
  }

  // +10 points if recommendation is 'continue_support'
  if (insight?.ai_analysis?.recommendation === 'continue_support') {
    score += 10
  }

  // -10 points if concerns > 3 entries
  const concerns = insight?.ai_analysis?.concerns || []
  if (concerns.length > 3) {
    score -= 10
  }

  // Clamp result between 0 and 100
  return Math.max(0, Math.min(100, score))
}

// =============================================================================
// COLOR PALETTE
// =============================================================================
const colors = {
  // Primary colors
  darkBlue: '#0f172a',
  navy: '#1e3a5f',
  blue: '#2563eb',
  lightBlue: '#3b82f6',
  
  // Accent colors
  green: '#10b981',
  greenDark: '#059669',
  yellow: '#f59e0b',
  yellowDark: '#d97706',
  red: '#ef4444',
  redDark: '#dc2626',
  
  // Neutrals
  white: '#ffffff',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',
  
  // Sidebar background
  sidebarBg: '#f1f5f9',
}

// =============================================================================
// STYLES
// =============================================================================
const styles = StyleSheet.create({
  // Page Layout
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    backgroundColor: colors.white,
    color: colors.gray800,
  },
  container: {
    flexDirection: 'row',
    height: '100%',
  },
  
  // ===================
  // LEFT SIDEBAR (30%)
  // ===================
  sidebar: {
    width: '30%',
    backgroundColor: colors.sidebarBg,
    padding: 20,
    paddingBottom: 50,
  },
  
  // Score Circle
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 10,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.darkBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.gray600,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  // Key Facts Section
  keyFactsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.darkBlue,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: colors.gray300,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  factItem: {
    marginBottom: 12,
  },
  factLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.gray500,
    textTransform: 'uppercase',
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  factValue: {
    fontSize: 10,
    color: colors.gray800,
    lineHeight: 1.4,
  },
  factLink: {
    fontSize: 9,
    color: colors.blue,
    textDecoration: 'none',
  },
  
  // Status Badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusInactive: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  statusTextActive: {
    color: '#166534',
  },
  statusTextInactive: {
    color: '#92400e',
  },
  
  // ===================
  // RIGHT MAIN AREA (70%)
  // ===================
  mainContent: {
    width: '70%',
    padding: 24,
    paddingBottom: 50,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: colors.darkBlue,
  },
  logoContainer: {
    width: 50,
    height: 50,
    marginRight: 14,
    backgroundColor: colors.gray100,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  logo: {
    width: 42,
    height: 42,
    objectFit: 'contain',
  },
  logoFallback: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkBlue,
  },
  headerText: {
    flex: 1,
  },
  startupName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.darkBlue,
    marginBottom: 4,
  },
  startupTagline: {
    fontSize: 10,
    color: colors.gray600,
    lineHeight: 1.4,
  },
  
  // Section Styles
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.darkBlue,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    fontSize: 9,
    color: colors.gray700,
    lineHeight: 1.6,
  },
  
  // Executive Summary Box
  summaryBox: {
    backgroundColor: colors.gray50,
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.blue,
  },
  summaryText: {
    fontSize: 9,
    color: colors.gray700,
    lineHeight: 1.7,
  },
  
  // Verdict Box
  verdictBox: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 4,
    alignItems: 'center',
  },
  verdictGreen: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  verdictYellow: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  verdictRed: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  verdictGray: {
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  verdictLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verdictLabelGreen: {
    color: '#166534',
  },
  verdictLabelYellow: {
    color: '#92400e',
  },
  verdictLabelRed: {
    color: '#991b1b',
  },
  verdictLabelGray: {
    color: colors.gray600,
  },
  verdictText: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  verdictTextGreen: {
    color: '#166534',
  },
  verdictTextYellow: {
    color: '#92400e',
  },
  verdictTextRed: {
    color: '#991b1b',
  },
  verdictTextGray: {
    color: colors.gray600,
  },
  confidenceText: {
    fontSize: 8,
    color: colors.gray500,
    marginTop: 4,
  },
  
  // Analysis Two Columns
  analysisColumns: {
    flexDirection: 'row',
    gap: 12,
  },
  analysisColumn: {
    flex: 1,
  },
  strengthsBox: {
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.green,
    height: '100%',
  },
  concernsBox: {
    backgroundColor: '#fffbeb',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.yellow,
    height: '100%',
  },
  analysisTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  strengthsTitle: {
    color: '#166534',
  },
  concernsTitle: {
    color: '#92400e',
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bulletPoint: {
    width: 12,
    fontSize: 8,
  },
  bulletPointGreen: {
    color: colors.green,
  },
  bulletPointYellow: {
    color: colors.yellow,
  },
  bulletText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 1.5,
  },
  bulletTextGreen: {
    color: '#14532d',
  },
  bulletTextYellow: {
    color: '#78350f',
  },
  
  // Traction / Updates
  updateItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  updateDate: {
    width: 55,
    fontSize: 8,
    color: colors.gray500,
    fontWeight: 'bold',
  },
  updateContent: {
    flex: 1,
  },
  updateTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.gray800,
    marginBottom: 2,
  },
  updateDescription: {
    fontSize: 8,
    color: colors.gray600,
    lineHeight: 1.4,
  },
  
  // No Data
  noData: {
    fontSize: 9,
    color: colors.gray400,
    fontStyle: 'italic',
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 7,
    color: colors.gray400,
    textAlign: 'center',
  },
})

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
const formatDate = (dateStr: string): string => {
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

const formatShortDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
    })
  } catch {
    return dateStr
  }
}

const getStatusText = (status: string): string => {
  switch (status) {
    case 'active':
      return 'AKTIV'
    case 'dormant':
      return 'RUHEND'
    case 'acquired':
      return 'ÜBERNOMMEN'
    case 'pivoted':
      return 'PIVOT'
    default:
      return status.toUpperCase()
  }
}

const getRecommendationDisplay = (rec: string): { text: string; type: 'green' | 'yellow' | 'red' | 'gray' } => {
  switch (rec) {
    case 'continue_support':
      return { text: 'INVESTIEREN', type: 'green' }
    case 'monitor':
      return { text: 'BEOBACHTEN', type: 'yellow' }
    case 'alumni_inactive':
      return { text: 'INAKTIV', type: 'red' }
    case 'insufficient_data':
      return { text: 'DATEN FEHLEN', type: 'gray' }
    default:
      return { text: rec.toUpperCase(), type: 'gray' }
  }
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================
interface StartupPDFDocumentProps {
  startup: Startup
  insight: AIInsight | null
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export function StartupPDFDocument({ startup, insight }: StartupPDFDocumentProps) {
  const currentDate = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  // Calculate Health Score
  const healthScore = calculateHealthScore(startup, insight)

  // Helper functions to extract data
  const getAISummary = (): string =>
    insight?.german_summary || insight?.ai_analysis?.summary || ''

  const getStrengths = (): string[] => {
    if (insight?.ai_analysis?.strengths && insight.ai_analysis.strengths.length > 0) {
      return insight.ai_analysis.strengths.slice(0, 4)
    }
    return []
  }

  const getConcerns = (): string[] => {
    if (insight?.ai_analysis?.concerns && insight.ai_analysis.concerns.length > 0) {
      return insight.ai_analysis.concerns.slice(0, 4)
    }
    return []
  }

  const getRecommendation = (): string =>
    insight?.ai_analysis?.recommendation || 'insufficient_data'

  const getConfidenceScore = (): number =>
    insight?.ai_analysis?.confidence_score || 0

  const getUpdates = () =>
    (insight?.updates || []).slice(0, 3)

  const getTeamSize = (): string => {
    const size = startup.headcount || insight?.business_metrics?.team_size
    return size ? `${size} Mitarbeiter` : 'Keine Angabe'
  }

  const recommendation = getRecommendationDisplay(getRecommendation())
  const confidence = getConfidenceScore()

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* ============================================= */}
          {/* LEFT SIDEBAR */}
          {/* ============================================= */}
          <View style={styles.sidebar}>
            {/* IFA Health Score */}
            <View style={styles.scoreContainer}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreValue}>{healthScore}</Text>
              </View>
              <Text style={styles.scoreLabel}>Health Score</Text>
            </View>

            {/* Key Facts */}
            <Text style={styles.keyFactsTitle}>Key Facts</Text>

            {/* Batch / Year */}
            <View style={styles.factItem}>
              <Text style={styles.factLabel}>Batch / Jahr</Text>
              <Text style={styles.factValue}>
                {startup.batch || 'Keine Angabe'}
              </Text>
            </View>

            {/* Sector */}
            <View style={styles.factItem}>
              <Text style={styles.factLabel}>Sektor</Text>
              <Text style={styles.factValue}>
                {startup.sector || 'Keine Angabe'}
              </Text>
            </View>

            {/* Team Size */}
            <View style={styles.factItem}>
              <Text style={styles.factLabel}>Teamgröße</Text>
              <Text style={styles.factValue}>{getTeamSize()}</Text>
            </View>

            {/* Website */}
            <View style={styles.factItem}>
              <Text style={styles.factLabel}>Webseite</Text>
              {startup.website ? (
                <Link src={startup.website} style={styles.factLink}>
                  {startup.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                </Link>
              ) : (
                <Text style={styles.factValue}>Keine Angabe</Text>
              )}
            </View>

            {/* Location */}
            <View style={styles.factItem}>
              <Text style={styles.factLabel}>Standort</Text>
              <Text style={styles.factValue}>
                {startup.city || startup.country || 'Keine Angabe'}
              </Text>
            </View>

            {/* Status */}
            <View style={styles.factItem}>
              <Text style={styles.factLabel}>Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  startup.status === 'active'
                    ? styles.statusActive
                    : styles.statusInactive,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    startup.status === 'active'
                      ? styles.statusTextActive
                      : styles.statusTextInactive,
                  ]}
                >
                  {getStatusText(startup.status)}
                </Text>
              </View>
            </View>

            {/* Organization */}
            {startup.organization && (
              <View style={styles.factItem}>
                <Text style={styles.factLabel}>Organisation</Text>
                <Text style={styles.factValue}>{startup.organization}</Text>
              </View>
            )}
          </View>

          {/* ============================================= */}
          {/* RIGHT MAIN CONTENT */}
          {/* ============================================= */}
          <View style={styles.mainContent}>
            {/* Header with Name & Logo */}
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
              <View style={styles.headerText}>
                <Text style={styles.startupName}>{startup.name}</Text>
                <Text style={styles.startupTagline}>
                  {startup.official?.oneLiner ||
                    startup.latest?.oneLiner ||
                    startup.description?.substring(0, 100) ||
                    `${startup.sector} Startup`}
                </Text>
              </View>
            </View>

            {/* Executive Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Executive Summary</Text>
              {getAISummary() ? (
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryText}>{getAISummary()}</Text>
                </View>
              ) : (
                <Text style={styles.noData}>
                  Keine KI-Zusammenfassung verfügbar.
                </Text>
              )}
            </View>

            {/* The Verdict */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>The Verdict</Text>
              <View
                style={[
                  styles.verdictBox,
                  recommendation.type === 'green'
                    ? styles.verdictGreen
                    : recommendation.type === 'yellow'
                    ? styles.verdictYellow
                    : recommendation.type === 'red'
                    ? styles.verdictRed
                    : styles.verdictGray,
                ]}
              >
                <Text
                  style={[
                    styles.verdictLabel,
                    recommendation.type === 'green'
                      ? styles.verdictLabelGreen
                      : recommendation.type === 'yellow'
                      ? styles.verdictLabelYellow
                      : recommendation.type === 'red'
                      ? styles.verdictLabelRed
                      : styles.verdictLabelGray,
                  ]}
                >
                  Empfehlung
                </Text>
                <Text
                  style={[
                    styles.verdictText,
                    recommendation.type === 'green'
                      ? styles.verdictTextGreen
                      : recommendation.type === 'yellow'
                      ? styles.verdictTextYellow
                      : recommendation.type === 'red'
                      ? styles.verdictTextRed
                      : styles.verdictTextGray,
                  ]}
                >
                  {recommendation.text}
                </Text>
                {confidence > 0 && (
                  <Text style={styles.confidenceText}>
                    Vertrauenswert:{' '}
                    {confidence > 100 ? Math.round(confidence / 100) : Math.round(confidence)}%
                  </Text>
                )}
              </View>
            </View>

            {/* Analysis: Strengths & Concerns */}
            {(getStrengths().length > 0 || getConcerns().length > 0) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Analysis</Text>
                <View style={styles.analysisColumns}>
                  {/* Strengths Column */}
                  <View style={styles.analysisColumn}>
                    <View style={styles.strengthsBox}>
                      <Text style={[styles.analysisTitle, styles.strengthsTitle]}>
                        ✓ Stärken
                      </Text>
                      {getStrengths().length > 0 ? (
                        getStrengths().map((strength, idx) => (
                          <View key={idx} style={styles.bulletItem}>
                            <Text style={[styles.bulletPoint, styles.bulletPointGreen]}>
                              •
                            </Text>
                            <Text style={[styles.bulletText, styles.bulletTextGreen]}>
                              {strength}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noData}>Keine Stärken erfasst</Text>
                      )}
                    </View>
                  </View>

                  {/* Concerns Column */}
                  <View style={styles.analysisColumn}>
                    <View style={styles.concernsBox}>
                      <Text style={[styles.analysisTitle, styles.concernsTitle]}>
                        ! Bedenken
                      </Text>
                      {getConcerns().length > 0 ? (
                        getConcerns().map((concern, idx) => (
                          <View key={idx} style={styles.bulletItem}>
                            <Text style={[styles.bulletPoint, styles.bulletPointYellow]}>
                              •
                            </Text>
                            <Text style={[styles.bulletText, styles.bulletTextYellow]}>
                              {concern}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noData}>Keine Bedenken erfasst</Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Recent Traction */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Traction</Text>
              {getUpdates().length > 0 ? (
                getUpdates().map((update, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.updateItem,
                      idx === getUpdates().length - 1 && { borderBottomWidth: 0 },
                    ]}
                  >
                    <Text style={styles.updateDate}>
                      {formatShortDate(update.date)}
                    </Text>
                    <View style={styles.updateContent}>
                      <Text style={styles.updateTitle}>
                        {update.title || update.category || 'Update'}
                      </Text>
                      {update.description && (
                        <Text style={styles.updateDescription}>
                          {update.description.length > 120
                            ? update.description.substring(0, 120) + '...'
                            : update.description}
                        </Text>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noData}>Keine aktuellen Updates verfügbar.</Text>
              )}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generiert vom IFA Startup Dashboard • {currentDate}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
