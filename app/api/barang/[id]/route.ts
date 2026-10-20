
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PUT(
  request: Request,
  { params }: Context
) {
  try {
    const { id } = await params;
    const barangId = Number(id);

    if (!Number.isInteger(barangId) || barangId < 1) {
      return NextResponse.json(
        { success: false, message: "ID barang tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nama, kategori, stok, harga } = body;

    if (
      typeof nama !== "string" ||
      !nama.trim() ||
      typeof kategori !== "string" ||
      !kategori.trim() ||
      stok === undefined ||
      harga === undefined
    ) {
      return NextResponse.json(
        { success: false, message: "Semua data wajib diisi" },
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
        { success: false, message: "Stok atau harga tidak valid" },
        { status: 400 }
      );
    }

    const [result]: any = await pool.execute(
      `UPDATE barang
       SET nama = ?, kategori = ?, stok = ?, harga = ?
       WHERE id = ?`,
      [
        nama.trim(),
        kategori.trim(),
        Number(stok),
        Number(harga),
        barangId,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Barang tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Barang berhasil diperbarui",
    });
  } catch (error) {
    console.error("Gagal mengedit barang:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengedit barang" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: Context
) {
  try {
    const { id } = await params;
    const barangId = Number(id);

    if (!Number.isInteger(barangId) || barangId < 1) {
      return NextResponse.json(
        { success: false, message: "ID barang tidak valid" },
        { status: 400 }
      );
    }

    const [result]: any = await pool.execute(
      "DELETE FROM barang WHERE id = ?",
      [barangId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Barang tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Barang berhasil dihapus",
    });
  } catch (error) {
    console.error("Gagal menghapus barang:", error);

    return NextResponse.json(
      { success: false, message: "Gagal menghapus barang" },
      { status: 500 }
    );
  }
}
