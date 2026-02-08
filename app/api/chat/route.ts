import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

// ---------------------------------------------------------------------------
// 1. Data Loading
// ---------------------------------------------------------------------------

async function fetchStartupData() {
  try {
    const dataDir = join(process.cwd(), "public", "data")

    const [startupsRaw, aiInsightsRaw, newsFeedRaw] = await Promise.all([
      readFile(join(dataDir, "startups.json"), "utf-8"),
      readFile(join(dataDir, "ai-insights.json"), "utf-8").catch(() => "{}"),
      readFile(join(dataDir, "news-feed.json"), "utf-8").catch(() => '{"news":[]}'),
    ])

    const startups = JSON.parse(startupsRaw)
    const aiInsights = JSON.parse(aiInsightsRaw)
    const newsFeed = JSON.parse(newsFeedRaw)

    return { startups, aiInsights, newsFeed }
  } catch (error) {
    console.error("Error reading data files:", error)
    return null
  }
}

// ---------------------------------------------------------------------------
// 2. Context Formatting  (token-efficient – only fields useful for queries)
// ---------------------------------------------------------------------------

/**
 * Converts startups + AI insights into a compact, token-efficient text block.
 * Only the fields that matter for user queries are included:
 *   Name, Sector, City, SDGs, Batch, Phase, Status, Founders, Short Description.
 * Heavy fields (IDs, timestamps, HTML, quality metadata) are stripped.
 */
function formatStartupsForAI(
  startups: any[],
  aiInsights: any[] = []
): string {
  // Pre-index founder names from AI insights for fast lookup
  const foundersMap = new Map<string, string>()
  for (const insight of aiInsights) {
    if (!insight.startup_id) continue
    const names: string[] = []
    if (Array.isArray(insight.founders)) {
      for (const f of insight.founders) {
        if (typeof f === "string") names.push(f)
        else if (f?.name) names.push(f.name)
      }
    }
    if (names.length > 0) {
      foundersMap.set(insight.startup_id, names.join(", "))
    }
  }

  const lines = startups.map((s: any) => {
    // Short description: prefer official > latest > top-level, strip HTML
    const rawDesc =
      s.official?.description || s.latest?.description || s.description || ""
    const shortDesc = rawDesc
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 150)

    // Founders: AI insights > primaryContact name
    const founders =
      foundersMap.get(s.id) || s.primaryContact?.name || "–"

    return [
      s.name || "–",
      s.sector || "–",
      s.city || "–",
      `SDG ${s.sdgs?.join(",") || "–"}`,
      s.batch || "–",
      s.programPhase || "–",
      s.status || "–",
      `Gründer: ${founders}`,
      shortDesc ? `Beschreibung: ${shortDesc}` : "",
    ]
      .filter(Boolean)
      .join(" | ")
  })

  return [
    `Anzahl Startups: ${startups.length}`,
    "Format: Name | Sektor | Stadt | SDGs | Batch | Phase | Status | Gründer | Beschreibung",
    "",
    ...lines,
  ].join("\n")
}

/**
 * Converts news-feed items into a compact text block.
 */
function formatNewsForContext(newsItems: any[]): string {
  if (!newsItems || newsItems.length === 0) return "Keine News vorhanden."

  const lines = newsItems.slice(0, 30).map((n: any) => {
    const date = n.date || "–"
    const startup = n.startup_name || "–"
    const headline = n.headline || "–"
    return `${date} – ${startup}: ${headline}`
  })

  return [`Anzahl News: ${newsItems.length}`, "", ...lines].join("\n")
}

// ---------------------------------------------------------------------------
// 3. Build the combined context string
// ---------------------------------------------------------------------------

function buildContext(
  startups: any[],
  aiInsights: any[],
  newsItems: any[]
): string {
  const startupBlock = formatStartupsForAI(startups, aiInsights)
  const newsBlock = formatNewsForContext(newsItems)

  return [
    "--- STARTUP DATA ---",
    startupBlock,
    "",
    "--- NEWS DATA ---",
    newsBlock,
  ].join("\n")
}

// ---------------------------------------------------------------------------
// 4. System Prompt (shared base – used by both providers)
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT_BASE = `Du bist ein Experten-Analyst des Impact Factory Startup Dashboards. Du hast eine vollständige Liste aller Startups im System.

WICHTIG: Denke Schritt für Schritt bevor du auf komplexe Filterfragen antwortest.

DEIN VORGEHEN (Schritt für Schritt):
Schritt 1 – Anfrage analysieren: Lies die Frage des Nutzers genau. Bestimme den Suchtyp (Filter nach Stadt, Sektor, SDG, Gründer, Phase, Status, Batch, etc.).
Schritt 2 – Liste durchsuchen: Gehe die GESAMTE Startup-Liste systematisch durch. Prüfe JEDES Startup gegen die Suchkriterien.
  • Bei Suche nach „weiblichen Gründerinnen" / „Gründerinnen": Prüfe die Vornamen im Feld „Gründer" auf typisch weibliche Vornamen.
  • Bei Ortssuche: Vergleiche mit dem Feld „Stadt".
  • Bei Sektorsuche: Vergleiche mit dem Feld „Sektor".
  • Bei SDG-Suche: Vergleiche mit dem Feld „SDGs".
  • Bei Phasensuche: Vergleiche mit dem Feld „Phase" (Early, Growth, Scale, Community, Alumni, etc.).
Schritt 3 – Ergebnis ausgeben: Liste ALLE passenden Startups auf – nicht nur die ersten paar.

REGELN – strikt einhalten:
1. Antworte AUSSCHLIESSLICH auf Basis der bereitgestellten Daten (STARTUP DATA und NEWS DATA).
2. Wenn die Antwort NICHT aus den Daten abgeleitet werden kann, sage ehrlich: „Dazu habe ich leider keine Informationen in meinen Daten."
3. Erfinde KEINE Fakten, Zahlen oder Startups, die nicht in den Daten vorkommen.
4. Bei Filterfragen liste ALLE passenden Ergebnisse vollständig auf – kürze die Ausgabe NIEMALS ab.
5. Formatiere Listen übersichtlich mit Aufzählungszeichen.
6. Nutze das Feld „Beschreibung" für Fragen zum Geschäftsmodell oder Produkt.
7. Antworte IMMER auf Deutsch.
`

function buildSystemPrompt(context: string): string {
  return `${SYSTEM_PROMPT_BASE}
Hier sind die aktuellen Daten:

${context}
`
}

// ---------------------------------------------------------------------------
// 5. LLM Providers
// ---------------------------------------------------------------------------

async function callOpenAI(messages: ChatMessage[], context: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OpenAI API key not configured")

  const systemMessage = {
    role: "system",
    content: buildSystemPrompt(context),
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [systemMessage, ...messages],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(
      `OpenAI API error: ${error.error?.message || response.statusText}`
    )
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || "Keine Antwort verfügbar."
}

async function callGemini(messages: ChatMessage[], context: string) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    throw new Error(
      "Gemini API key not configured. Set GEMINI_API_KEY or GOOGLE_AI_API_KEY in environment variables."
    )
  }

  const conversationHistory = messages
    .map((m) => `${m.role === "user" ? "Nutzer" : "Assistent"}: ${m.content}`)
    .join("\n")

  const prompt = `${buildSystemPrompt(context)}
Bisheriger Gesprächsverlauf:
${conversationHistory}

Bitte antworte auf die letzte Nachricht des Nutzers.`

  const model = process.env.GEMINI_MODEL || "gemini-2.5-pro"
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    console.error("Gemini API error:", error)
    throw new Error(
      `Gemini API error: ${error.error?.message || response.statusText}`
    )
  }

  const data = await response.json()
  const candidate = data.candidates?.[0]

  if (!candidate) {
    console.error(
      "No candidates in Gemini response:",
      JSON.stringify(data, null, 2)
    )
    throw new Error("Gemini hat keine Antwort generiert")
  }

  if (candidate.finishReason === "SAFETY") {
    throw new Error("Die Anfrage wurde aus Sicherheitsgründen blockiert")
  }

  let text =
    candidate.content?.parts?.[0]?.text ||
    candidate.content?.text ||
    candidate.output

  if (
    !text &&
    candidate.content?.parts &&
    Array.isArray(candidate.content.parts)
  ) {
    text = candidate.content.parts
      .filter((p: any) => p.text)
      .map((p: any) => p.text)
      .join("")
  }

  if (!text || text.trim() === "") {
    console.error(
      "Could not extract text from Gemini response:",
      JSON.stringify(data, null, 2)
    )
    throw new Error(
      "Entschuldigung, die KI konnte keine Antwort generieren. Bitte versuche eine kürzere oder spezifischere Frage."
    )
  }

  return text
}

// ---------------------------------------------------------------------------
// 6. Route Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, history = [] } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Load all data sources
    const rawData = await fetchStartupData()

    let context = "Keine Daten verfügbar."
    if (rawData) {
      const startups = Array.isArray(rawData.startups)
        ? rawData.startups
        : []
      const aiInsights = rawData.aiInsights?.insights ?? []
      const newsItems = rawData.newsFeed?.news ?? []

      console.log(
        `📊 Context: ${startups.length} Startups, ${aiInsights.length} AI-Insights, ${newsItems.length} News`
      )

      context = buildContext(startups, aiInsights, newsItems)
    }

    // Build message history
    const messages: ChatMessage[] = [
      ...history
        .filter((m: any) => m.role && m.content)
        .map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ]

    // Choose LLM provider
    const llmProvider = process.env.LLM_PROVIDER || "gemini"
    let responseMessage: string

    if (llmProvider === "gemini") {
      responseMessage = await callGemini(messages, context)
    } else if (llmProvider === "openai") {
      responseMessage = await callOpenAI(messages, context)
    } else {
      throw new Error(
        `Unknown LLM provider: ${llmProvider}. Use 'openai' or 'gemini'.`
      )
    }

    return NextResponse.json({
      message: responseMessage,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Chat API error:", error)
    const errorDetails =
      error instanceof Error ? error.message : String(error)
    console.error("Error details:", errorDetails)

    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error
            ? error.message
            : "Ein Fehler ist aufgetreten. Bitte überprüfe deine API-Konfiguration.",
        ...(process.env.NODE_ENV === "development" && {
          debug: errorDetails,
        }),
      },
      { status: 500 }
    )
  }
}
