import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

// Fetch startup data from local JSON files
async function fetchStartupData() {
  try {
    const startupsPath = join(process.cwd(), "public", "data", "startups.json")
    const aiInsightsPath = join(process.cwd(), "public", "data", "ai-insights.json")
    
    const [startupsData, aiInsightsData] = await Promise.all([
      readFile(startupsPath, "utf-8"),
      readFile(aiInsightsPath, "utf-8").catch(() => "{}"),
    ])

    const startups = JSON.parse(startupsData)
    const aiInsights = JSON.parse(aiInsightsData)

    return { startups, aiInsights }
  } catch (error) {
    console.error("Error reading startup data:", error)
    return null
  }
}

// Call OpenAI API
async function callOpenAI(messages: ChatMessage[], context: string) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OpenAI API key not configured")
  }

  const systemMessage = {
    role: "system",
    content: `Du bist ein hilfreicher Assistent für das Impact Factory Startup Dashboard. 
Du hilfst Nutzern, Informationen über Startups zu finden und Fragen zu beantworten.

Hier ist der aktuelle Kontext mit Startup-Daten:
${context}

Beantworte Fragen präzise, freundlich und auf Deutsch. Wenn du nicht genug Informationen hast, sage das ehrlich.`,
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
      temperature: 0.7,
      max_tokens: 1000,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || "Keine Antwort verfügbar."
}

// Call Gemini API (Google AI)
async function callGemini(messages: ChatMessage[], context: string) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY

  if (!apiKey) {
    throw new Error("Gemini API key not configured. Set GEMINI_API_KEY or GOOGLE_AI_API_KEY in environment variables.")
  }

  // Build conversation history for Gemini
  const conversationHistory = messages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n")

  // System prompt + context + conversation
  const prompt = `Du bist ein hilfreicher Assistent für das Impact Factory Startup Dashboard. 
Du hilfst Nutzern, Informationen über Startups zu finden und Fragen zu beantworten.

Hier ist der aktuelle Kontext mit Startup-Daten:
${context}

WICHTIG:
- Beantworte Fragen präzise, freundlich und auf Deutsch
- Nutze die Startup-Daten aus dem Kontext (ALLE Startups sind vorhanden!)
- Bei Filterfragen (z.B. nach Stadt/Bundesland) liste ALLE passenden Startups auf
- Wenn du nicht genug Informationen hast, sage das ehrlich
- Formatiere Listen übersichtlich mit Aufzählungszeichen

Bisheriger Gesprächsverlauf:
${conversationHistory}

Bitte antworte auf die letzte Nachricht.`

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash"
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
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
  
  // Check for errors or blocked responses
  const candidate = data.candidates?.[0]
  
  if (!candidate) {
    console.error("No candidates in Gemini response:", JSON.stringify(data, null, 2))
    throw new Error("Gemini hat keine Antwort generiert")
  }
  
  // Check finish reason
  if (candidate.finishReason === "MAX_TOKENS") {
    console.warn("Response was truncated due to MAX_TOKENS")
  } else if (candidate.finishReason === "SAFETY") {
    throw new Error("Die Anfrage wurde aus Sicherheitsgründen blockiert")
  }
  
  // Extract text from response
  let text = 
    candidate.content?.parts?.[0]?.text || // Standard format
    candidate.content?.text || // Alternative format
    candidate.output // Another possible format
  
  // Try to extract any text we can find
  if (!text && candidate.content?.parts && Array.isArray(candidate.content.parts)) {
    text = candidate.content.parts
      .filter((p: any) => p.text)
      .map((p: any) => p.text)
      .join('')
  }
  
  if (!text || text.trim() === '') {
    console.error("Could not extract text from Gemini response:", JSON.stringify(data, null, 2))
    throw new Error("Entschuldigung, die KI konnte keine Antwort generieren. Bitte versuche eine kürzere oder spezifischere Frage.")
  }
  
  return text
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, history = [] } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Fetch startup data from local files
    const data = await fetchStartupData()

    // Prepare context for the LLM
    let context = "Keine Startup-Daten verfügbar."
    if (data && Array.isArray(data.startups)) {
      const startups = data.startups
      const aiInsights = data.aiInsights?.insights || []
      
      // Debug: Log how many startups we have
      console.log(`📊 Loaded ${startups.length} startups and ${aiInsights.length} AI insights from JSON`)

      // Summarize the data for better context
      context = `Es gibt ${startups.length} Startups in der Datenbank.\n\n`
      
      // Add ALL startups with compact information (to fit in token limit)
      context += "STARTUPS:\n"
      context += startups
        .map((startup: any) => {
          const insights = aiInsights.find((i: any) => i.startup_id === startup.id)
          
          // Base info
          let info = `${startup.name} | ${startup.sector || "N/A"} | ${startup.city || "N/A"}, ${startup.state || "N/A"} | ${startup.batch || "N/A"} | ${startup.programPhase || "N/A"} | SDG ${startup.sdgs?.join(",") || "N/A"} | ${startup.status || "N/A"}`
          
          // Add descriptions (official or latest)
          const description = startup.official?.description || startup.latest?.description || startup.description
          if (description && description.length > 0) {
            const shortDesc = description.substring(0, 200).replace(/\n/g, ' ') // Limit to 200 chars, remove newlines
            info += ` | Beschreibung: ${shortDesc}`
          }
          
          // Add Primary Contact if available
          if (startup.primaryContact) {
            const contact = startup.primaryContact
            let contactInfo = contact.name || "N/A"
            if (contact.email) contactInfo += ` (${contact.email})`
            if (contact.phone) contactInfo += ` Tel: ${contact.phone}`
            if (contact.title) contactInfo += ` - ${contact.title}`
            info += ` | Kontakt: ${contactInfo}`
          }
          
          // Add AI insights if available
          if (insights) {
            // Add founders/team info (handle different formats)
            const foundersData = insights.team_info || insights.founders || insights.business_metrics?.team_members
            if (foundersData) {
              let foundersList = []
              
              if (typeof foundersData === 'string') {
                foundersList.push(foundersData)
              } else if (Array.isArray(foundersData)) {
                foundersData.forEach((f: any) => {
                  if (typeof f === 'string') {
                    foundersList.push(f)
                  } else if (f && typeof f === 'object') {
                    // Handle object format: {name: "...", role: "..."}
                    if (f.name) foundersList.push(f.name + (f.role ? ` (${f.role})` : ''))
                    else if (f.founder_name) foundersList.push(f.founder_name)
                  }
                })
              } else if (typeof foundersData === 'object') {
                // Single founder object
                if (foundersData.name) foundersList.push(foundersData.name)
              }
              
              if (foundersList.length > 0) {
                info += ` | Gründer: ${foundersList.join(", ")}`
              }
            }
            
            // Add key info from AI analysis
            if (insights.ai_analysis?.summary) {
              const summary = insights.ai_analysis.summary.substring(0, 150).replace(/\n/g, ' ') // Limit length
              info += ` | AI-Info: ${summary}`
            }
            
            // Add latest updates (first one only)
            if (insights.updates && insights.updates.length > 0) {
              info += ` | Update: ${insights.updates[0].title}`
            }
          }
          
          return info
        })
        .join("\n")
      
      context += "\n\nFELDER: Name | Sektor | Stadt, Bundesland | Batch | Programmphase | SDGs | Status | Beschreibung | Kontakt | Gründer | AI-Info | Updates"
      context += "\n\nBEACHTE: "
      context += "\n- Die Programmphase kann sein: Early, Growth, Scale, Community, Alumni, etc."
      context += "\n- Nutze die 'Programmphase' Spalte für Fragen nach Programmphase/Stage"
      context += "\n- Nutze die 'Beschreibung' Spalte für Fragen nach dem Geschäftsmodell/Produkt"
      context += "\n- Alle Felder sind verfügbar - antworte basierend auf allen Informationen"
    }

    // Build message history
    const messages: ChatMessage[] = [
      ...history
        .filter((m: any) => m.role && m.content)
        .map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      {
        role: "user",
        content: message,
      },
    ]

    // Choose which LLM to use based on environment variables
    const llmProvider = process.env.LLM_PROVIDER || "gemini" // Default to 'gemini' for free usage

    let responseMessage: string

    if (llmProvider === "gemini") {
      responseMessage = await callGemini(messages, context)
    } else if (llmProvider === "openai") {
      responseMessage = await callOpenAI(messages, context)
    } else {
      throw new Error(`Unknown LLM provider: ${llmProvider}. Use 'openai' or 'gemini'.`)
    }

    return NextResponse.json({
      message: responseMessage,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Chat API error:", error)
    
    // Better error logging for debugging
    const errorDetails = error instanceof Error ? error.message : String(error)
    console.error("Error details:", errorDetails)
    
    // Return more specific error message to help debug
    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error
            ? error.message
            : "Ein Fehler ist aufgetreten. Bitte überprüfe deine API-Konfiguration.",
        // Only include debug info in development
        ...(process.env.NODE_ENV === 'development' && { debug: errorDetails })
      },
      { status: 500 }
    )
  }
}

