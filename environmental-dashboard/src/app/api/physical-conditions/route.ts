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
      parameters,
      measurement_interval,
      extreme_condition_alerts,
      weather_integration,
      forecast_period,
    } = body

    if (!user_id || !parameters) {
      return NextResponse.json({ success: false, message: "Datos incompletos." }, { status: 400 })
    }

    // Insertar configuración en la base de datos
    const result = await sql`
      INSERT INTO physical_conditions_monitoring (
        user_id, parameters, measurement_interval, extreme_condition_alerts,
        weather_integration, forecast_period, configuration
      )
      VALUES (
        ${user_id}, ${parameters}, ${measurement_interval || "15min"}, ${extreme_condition_alerts || true},
        ${weather_integration || true}, ${forecast_period || "24h"}, ${JSON.stringify(body)}
      )
      RETURNING id
    `

    return NextResponse.json({
      success: true,
      message: "Configuración de monitoreo físico guardada exitosamente.",
      monitoring_id: result[0].id,
    })
  } catch (error: any) {
    console.error("Physical conditions monitoring error:", error)
    return NextResponse.json(
      { success: false, message: "Error en la configuración de monitoreo físico." },
      { status: 500 },
    )
  }
}
