import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename") || "download.txt"

  // Simular contenido de un archivo
  const content = `Este es un archivo de prueba para ${filename}. Contiene datos ambientales simulados.`

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
