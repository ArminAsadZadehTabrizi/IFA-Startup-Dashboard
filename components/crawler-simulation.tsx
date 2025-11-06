"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Clock, Globe, Database, Search, AlertTriangle, ExternalLink } from "lucide-react"
import { useCrawler } from "@/hooks/use-crawler"
import { useStartups } from "@/hooks/use-dashboard-data"

interface CrawlerStep {
  id: string
  startup: string
  url: string
  status: "pending" | "crawling" | "analyzing" | "comparing" | "completed" | "error"
  progress: number
  findings: string[]
  changes: number
  responseTime: number
  error?: string
}

interface CrawlerSimulationProps {
  isOpen: boolean
  onClose: () => void
}

export function CrawlerSimulation({ isOpen, onClose }: CrawlerSimulationProps) {
  const [steps, setSteps] = useState<CrawlerStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [overallProgress, setOverallProgress] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [crawlResults, setCrawlResults] = useState<any[]>([])
  
  const { isLoading, results, summary, error, crawlStartups, resetCrawl } = useCrawler()
  const { data: startups } = useStartups()

  useEffect(() => {
    if (isOpen && !isRunning && !isLoading && startups && startups.length > 0) {
      startRealCrawl()
    }
  }, [isOpen, startups])

  const startRealCrawl = async () => {
    if (!startups || startups.length === 0) return
    
    setIsRunning(true)
    setCurrentStep(0)
    setOverallProgress(0)
    resetCrawl()

    // Prepare startup data for crawling
    const activeStartups = startups.filter(s => s.status === "active" && s.website)
    
    // Initialize steps
    const initialSteps: CrawlerStep[] = activeStartups.map((startup, index) => ({
      id: `step-${index}`,
      startup: startup.name,
      url: startup.website!,
      status: "pending",
      progress: 0,
      findings: [],
      changes: 0,
      responseTime: 0,
    }))

    setSteps(initialSteps)

    try {
      // Start the real crawl
      await crawlStartups(activeStartups.map(s => ({
        id: s.id,
        name: s.name,
        website: s.website!
      })))

      // Process results
      if (results.length > 0) {
        setCrawlResults(results)
        await processRealResults(results, initialSteps)
      }
    } catch (err) {
      console.error('Crawl failed:', err)
      // Update all steps to error state
      setSteps(prev => prev.map(step => ({
        ...step,
        status: "error",
        error: "Crawl failed"
      })))
    } finally {
      setIsRunning(false)
    }
  }

  const processRealResults = async (crawlResults: any[], initialSteps: CrawlerStep[]) => {
    for (let i = 0; i < crawlResults.length; i++) {
      const result = crawlResults[i]
      const stepIndex = initialSteps.findIndex(step => step.startup === result.startupName)
      
      if (stepIndex !== -1) {
        setCurrentStep(stepIndex)
        
        // Update step to crawling
        setSteps(prev => prev.map((step, index) => 
          index === stepIndex ? { ...step, status: "crawling", progress: 25 } : step
        ))
        
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Update step to analyzing
        setSteps(prev => prev.map((step, index) => 
          index === stepIndex ? { ...step, status: "analyzing", progress: 50 } : step
        ))
        
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Update step to comparing
        setSteps(prev => prev.map((step, index) => 
          index === stepIndex ? { ...step, status: "comparing", progress: 75 } : step
        ))
        
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Update step to completed
        const findings = []
        if (result.data.title) findings.push(`Titel gefunden: ${result.data.title}`)
        if (result.data.description) findings.push(`Beschreibung extrahiert`)
        if (result.data.techStack && result.data.techStack.length > 0) {
          findings.push(`Tech-Stack: ${result.data.techStack.join(', ')}`)
        }
        if (result.data.hiring) findings.push('Stellenausschreibungen gefunden')
        if (result.data.productUpdates && result.data.productUpdates.length > 0) {
          findings.push(`${result.data.productUpdates.length} Produkt-Updates gefunden`)
        }
        
        setSteps(prev => prev.map((step, index) => 
          index === stepIndex ? {
            ...step,
            status: result.success ? "completed" : "error",
            progress: 100,
            findings,
            changes: findings.length,
            responseTime: result.responseTime,
            error: result.error
          } : step
        ))
        
        setOverallProgress(((i + 1) / crawlResults.length) * 100)
      }
    }
  }

  const getStatusIcon = (status: CrawlerStep["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-gray-400" />
      case "crawling":
        return <Globe className="h-4 w-4 text-blue-500 animate-spin" />
      case "analyzing":
        return <Search className="h-4 w-4 text-yellow-500 animate-pulse" />
      case "comparing":
        return <Database className="h-4 w-4 text-orange-500 animate-bounce" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusText = (status: CrawlerStep["status"]) => {
    switch (status) {
      case "pending":
        return "Wartend"
      case "crawling":
        return "Crawling Website..."
      case "analyzing":
        return "Analysiere Daten..."
      case "comparing":
        return "Vergleiche mit DB..."
      case "completed":
        return "Abgeschlossen"
      case "error":
        return "Fehler"
    }
  }

  const getStatusColor = (status: CrawlerStep["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "crawling":
        return "bg-blue-100 text-blue-800"
      case "analyzing":
        return "bg-yellow-100 text-yellow-800"
      case "comparing":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Echter Web Crawler
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Gesamtfortschritt</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {isRunning ? `Verarbeite ${currentStep + 1} von ${steps.length} Startups...` : "Simulation abgeschlossen"}
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <Card
                key={step.id}
                className={`transition-all duration-300 ${
                  index === currentStep && isRunning ? "ring-2 ring-primary shadow-lg" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(step.status)}
                      <div>
                        <h4 className="font-semibold">{step.startup}</h4>
                        <p className="text-sm text-muted-foreground">{step.url}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(step.status)}>{getStatusText(step.status)}</Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <Progress value={step.progress} className="h-1.5" />
                  </div>

                  {/* Details */}
                  {step.status !== "pending" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium mb-1">Gefundene Änderungen:</div>
                        <ul className="space-y-1">
                          {step.findings
                            .slice(0, Math.floor((step.progress / 100) * step.findings.length) + 1)
                            .map((finding, i) => (
                              <li key={i} className="text-muted-foreground flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {finding}
                              </li>
                            ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Antwortzeit:</span>
                          <span className="font-mono">{step.responseTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Änderungen:</span>
                          <span className="font-semibold text-primary">{step.changes}</span>
                        </div>
                        {step.status === "completed" && (
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className="text-green-600 font-medium">✓ Erfolgreich</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          {!isRunning && steps.length > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Crawling abgeschlossen!</h4>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Startups gescannt:</div>
                    <div className="text-2xl font-bold text-green-600">{steps.length}</div>
                  </div>
                  <div>
                    <div className="font-medium">Erfolgreich:</div>
                    <div className="text-2xl font-bold text-green-600">
                      {steps.filter(s => s.status === "completed").length}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Fehler:</div>
                    <div className="text-2xl font-bold text-red-600">
                      {steps.filter(s => s.status === "error").length}
                    </div>
                  </div>
                </div>
                {summary && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Gesamt Änderungen:</div>
                        <div className="text-lg font-bold text-green-600">
                          {steps.reduce((sum, step) => sum + step.changes, 0)}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Durchschn. Antwortzeit:</div>
                        <div className="text-lg font-bold text-green-600">
                          {summary.averageResponseTime}ms
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-red-800">Crawl-Fehler</h4>
                </div>
                <p className="text-sm text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
