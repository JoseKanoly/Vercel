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
    const { user_id, action_type, station_name, latitude, longitude, station_type, sensors, maintenance_schedule } =
      body

    if (!user_id || !action_type || !station_name) {
      return NextResponse.json({ success: false, message: "Datos incompletos." }, { status: 400 })
    }

    // Insertar solicitud en la base de datos
    const result = await sql`
      INSERT INTO station_management_requests (
        user_id, action_type, station_name, latitude, longitude,
        station_type, sensors, maintenance_schedule
      )
      VALUES (
        ${user_id}, ${action_type}, ${station_name}, ${latitude || null}, ${longitude || null},
        ${station_type || "coastal"}, ${sensors || []}, ${maintenance_schedule || "monthly"}
      )
      RETURNING id
    `

    return NextResponse.json({
      success: true,
      message: `Solicitud de ${action_type === "add" ? "agregar" : action_type === "edit" ? "editar" : "eliminar"} estación enviada exitosamente.`,
      request_id: result[0].id,
    })
  } catch (error: any) {
    console.error("Station management error:", error)
    return NextResponse.json({ success: false, message: "Error en la gestión de estaciones." }, { status: 500 })
  }
}
