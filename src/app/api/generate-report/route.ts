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
    const { user_id, report_type, format, include_charts, auto_send, recipients, custom_parameters } = body

    if (!user_id || !report_type || !format) {
      return NextResponse.json({ success: false, message: "Datos incompletos." }, { status: 400 })
    }

    // Insertar solicitud de reporte en la base de datos
    const result = await sql`
      INSERT INTO report_requests (
        user_id, report_type, format, include_charts,
        auto_send, recipients, custom_parameters
      )
      VALUES (
        ${user_id}, ${report_type}, ${format}, ${include_charts || true},
        ${auto_send || false}, ${recipients || []}, ${custom_parameters || []}
      )
      RETURNING id
    `

    // Simular generación del reporte
    const filename = `reporte_${report_type}_${Date.now()}.${format.toLowerCase()}`
    const file_path = `/reports/${filename}`

    // Actualizar con información del archivo generado
    await sql`
      UPDATE report_requests 
      SET file_path = ${file_path}, 
          status = 'completed', 
          completed_at = CURRENT_TIMESTAMP
      WHERE id = ${result[0].id}
    `

    return NextResponse.json({
      success: true,
      message: `Reporte ${report_type} generado exitosamente.`,
      report_id: result[0].id,
      filename,
      download_url: file_path, // En producción sería una URL real
    })
  } catch (error: any) {
    console.error("Report generation error:", error)
    return NextResponse.json({ success: false, message: "Error al generar reporte." }, { status: 500 })
  }
}
