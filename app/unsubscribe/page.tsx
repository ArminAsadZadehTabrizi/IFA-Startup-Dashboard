"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { MailX, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleUnsubscribe = async () => {
    if (!email) return

    setIsLoading(true)
    setStatus("idle")
    setErrorMessage("")

    try {
      const response = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
      } else {
        setStatus("error")
        setErrorMessage(data.error || "Abmeldung fehlgeschlagen")
      }
    } catch (error) {
      console.error("Newsletter unsubscribe error:", error)
      setStatus("error")
      setErrorMessage("Verbindungsfehler. Bitte versuche es erneut.")
    } finally {
      setIsLoading(false)
    }
  }

  // No email provided
  if (!email) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto p-3 rounded-full bg-destructive/10 w-fit mb-3">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Fehlende E-Mail-Adresse</CardTitle>
          <CardDescription>
            Es wurde keine E-Mail-Adresse angegeben. Bitte nutze den Link aus der Newsletter-E-Mail.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Link href="/news" className="block">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4" />
              Zurück zu den News
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  // Success state
  if (status === "success") {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto p-3 rounded-full bg-green-500/10 w-fit mb-3">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-xl">Erfolgreich abgemeldet</CardTitle>
          <CardDescription>
            Du wurdest erfolgreich aus dem Newsletter-Verteiler entfernt und erhältst keine weiteren E-Mails mehr.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Link href="/news" className="block">
            <Button className="w-full">
              <ArrowLeft className="w-4 h-4" />
              Zurück zu den News
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  // Default / Error state
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto p-3 rounded-full bg-destructive/10 w-fit mb-3">
          <MailX className="w-8 h-8 text-destructive" />
        </div>
        <CardTitle className="text-xl">Newsletter abbestellen</CardTitle>
        <CardDescription>
          Möchtest du <span className="font-medium text-foreground">{email}</span> wirklich aus dem Verteiler entfernen?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleUnsubscribe}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Wird abgemeldet...
            </>
          ) : (
            "Ja, abmelden"
          )}
        </Button>

        {status === "error" && (
          <div className="flex items-center gap-2 text-destructive text-sm justify-center">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Link href="/news" className="block">
          <Button variant="ghost" className="w-full text-muted-foreground">
            Abbrechen
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <Suspense
        fallback={
          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        }
      >
        <UnsubscribeContent />
      </Suspense>
    </div>
  )
}
