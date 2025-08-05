import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const connectionString =
      process.env.NEON_DATABASE_URL ||
      "postgresql://neondb_owner:npg_RgB8nXoQdN4f@ep-withered-math-aew2ropa-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

    const pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    })

    // Obtener datos del cuerpo de la petición
    const body = await request.json()
    const { name, email, institution, role, password } = body

    // Validar que todos los campos requeridos estén presentes
    if (!name || !email || !institution || !role || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Todos los campos son requeridos",
        },
        { status: 400 },
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Formato de email inválido",
        },
        { status: 400 },
      )
    }

    const client = await pool.connect()

    try {
      // Verificar si el email ya existe
      const existingUser = await client.query("SELECT id FROM usuarios WHERE email = $1", [email])

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Este email ya está registrado",
          },
          { status: 409 },
        )
      }

      // Encriptar la contraseña
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // Insertar el nuevo usuario
      const insertResult = await client.query(
        `INSERT INTO usuarios (nombre_completo, email, institucion, rol, password, created_at) 
         VALUES ($1, $2, $3, $4, $5, NOW()) 
         RETURNING id, nombre_completo, email, institucion, rol, created_at`,
        [name, email, institution, role, hashedPassword],
      )

      const newUser = insertResult.rows[0]

      return NextResponse.json({
        success: true,
        message: "Usuario registrado exitosamente",
        user_id: newUser.id,
        user: {
          id: newUser.id,
          name: newUser.nombre_completo,
          email: newUser.email,
          institution: newUser.institucion,
          role: newUser.rol,
          created_at: newUser.created_at,
        },
      })
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error("Error detallado en registro:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack,
    })

    // Manejar errores específicos de PostgreSQL
    if (error.code === "23505") {
      // Violación de restricción única
      return NextResponse.json(
        {
          success: false,
          message: "Este email ya está registrado",
        },
        { status: 409 },
      )
    }

    if (error.code === "23502") {
      // Violación de NOT NULL
      return NextResponse.json(
        {
          success: false,
          message: "Faltan campos requeridos",
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor. Intente nuevamente.",
        error_details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
