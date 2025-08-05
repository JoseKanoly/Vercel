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
      monitoring_type,
      taxonomic_groups,
      conservation_status,
      sampling_method,
      include_rare_species,
      generate_report,
    } = body

    if (!user_id || !monitoring_type || !taxonomic_groups) {
      return NextResponse.json({ success: false, message: "Datos incompletos." }, { status: 400 })
    }

    // Insertar monitoreo en la base de datos
    const result = await sql`
      INSERT INTO biodiversity_monitoring (
        user_id, monitoring_type, taxonomic_groups, conservation_status,
        sampling_method, include_rare_species, generate_report
      )
      VALUES (
        ${user_id}, ${monitoring_type}, ${taxonomic_groups}, ${conservation_status || "all"},
        ${sampling_method || "visual"}, ${include_rare_species || true}, ${generate_report || false}
      )
      RETURNING id
    `

    // Simular procesamiento del monitoreo
    const monitoringResults = {
      species_registered: Math.floor(Math.random() * 50) + 20,
      new_species: Math.floor(Math.random() * 5),
      diversity_index: (Math.random() * 2 + 2).toFixed(2),
      taxonomic_groups_found: taxonomic_groups.length,
      rare_species_found: include_rare_species ? Math.floor(Math.random() * 3) : 0,
    }

    // Actualizar con resultados
    await sql`
      UPDATE biodiversity_monitoring 
      SET results = ${JSON.stringify(monitoringResults)}, 
          status = 'completed', 
          completed_at = CURRENT_TIMESTAMP
      WHERE id = ${result[0].id}
    `

    return NextResponse.json({
      success: true,
      message: "Monitoreo de biodiversidad completado exitosamente.",
      monitoring_id: result[0].id,
      results: monitoringResults,
    })
  } catch (error: any) {
    console.error("Biodiversity monitoring error:", error)
    return NextResponse.json({ success: false, message: "Error en el monitoreo de biodiversidad." }, { status: 500 })
  }
}
