import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  const connectionString = process.env.NEON_DATABASE_URL

  if (!connectionString) {
    return NextResponse.json({ success: false, message: "NEON_DATABASE_URL no está configurada." }, { status: 500 })
  }

  const sql = neon(connectionString)

  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email y contraseña son requeridos." }, { status: 400 })
    }

    const users = await sql`
      SELECT id, nombre_completo, email, institucion, rol, password
      FROM usuarios
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({ success: false, message: "Credenciales inválidas." }, { status: 401 })
    }

    const user = users[0]

    if (!user.password) {
      return NextResponse.json({ success: false, message: "Error en datos de usuario: contraseña no encontrada." }, { status: 500 })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ success: false, message: "Credenciales inválidas." }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      message: "Inicio de sesión exitoso",
      user: {
        id: user.id,
        nombre_completo: user.nombre_completo,
        email: user.email,
        institucion: user.institucion,
        rol: user.rol,
      },
    })
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor." }, { status: 500 })
  }

  
}
