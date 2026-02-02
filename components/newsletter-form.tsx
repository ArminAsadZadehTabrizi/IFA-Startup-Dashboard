"use client"

import { useState, FormEvent } from "react"
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) return

    setIsLoading(true)
    setStatus("idle")
    setMessage("")

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Willkommen! Du erhältst bald unsere Updates.")
        setEmail("")
      } else {
        setStatus("error")
        setMessage(data.error || "Anmeldung fehlgeschlagen")
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error)
      setStatus("error")
      setMessage("Verbindungsfehler. Bitte versuche es erneut.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="card-enhanced overflow-hidden relative">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-lg bg-primary/10">
            <Mail className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-lg">Keine Updates verpassen</CardTitle>
        </div>
        <CardDescription>
          Erhalte die neuesten Startup-News direkt in dein Postfach.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative pt-2">
        {status === "success" ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="deine@email.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="flex-1 bg-background/50"
                aria-label="E-Mail-Adresse"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !email.trim()}
                className="btn-modern whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Wird angemeldet...</span>
                  </>
                ) : (
                  "Anmelden"
                )}
              </Button>
            </div>
            
            {status === "error" && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">
              Kein Spam. Jederzeit abmeldbar.
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
