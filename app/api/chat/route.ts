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
// 2. Context Formatting Helpers  (token-efficient plain text)
// ---------------------------------------------------------------------------

/**
 * Converts the raw startups array + AI insights into a compact text block.
 * Focuses on fields useful for answering user questions:
 *   Name, Sector, SDGs, City/State, Batch, Programme Phase, Status,
 *   Description (truncated), Founders.
 * Technical IDs, quality metadata, timestamps etc. are stripped out.
 */
function formatStartupsForContext(
  startups: any[],
  insights: any[]
): string {
  const insightsMap = new Map<string, any>()
  for (const i of insights) {
    if (i.startup_id) insightsMap.set(i.startup_id, i)
  }

  const lines = startups.map((s: any) => {
    const parts: string[] = []

    // Core fields
    parts.push(s.name || "–")
    parts.push(s.sector || "–")
    parts.push(`SDG ${s.sdgs?.join(", ") || "–"}`)
    parts.push(`${s.city || "–"}, ${s.state || "–"}`)
    parts.push(s.batch || "–")
    parts.push(s.programPhase || "–")
    parts.push(s.status || "–")

    // Description – prefer official > latest > top-level, truncated
    const desc =
      s.official?.description || s.latest?.description || s.description
    if (desc) {
      parts.push(
        `Beschreibung: ${desc.substring(0, 200).replace(/\n/g, " ").trim()}`
      )
    }

    // Primary contact (name + role only, no raw emails/phones)
    if (s.primaryContact?.name) {
      let contact = s.primaryContact.name
      if (s.primaryContact.title) contact += ` (${s.primaryContact.title})`
      parts.push(`Kontakt: ${contact}`)
    }

    // AI Insights – founders & german summary
    const insight = insightsMap.get(s.id)
    if (insight) {
      // Founders
      const founders = extractFounders(insight)
      if (founders) parts.push(`Gründer: ${founders}`)

      // German summary from AI enrichment (compact)
      if (insight.german_summary) {
        const summary = insight.german_summary
          .substring(0, 200)
          .replace(/\n/g, " ")
          .trim()
        parts.push(`Info: ${summary}`)
      }
    }

    return parts.join(" | ")
  })

  return [
    `Anzahl Startups: ${startups.length}`,
    "Format: Name | Sektor | SDGs | Ort | Batch | Programmphase | Status | Beschreibung | Kontakt | Gründer | Info",
    "",
    ...lines,
  ].join("\n")
}

/** Extract a readable founders string from an AI insight record. */
function extractFounders(insight: any): string | null {
  const raw =
    insight.founders ||
    insight.team_info ||
    insight.business_metrics?.team_members
  if (!raw) return null

  const names: string[] = []

  if (typeof raw === "string") {
    names.push(raw)
  } else if (Array.isArray(raw)) {
    for (const f of raw) {
      if (typeof f === "string") names.push(f)
      else if (f?.name) names.push(f.name + (f.role ? ` (${f.role})` : ""))
      else if (f?.founder_name) names.push(f.founder_name)
    }
  } else if (typeof raw === "object" && raw.name) {
    names.push(raw.name)
  }

  return names.length > 0 ? names.join(", ") : null
}

/**
 * Converts the raw news-feed items into a compact text block.
 * Includes: Date, Startup Name, Headline, Summary snippet.
 */
function formatNewsForContext(newsItems: any[]): string {
  if (!newsItems || newsItems.length === 0) return "Keine News vorhanden."

  const lines = newsItems.map((n: any) => {
    const date = n.date || "–"
    const startup = n.startup_name || "–"
    const headline = n.headline || "–"
    const summary = n.summary
      ? n.summary.substring(0, 200).replace(/\n/g, " ").trim()
      : ""
    return `${date} – ${startup}: ${headline}${summary ? ` | ${summary}` : ""}`
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
  const startupBlock = formatStartupsForContext(startups, aiInsights)
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

const SYSTEM_PROMPT_BASE = `Du bist der KI-Assistent des Impact Factory Startup Dashboards. Du bist freundlich, professionell und antwortest immer auf Deutsch.

REGELN – bitte strikt einhalten:
1. Beantworte Fragen AUSSCHLIESSLICH auf Basis der unten bereitgestellten Daten (STARTUP DATA und NEWS DATA).
2. Wenn die Antwort NICHT aus den bereitgestellten Daten abgeleitet werden kann, sage ehrlich: „Dazu habe ich leider keine Informationen in meinen Daten."
3. Erfinde KEINE Fakten, Zahlen oder Startups, die nicht in den Daten vorkommen.
4. Bei Filterfragen (z.B. nach Stadt, Bundesland, Sektor, SDG) liste ALLE passenden Ergebnisse auf.
5. Formatiere Listen übersichtlich mit Aufzählungszeichen.
6. Die Programmphase kann sein: Early, Growth, Scale, Community, Alumni, etc. – nutze das Feld „Programmphase" für entsprechende Fragen.
7. Nutze das Feld „Beschreibung" bzw. „Info" für Fragen zum Geschäftsmodell oder Produkt.
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
      temperature: 0.4,
      max_tokens: 1500,
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

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash"
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
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
