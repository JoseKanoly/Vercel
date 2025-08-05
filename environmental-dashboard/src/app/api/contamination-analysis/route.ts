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
    const {
      user_id,
      contaminant_types,
      severity_level,
      sources,
      mitigation_actions,
      notify_authorities,
      emergency_protocol,
    } = body

    if (!user_id || !contaminant_types) {
      return NextResponse.json({ success: false, message: "Datos incompletos." }, { status: 400 })
    }

    // Insertar análisis en la base de datos
    const result = await sql`
      INSERT INTO contamination_analyses (
        user_id, contaminant_types, severity_level, sources,
        mitigation_actions, notify_authorities, emergency_protocol
      )
      VALUES (
        ${user_id}, ${contaminant_types}, ${severity_level || "all"}, ${sources || []},
        ${mitigation_actions || []}, ${notify_authorities || false}, ${emergency_protocol || false}
      )
      RETURNING id
    `

    // Simular procesamiento del análisis
    const analysisResults = {
      contaminants_detected: contaminant_types.length,
      alerts_generated: Math.floor(Math.random() * 10) + 1,
      high_risk_areas: Math.floor(Math.random() * 3),
      mitigation_actions_recommended: mitigation_actions.length,
      authorities_notified: notify_authorities,
      emergency_activated: emergency_protocol,
    }

    // Actualizar con resultados
    await sql`
      UPDATE contamination_analyses 
      SET results = ${JSON.stringify(analysisResults)}, 
          status = 'completed', 
          completed_at = CURRENT_TIMESTAMP
      WHERE id = ${result[0].id}
    `

    return NextResponse.json({
      success: true,
      message: "Análisis de contaminación completado exitosamente.",
      analysis_id: result[0].id,
      results: analysisResults,
    })
  } catch (error: any) {
    console.error("Contamination analysis error:", error)
    return NextResponse.json({ success: false, message: "Error en el análisis de contaminación." }, { status: 500 })
  }
}
