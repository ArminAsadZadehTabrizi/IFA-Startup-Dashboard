import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "E-Mail-Adresse ist erforderlich" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Ungültige E-Mail-Adresse" },
        { status: 400 }
      )
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID

    if (!audienceId) {
      console.error("RESEND_AUDIENCE_ID is not configured")
      return NextResponse.json(
        { error: "Newsletter-Konfiguration fehlt" },
        { status: 500 }
      )
    }

    // Add contact to Resend audience
    const { data, error } = await resend.contacts.create({
      email,
      unsubscribed: false,
      audienceId,
    })

    if (error) {
      console.error("Resend API error:", error)
      return NextResponse.json(
        { error: "Anmeldung fehlgeschlagen. Bitte versuche es später erneut." },
        { status: 500 }
      )
    }

    console.log("Newsletter subscription successful:", data)

    return NextResponse.json(
      { message: "Erfolgreich angemeldet!", data },
      { status: 200 }
    )
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json(
      { error: "Ein unerwarteter Fehler ist aufgetreten" },
      { status: 500 }
    )
  }
}
