import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT DATABASE() AS database_name");

    return NextResponse.json({
      success: true,
      message: "Koneksi database berhasil!",
      data: rows,
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Koneksi database gagal. Periksa konfigurasi.",
      },
      { status: 500 },
    );
  }
}
