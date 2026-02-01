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
// LOGIK: IFA HEALTH SCORE (Strenger Algorithmus)
// =============================================================================
const calculateHealthScore = (startup: Startup, insight: AIInsight | null): number => {
  let score = 50 // Basiswert

  // Status-Check: Wenn Status NICHT 'active' -> -40 Punkte sofort
  if (startup.status !== 'active') {
    score -= 40
  }

  // Team-Check: team_size > 1 -> +10 Punkte
  const teamSize = startup.headcount || insight?.business_metrics?.team_size || 0
  if (teamSize > 1) {
    score += 10
  }

  // News-Check: updates.length > 0 -> +10 Punkte
  const updates = insight?.updates || []
  if (updates.length > 0) {
    score += 10
  }

  // AI-Check: recommendation === 'continue_support' -> +15 Punkte
  if (insight?.ai_analysis?.recommendation === 'continue_support') {
    score += 15
  }

  // Risiko-Check: concerns.length > 2 -> -15 Punkte
  const concerns = insight?.ai_analysis?.concerns || []
  if (concerns.length > 2) {
    score -= 15
  }

  // Ergebnis zwischen 0 und 100 begrenzen
  return Math.max(0, Math.min(100, score))
}

// =============================================================================
// LOGIK: DAS URTEIL (Verdict)
// =============================================================================
type VerdictType = {
  text: string
  color: 'gray' | 'green' | 'yellow' | 'red'
}

const getVerdict = (score: number, status: string): VerdictType => {
  // Prio 1: Inaktive Status -> ARCHIVIEREN
  const inactiveStatuses = ['ruhend', 'inactive', 'dormant', 'closed', 'pivoted', 'acquired']
  if (inactiveStatuses.includes(status.toLowerCase())) {
    return { text: 'ARCHIVIEREN', color: 'gray' }
  }

  // Prio 2: Score >= 75 -> TOP KANDIDAT
  if (score >= 75) {
    return { text: 'TOP KANDIDAT', color: 'green' }
  }

  // Prio 3: Score >= 50 -> BEOBACHTEN
  if (score >= 50) {
    return { text: 'BEOBACHTEN', color: 'yellow' }
  }

  // Sonst: PRÜFEN
  return { text: 'PRÜFEN', color: 'red' }
}

// =============================================================================
// FARBPALETTE
// =============================================================================
const colors = {
  // Primärfarben
  darkBlue: '#0f172a',
  navy: '#1e3a5f',
  blue: '#2563eb',
  
  // Verdict-Farben
  verdictGreen: '#166534',
  verdictGreenBg: '#dcfce7',
  verdictGreenBorder: '#86efac',
  
  verdictYellow: '#92400e',
  verdictYellowBg: '#fef3c7',
  verdictYellowBorder: '#fcd34d',
  
  verdictRed: '#991b1b',
  verdictRedBg: '#fee2e2',
  verdictRedBorder: '#fca5a5',
  
  verdictGray: '#374151',
  verdictGrayBg: '#f3f4f6',
  verdictGrayBorder: '#d1d5db',
  
  // Analyse-Farben
  strengthGreen: '#14532d',
  strengthBg: '#f0fdf4',
  strengthBorder: '#22c55e',
  
  riskRed: '#7f1d1d',
  riskBg: '#fef2f2',
  riskBorder: '#ef4444',
  
  // Neutraltöne
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
  
  // Sidebar
  sidebarBg: '#f1f5f9',
}

// =============================================================================
// STYLES
// =============================================================================
const styles = StyleSheet.create({
  // Seiten-Layout
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
  // LINKE SIDEBAR (30%)
  // ===================
  sidebar: {
    width: '30%',
    backgroundColor: colors.sidebarBg,
    padding: 20,
    paddingBottom: 50,
  },
  
  // Score-Kreis
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
  
  // Fakten-Liste
  factsTitle: {
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
  
  // Status-Badge
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
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  statusTextActive: {
    color: '#166534',
  },
  statusTextInactive: {
    color: '#374151',
  },
  
  // ===================
  // RECHTER HAUPTBEREICH (70%)
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
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 3,
    borderBottomColor: colors.darkBlue,
  },
  logoContainer: {
    width: 48,
    height: 48,
    marginRight: 12,
    backgroundColor: colors.gray100,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  logo: {
    width: 40,
    height: 40,
    objectFit: 'contain',
  },
  logoFallback: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkBlue,
  },
  headerText: {
    flex: 1,
  },
  startupName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.darkBlue,
    marginBottom: 4,
  },
  startupTagline: {
    fontSize: 9,
    color: colors.gray600,
    lineHeight: 1.4,
  },
  
  // Abschnitt-Styles
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.darkBlue,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Zusammenfassung
  summaryBox: {
    backgroundColor: colors.gray50,
    padding: 10,
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: colors.blue,
  },
  summaryText: {
    fontSize: 9,
    color: colors.gray700,
    lineHeight: 1.6,
  },
  
  // Fazit-Box (Verdict)
  verdictBox: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
  },
  verdictBoxGreen: {
    backgroundColor: colors.verdictGreenBg,
    borderColor: colors.verdictGreenBorder,
  },
  verdictBoxYellow: {
    backgroundColor: colors.verdictYellowBg,
    borderColor: colors.verdictYellowBorder,
  },
  verdictBoxRed: {
    backgroundColor: colors.verdictRedBg,
    borderColor: colors.verdictRedBorder,
  },
  verdictBoxGray: {
    backgroundColor: colors.verdictGrayBg,
    borderColor: colors.verdictGrayBorder,
  },
  verdictLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verdictLabelGreen: { color: colors.verdictGreen },
  verdictLabelYellow: { color: colors.verdictYellow },
  verdictLabelRed: { color: colors.verdictRed },
  verdictLabelGray: { color: colors.verdictGray },
  verdictText: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  verdictTextGreen: { color: colors.verdictGreen },
  verdictTextYellow: { color: colors.verdictYellow },
  verdictTextRed: { color: colors.verdictRed },
  verdictTextGray: { color: colors.verdictGray },
  
  // Investment Case
  investmentCaseBox: {
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: colors.navy,
  },
  investmentCaseText: {
    fontSize: 9,
    color: colors.gray700,
    lineHeight: 1.5,
  },
  
  // Analyse-Spalten
  analysisColumns: {
    flexDirection: 'row',
    gap: 10,
  },
  analysisColumn: {
    flex: 1,
  },
  strengthsBox: {
    backgroundColor: colors.strengthBg,
    padding: 10,
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: colors.strengthBorder,
    minHeight: 70,
  },
  risksBox: {
    backgroundColor: colors.riskBg,
    padding: 10,
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: colors.riskBorder,
    minHeight: 70,
  },
  analysisTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  strengthsTitle: { color: colors.strengthGreen },
  risksTitle: { color: colors.riskRed },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletPoint: {
    width: 10,
    fontSize: 8,
  },
  bulletPointGreen: { color: colors.strengthBorder },
  bulletPointRed: { color: colors.riskBorder },
  bulletText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 1.4,
  },
  bulletTextGreen: { color: colors.strengthGreen },
  bulletTextRed: { color: colors.riskRed },
  
  // Aktuelles (Updates)
  updateItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  updateDate: {
    width: 50,
    fontSize: 8,
    color: colors.gray500,
    fontWeight: 'bold',
  },
  updateContent: {
    flex: 1,
  },
  updateTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.gray800,
  },
  
  // Keine Daten
  noData: {
    fontSize: 8,
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
  },
  footerText: {
    fontSize: 7,
    color: colors.gray400,
    textAlign: 'center',
  },
})

// =============================================================================
// HILFSFUNKTIONEN
// =============================================================================

// Datum formatieren (kurz)
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

// Status auf Deutsch übersetzen
const getStatusTextDE = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'Aktiv'
    case 'dormant':
    case 'inactive':
      return 'Ruhend'
    case 'acquired':
      return 'Übernommen'
    case 'pivoted':
      return 'Pivot'
    case 'closed':
      return 'Geschlossen'
    default:
      return status
  }
}

// Investment Case Text generieren
const generateInvestmentCase = (score: number, startup: Startup, insight: AIInsight | null): string => {
  const statusDE = getStatusTextDE(startup.status)
  const teamSize = startup.headcount || insight?.business_metrics?.team_size || 0
  const updatesCount = insight?.updates?.length || 0
  
  let conclusion = ''
  
  if (score >= 75) {
    conclusion = 'zeigt das Startup starke Entwicklungsindikatoren und ist ein vielversprechender Kandidat für weiteres Engagement.'
  } else if (score >= 50) {
    conclusion = 'empfehlen wir eine regelmäßige Beobachtung der weiteren Entwicklung.'
  } else if (startup.status !== 'active') {
    conclusion = `befindet sich das Startup im Status "${statusDE}" und sollte für eine mögliche Archivierung geprüft werden.`
  } else {
    conclusion = 'sind weitere Informationen erforderlich, um eine fundierte Einschätzung abzugeben.'
  }
  
  let details = ''
  if (teamSize > 0) {
    details += ` Das Team umfasst ${teamSize} Mitarbeiter.`
  }
  if (updatesCount > 0) {
    details += ` Es wurden ${updatesCount} aktuelle Entwicklungen erfasst.`
  }
  
  return `Dieses Startup erzielt einen Health Score von ${score}/100. Basierend auf den verfügbaren Daten ${conclusion}${details}`
}

// =============================================================================
// KOMPONENTEN-PROPS
// =============================================================================
interface StartupPDFDocumentProps {
  startup: Startup
  insight: AIInsight | null
}

// =============================================================================
// HAUPTKOMPONENTE
// =============================================================================
export function StartupPDFDocument({ startup, insight }: StartupPDFDocumentProps) {
  // Aktuelles Datum
  const currentDate = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  // Health Score berechnen
  const healthScore = calculateHealthScore(startup, insight)
  
  // Verdict ermitteln
  const verdict = getVerdict(healthScore, startup.status)

  // Daten extrahieren
  const getSummary = (): string =>
    insight?.german_summary || insight?.ai_analysis?.summary || ''

  const getStrengths = (): string[] =>
    insight?.ai_analysis?.strengths?.slice(0, 4) || []

  const getRisks = (): string[] =>
    insight?.ai_analysis?.concerns?.slice(0, 4) || []

  const getUpdates = () =>
    (insight?.updates || []).slice(0, 3)

  const getTeamSize = (): string => {
    const size = startup.headcount || insight?.business_metrics?.team_size
    return size ? `${size} Mitarbeiter` : 'Keine Angabe'
  }

  // Investment Case generieren
  const investmentCase = generateInvestmentCase(healthScore, startup, insight)

  // Verdict-Styles basierend auf Farbe
  const getVerdictBoxStyle = () => {
    switch (verdict.color) {
      case 'green': return styles.verdictBoxGreen
      case 'yellow': return styles.verdictBoxYellow
      case 'red': return styles.verdictBoxRed
      default: return styles.verdictBoxGray
    }
  }
  
  const getVerdictLabelStyle = () => {
    switch (verdict.color) {
      case 'green': return styles.verdictLabelGreen
      case 'yellow': return styles.verdictLabelYellow
      case 'red': return styles.verdictLabelRed
      default: return styles.verdictLabelGray
    }
  }
  
  const getVerdictTextStyle = () => {
    switch (verdict.color) {
      case 'green': return styles.verdictTextGreen
      case 'yellow': return styles.verdictTextYellow
      case 'red': return styles.verdictTextRed
      default: return styles.verdictTextGray
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* ============================================= */}
          {/* LINKE SIDEBAR */}
          {/* ============================================= */}
          <View style={styles.sidebar}>
            {/* IFA Health Score */}
            <View style={styles.scoreContainer}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreValue}>{healthScore}</Text>
              </View>
              <Text style={styles.scoreLabel}>Health Score</Text>
            </View>

            {/* Fakten */}
            <Text style={styles.factsTitle}>Fakten</Text>

            {/* Batch / Jahr */}
            <View style={styles.factItem}>
              <Text style={styles.factLabel}>Batch / Jahr</Text>
              <Text style={styles.factValue}>
                {startup.batch || 'Keine Angabe'}
              </Text>
            </View>

            {/* Sektor */}
            <View style={styles.factItem}>
              <Text style={styles.factLabel}>Sektor</Text>
              <Text style={styles.factValue}>
                {startup.sector || 'Keine Angabe'}
              </Text>
            </View>

            {/* Teamgröße */}
            <View style={styles.factItem}>
              <Text style={styles.factLabel}>Teamgröße</Text>
              <Text style={styles.factValue}>{getTeamSize()}</Text>
            </View>

            {/* Webseite */}
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

            {/* Standort */}
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
                  {getStatusTextDE(startup.status)}
                </Text>
              </View>
            </View>

            {/* Organisation */}
            {startup.organization && (
              <View style={styles.factItem}>
                <Text style={styles.factLabel}>Organisation</Text>
                <Text style={styles.factValue}>{startup.organization}</Text>
              </View>
            )}
          </View>

          {/* ============================================= */}
          {/* RECHTER HAUPTBEREICH */}
          {/* ============================================= */}
          <View style={styles.mainContent}>
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

            {/* Zusammenfassung */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Zusammenfassung</Text>
              {getSummary() ? (
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryText}>{getSummary()}</Text>
                </View>
              ) : (
                <View style={styles.summaryBox}>
                  <Text style={styles.noData}>Keine Zusammenfassung verfügbar.</Text>
                </View>
              )}
            </View>

            {/* Das Fazit */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Das Fazit</Text>
              <View style={[styles.verdictBox, getVerdictBoxStyle()]}>
                <Text style={[styles.verdictLabel, getVerdictLabelStyle()]}>
                  Empfehlung
                </Text>
                <Text style={[styles.verdictText, getVerdictTextStyle()]}>
                  {verdict.text}
                </Text>
              </View>
            </View>

            {/* Investment Case */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Investment Case</Text>
              <View style={styles.investmentCaseBox}>
                <Text style={styles.investmentCaseText}>{investmentCase}</Text>
              </View>
            </View>

            {/* Analyse: Stärken & Risiken */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Analyse</Text>
              <View style={styles.analysisColumns}>
                {/* Stärken */}
                <View style={styles.analysisColumn}>
                  <View style={styles.strengthsBox}>
                    <Text style={[styles.analysisTitle, styles.strengthsTitle]}>
                      ✓ Stärken
                    </Text>
                    {getStrengths().length > 0 ? (
                      getStrengths().map((strength, idx) => (
                        <View key={idx} style={styles.bulletItem}>
                          <Text style={[styles.bulletPoint, styles.bulletPointGreen]}>•</Text>
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

                {/* Risiken */}
                <View style={styles.analysisColumn}>
                  <View style={styles.risksBox}>
                    <Text style={[styles.analysisTitle, styles.risksTitle]}>
                      ! Risiken
                    </Text>
                    {getRisks().length > 0 ? (
                      getRisks().map((risk, idx) => (
                        <View key={idx} style={styles.bulletItem}>
                          <Text style={[styles.bulletPoint, styles.bulletPointRed]}>•</Text>
                          <Text style={[styles.bulletText, styles.bulletTextRed]}>
                            {risk}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noData}>Keine Risiken gefunden</Text>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Aktuelle Entwicklungen */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Aktuelle Entwicklungen</Text>
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
                        {update.title || update.category || 'Aktualisierung'}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noData}>Keine aktuellen Entwicklungen verfügbar.</Text>
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
