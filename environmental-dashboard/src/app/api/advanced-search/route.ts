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
      search_type,
      keywords,
      category,
      date_range_start,
      date_range_end,
      location_lat,
      location_lng,
      location_radius,
      parameters,
      alert_level,
      include_historical,
      sort_by,
      max_results,
    } = body

    if (!user_id || !search_type || !keywords) {
      return NextResponse.json({ success: false, message: "Datos incompletos." }, { status: 400 })
    }

    // Simular resultados de búsqueda
    const searchResults = [
      { id: 1, title: "Estación Bahía Norte - Datos de pH", type: "station", relevance: 0.95 },
      { id: 2, title: "Alerta: Oxígeno bajo en Puerto Sur", type: "alert", relevance: 0.87 },
      { id: 3, title: "Reporte de Biodiversidad - Enero 2024", type: "report", relevance: 0.76 },
    ].slice(0, Number.parseInt(max_results) || 100)

    // Guardar búsqueda en historial
    await sql`
      INSERT INTO advanced_searches (
        user_id, search_type, keywords, category, date_range_start, date_range_end,
        location_lat, location_lng, location_radius, parameters, alert_level,
        include_historical, sort_by, max_results, results_count
      )
      VALUES (
        ${user_id}, ${search_type}, ${keywords}, ${category || "all"}, 
        ${date_range_start || null}, ${date_range_end || null},
        ${location_lat || null}, ${location_lng || null}, ${location_radius || null},
        ${parameters || []}, ${alert_level || "all"}, ${include_historical || false},
        ${sort_by || "relevance"}, ${max_results || 100}, ${searchResults.length}
      )
    `

    return NextResponse.json({
      success: true,
      message: "Búsqueda completada exitosamente.",
      data: searchResults,
      total_results: searchResults.length,
    })
  } catch (error: any) {
    console.error("Advanced search error:", error)
    return NextResponse.json({ success: false, message: "Error en la búsqueda avanzada." }, { status: 500 })
  }
}
