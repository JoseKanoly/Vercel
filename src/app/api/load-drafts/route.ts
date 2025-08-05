import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: NextRequest) {
  const connectionString = process.env.NEON_DATABASE_URL

  if (!connectionString) {
    return NextResponse.json({ success: false, message: "NEON_DATABASE_URL no está configurada." }, { status: 500 })
  }

  const sql = neon(connectionString)

  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")
    const form_type = searchParams.get("form_type")

    if (!user_id || !form_type) {
      return NextResponse.json({ success: false, message: "user_id y form_type son requeridos." }, { status: 400 })
    }

    const drafts = await sql`
      SELECT id, draft_name, form_data, created_at, updated_at
      FROM form_drafts 
      WHERE user_id = ${user_id} AND form_type = ${form_type}
      ORDER BY updated_at DESC
    `

    return NextResponse.json({ success: true, drafts })
  } catch (error: any) {
    console.error("Load drafts error:", error)
    return NextResponse.json({ success: false, message: "Error al cargar borradores." }, { status: 500 })
  }
}
