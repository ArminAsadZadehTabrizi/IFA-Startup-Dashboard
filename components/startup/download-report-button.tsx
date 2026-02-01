'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Startup } from '@/lib/types'
import type { AIInsight } from './ai-insights-section'

interface DownloadReportButtonProps {
  startup: Startup
  insight: AIInsight | null
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  iconOnly?: boolean
}

export function DownloadReportButton({
  startup,
  insight,
  variant = 'outline',
  size = 'sm',
  className,
  iconOnly = false,
}: DownloadReportButtonProps) {
  const [PDFDownloadLink, setPDFDownloadLink] = useState<any>(null)
  const [StartupPDFDocument, setStartupPDFDocument] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shouldTriggerDownload, setShouldTriggerDownload] = useState(false)

  // Load PDF components only when button is clicked
  const handleClick = async () => {
    if (PDFDownloadLink && StartupPDFDocument) {
      // Already loaded, trigger download again
      setShouldTriggerDownload(true)
      // Reset after a short delay to allow re-triggering
      setTimeout(() => setShouldTriggerDownload(false), 100)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [pdfRenderer, pdfDocument] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./startup-pdf-document'),
      ])

      setPDFDownloadLink(() => pdfRenderer.PDFDownloadLink)
      setStartupPDFDocument(() => pdfDocument.StartupPDFDocument)
      // Trigger download after components are loaded
      setShouldTriggerDownload(true)
    } catch (err) {
      console.error('Failed to load PDF components:', err)
      setError('Fehler beim Laden der PDF-Komponenten')
    } finally {
      setIsLoading(false)
    }
  }

  // Generate a safe filename
  const fileName = `${startup.name.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '_')}_Evaluation_Report.pdf`

  // If PDF components are loaded, render the download link
  if (PDFDownloadLink && StartupPDFDocument) {
    return (
      <PDFDownloadLink
        document={<StartupPDFDocument startup={startup} insight={insight} />}
        fileName={fileName}
        style={{ textDecoration: 'none' }}
      >
        {({ loading, error: pdfError, url, blob }: { loading: boolean; error: Error | null; url: string | null; blob: Blob | null }) => {
          // Auto-trigger download when components just loaded
          if (shouldTriggerDownload && url && !loading && !pdfError) {
            // Create a temporary link and click it
            setTimeout(() => {
              const link = document.createElement('a')
              link.href = url
              link.download = fileName
              link.click()
              setShouldTriggerDownload(false)
            }, 100)
          }

          return (
            <Button
              variant={variant}
              size={size}
              className={className}
              disabled={loading}
              onClick={handleClick}
              title={
                loading
                  ? 'PDF wird erstellt...'
                  : pdfError
                  ? 'Fehler beim Erstellen des PDFs'
                  : 'Bericht herunterladen'
              }
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {!iconOnly && <span className="ml-2">Erstelle PDF...</span>}
                </>
              ) : pdfError ? (
                <>
                  <Download className="h-4 w-4" />
                  {!iconOnly && <span className="ml-2">Fehler - Erneut versuchen</span>}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  {!iconOnly && <span className="ml-2">Bericht herunterladen</span>}
                </>
              )}
            </Button>
          )
        }}
      </PDFDownloadLink>
    )
  }

  // Initial state: show button that loads PDF components on click
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={isLoading}
      onClick={handleClick}
      title={
        isLoading
          ? 'Lade PDF-Komponenten...'
          : error
          ? error
          : 'Bericht herunterladen'
      }
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {!iconOnly && <span className="ml-2">Laden...</span>}
        </>
      ) : error ? (
        <>
          <Download className="h-4 w-4" />
          {!iconOnly && <span className="ml-2">Fehler</span>}
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          {!iconOnly && <span className="ml-2">Bericht herunterladen</span>}
        </>
      )}
    </Button>
  )
}

