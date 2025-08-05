import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const data = await request.json()
  console.log("Export Data Request:", data)

  await new Promise((resolve) => setTimeout(resolve, 1500))

  const filename = `datos_ambientales_${Date.now()}.${data.format.toLowerCase()}`
  const downloadUrl = `/api/download-mock-file?filename=${filename}` // Una URL ficticia para la descarga

  return NextResponse.json({
    success: true,
    message: "Datos exportados exitosamente",
    filename: filename,
    downloadUrl: downloadUrl,
  })
}
