import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

export async function GET(request: NextRequest) {
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

    const client = await pool.connect()

    try {
      const result = await client.query(
        `SELECT id, nombre_completo, email, institucion, rol, created_at 
         FROM usuarios 
         ORDER BY created_at DESC`,
      )

      return NextResponse.json({
        success: true,
        users: result.rows,
        total: result.rows.length,
      })
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error("Error al obtener usuarios:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener usuarios",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json()
    const { id, nombre_completo, email, institucion, rol, password } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID de usuario requerido" },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      // Construir consulta dinámica según los campos enviados
      const fields: string[] = []
      const values: any[] = []
      let idx = 1

      if (nombre_completo !== undefined) {
        fields.push(`nombre_completo = $${idx++}`)
        values.push(nombre_completo)
      }
      if (email !== undefined) {
        fields.push(`email = $${idx++}`)
        values.push(email)
      }
      if (institucion !== undefined) {
        fields.push(`institucion = $${idx++}`)
        values.push(institucion)
      }
      if (rol !== undefined) {
        fields.push(`rol = $${idx++}`)
        values.push(rol)
      }
      if (password !== undefined && password !== "") {
        fields.push(`password = $${idx++}`)
        values.push(password)
      }

      if (fields.length === 0) {
        return NextResponse.json(
          { success: false, message: "No hay campos para actualizar" },
          { status: 400 }
        )
      }

      values.push(id) // último valor es el id

      const query = `
        UPDATE usuarios
        SET ${fields.join(", ")}
        WHERE id = $${idx}
        RETURNING id, nombre_completo, email, institucion, rol, created_at
      `

      const result = await client.query(query, values)

      if (result.rowCount === 0) {
        return NextResponse.json(
          { success: false, message: "Usuario no encontrado" },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        user: result.rows[0],
      })
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error("Error al actualizar usuario:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al actualizar usuario",
        error: error.message,
      },
      { status: 500 }
    )
  }
}