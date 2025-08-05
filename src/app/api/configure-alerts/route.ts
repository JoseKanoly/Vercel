import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const data = await request.json()
  console.log("Configure Alerts Request:", data)

  return NextResponse.json({
    success: true,
    message: "Configuración de alertas guardada exitosamente",
  })
}
