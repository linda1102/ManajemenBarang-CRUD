
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const runtime = "nodejs";


//GET
export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM barang ORDER BY id DESC"
    );

    return NextResponse.json({
      success: true,
      message: "Data barang berhasil diambil",
      data: rows,
    });
  } catch (error) {
    console.error("Gagal mengambil data barang:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data barang",
      },
      { status: 500 }
    );
  }
}

//POST
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { nama, kategori, stok, harga } = body;

    if (
      !nama?.trim() ||
      !kategori?.trim() ||
      stok === undefined ||
      harga === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Semua data barang wajib diisi",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(Number(stok)) ||
      Number(stok) < 0 ||
      !Number.isFinite(Number(harga)) ||
      Number(harga) < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Stok atau harga tidak valid",
        },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      "INSERT INTO barang (nama, kategori, stok, harga) VALUES (?, ?, ?, ?)",
      [nama.trim(), kategori.trim(), Number(stok), Number(harga)]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Barang berhasil ditambahkan",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gagal menambahkan barang:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan barang",
      },
      { status: 500 }
    );
  }
}
