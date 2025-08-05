import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: NextRequest) {
  const connectionString = process.env.NEON_DATABASE_URL

  if (!connectionString) {
    return NextResponse.json({ success: false, message: "NEON_DATABASE_URL no está configurada." }, { status: 500 })
  }

  const sql = neon(connectionString)

  try {
    const body = await request.json()
    const { user_id, form_type, form_data, draft_name } = body

    if (!user_id || !form_type || !form_data) {
      return NextResponse.json({ success: false, message: "Datos incompletos." }, { status: 400 })
    }

    // Verificar si ya existe un borrador con el mismo nombre para este usuario y tipo de formulario
    const existingDraft = await sql`
      SELECT id FROM form_drafts 
      WHERE user_id = ${user_id} AND form_type = ${form_type} AND draft_name = ${draft_name || "Borrador sin nombre"}
    `

    if (existingDraft.length > 0) {
      // Actualizar borrador existente
      await sql`
        UPDATE form_drafts 
        SET form_data = ${JSON.stringify(form_data)}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existingDraft[0].id}
      `
    } else {
      // Crear nuevo borrador
      await sql`
        INSERT INTO form_drafts (user_id, form_type, form_data, draft_name)
        VALUES (${user_id}, ${form_type}, ${JSON.stringify(form_data)}, ${draft_name || "Borrador sin nombre"})
      `
    }

    return NextResponse.json({ success: true, message: "Borrador guardado exitosamente." })
  } catch (error: any) {
    console.error("Save draft error:", error)
    return NextResponse.json({ success: false, message: "Error al guardar borrador." }, { status: 500 })
  }
}
