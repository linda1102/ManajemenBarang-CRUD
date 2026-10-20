"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";

type Barang = {
  id: number;
  nama: string;
  kategori: string;
  stok: number;
  harga: number | string;
};

const formAwal = {
  nama: "",
  kategori: "",
  stok: "",
  harga: "",
};

export default function Home() {
  const [barang, setBarang] = useState<Barang[]>([]);
  const [form, setForm] = useState(formAwal);
  const [editId, setEditId] = useState<number | null>(null);
  const [formBuka, setFormBuka] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pencarian, setPencarian] = useState("");
  const [pesan, setPesan] = useState("");
  const [error, setError] = useState("");

  async function ambilBarang() {
    try {
      setLoading(true);

      const response = await fetch("/api/barang");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data barang.");
      }

      setBarang(result.data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Data barang gagal dimuat.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    ambilBarang();
  }, []);

  function formatRupiah(harga: number | string) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(harga));
  }

  function bukaTambah() {
    setForm(formAwal);
    setEditId(null);
    setFormBuka(true);
    setPesan("");
    setError("");
  }

  function bukaEdit(item: Barang) {
    setForm({
      nama: item.nama,
      kategori: item.kategori,
      stok: String(item.stok),
      harga: String(item.harga),
    });
    setEditId(item.id);
    setFormBuka(true);
    setPesan("");
    setError("");
  }

  async function simpanBarang(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setPesan("");
    setError("");

    try {
      const response = await fetch(
        editId === null ? "/api/barang" : `/api/barang/${editId}`,
        {
          method: editId === null ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama: form.nama.trim(),
            kategori: form.kategori.trim(),
            stok: Number(form.stok),
            harga: Number(form.harga),
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menyimpan barang.");
      }

      setFormBuka(false);
      setForm(formAwal);
      setEditId(null);
      setPesan(result.message || "Data barang berhasil disimpan.");

      await ambilBarang();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  async function hapusBarang(item: Barang) {
    if (!window.confirm(`Hapus barang "${item.nama}"?`)) return;

    setPesan("");
    setError("");

    try {
      const response = await fetch(`/api/barang/${item.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus barang.");
      }

      setPesan(result.message || "Barang berhasil dihapus.");
      await ambilBarang();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  }

  const barangTerfilter = barang.filter((item) => {
    const kata = pencarian.toLowerCase();

    return (
      item.nama.toLowerCase().includes(kata) ||
      item.kategori.toLowerCase().includes(kata)
    );
  });

  const totalStok = barang.reduce(
    (total, item) => total + Number(item.stok),
    0,
  );

  const totalNilai = barang.reduce(
    (total, item) => total + Number(item.stok) * Number(item.harga),
    0,
  );

  const stokMenipis = barang.filter((item) => Number(item.stok) <= 5).length;

  return (
    <main className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">MB</div>
          <div className="brand-text">
            <strong>Manajemen Barang</strong>
            <span>Pengelolaan Stok.</span>
          </div>
        </div>

        <div className="sidebar-label">MENU</div>

        <nav className="sidebar-nav">
          <a href="#ringkasan" className="nav-link">
            <span className="nav-symbol">⌂</span>
            Ringkasan
          </a>
          <a href="#data-barang" className="nav-link active">
            <span className="nav-symbol">▤</span>
            Data Barang
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="database-indicator">
            <span className="indicator-dot" />
            <div>
              <strong>Data Persedian</strong>
              <span>Sistem pencatatan barang</span>
            </div>
          </div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div>
            <div className="breadcrumb">Inventaris / Data Barang</div>
            <h1>Manajemen Barang</h1>
          </div>

          <div className="account-label">
            <Image
              src="/profile.jfif"
              alt="Foto profil administrator"
              width={36}
              height={36}
              className="account-avatar"
            />
            <span>Admin</span>
          </div>
        </header>

        <div className="content">
          <section id="ringkasan" className="summary-section">
            <div className="section-heading">
              <div>
                <h2>Ringkasan</h2>
                <p>Informasi umum persediaan barang saat ini.</p>
              </div>
            </div>

            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Jenis barang</span>
                <strong>{barang.length}</strong>
                <span className="summary-note">Barang terdaftar</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Total stok</span>
                <strong>{totalStok.toLocaleString("id-ID")}</strong>
                <span className="summary-note">Unit barang</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Nilai persediaan</span>
                <strong className="summary-value">
                  {formatRupiah(totalNilai)}
                </strong>
                <span className="summary-note">Perkiraan nilai stok</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Stok menipis</span>
                <strong>{stokMenipis}</strong>
                <span className="summary-note">Stok maksimal 5 unit</span>
              </div>
            </div>
          </section>

          {pesan && (
            <div className="alert alert-success" role="status">
              <span>{pesan}</span>
              <button onClick={() => setPesan("")}>×</button>
            </div>
          )}

          {error && (
            <div className="alert alert-error" role="alert">
              <span>{error}</span>
              <button onClick={ambilBarang}>Coba lagi</button>
            </div>
          )}

          {formBuka && (
            <section className="form-panel">
              <div className="panel-heading">
                <div>
                  <h2>{editId === null ? "Tambah Barang" : "Edit Barang"}</h2>
                  <p>Lengkapi informasi di bawah ini.</p>
                </div>
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => setFormBuka(false)}
                  aria-label="Tutup formulir"
                >
                  ×
                </button>
              </div>

              <form onSubmit={simpanBarang}>
                <div className="form-grid">
                  <label>
                    Nama barang
                    <input
                      required
                      maxLength={150}
                      value={form.nama}
                      onChange={(e) =>
                        setForm({ ...form, nama: e.target.value })
                      }
                      placeholder="Masukkan nama barang"
                    />
                  </label>

                  <label>
                    Kategori
                    <input
                      required
                      maxLength={100}
                      value={form.kategori}
                      onChange={(e) =>
                        setForm({ ...form, kategori: e.target.value })
                      }
                      placeholder="Contoh: Elektronik"
                    />
                  </label>

                  <label>
                    Stok
                    <input
                      required
                      type="number"
                      min="0"
                      step="1"
                      value={form.stok}
                      onChange={(e) =>
                        setForm({ ...form, stok: e.target.value })
                      }
                      placeholder="Jumlah barang"
                    />
                  </label>

                  <label>
                    Harga per unit (Rp)
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.harga}
                      onChange={(e) =>
                        setForm({ ...form, harga: e.target.value })
                      }
                      placeholder="Harga barang"
                    />
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setFormBuka(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="button button-primary"
                    disabled={saving}
                  >
                    {saving
                      ? "Menyimpan..."
                      : editId === null
                        ? "Simpan Barang"
                        : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </section>
          )}

          <section id="data-barang" className="table-panel">
            <div className="panel-heading table-panel-heading">
              <div>
                <h2>Data Barang</h2>
                <p>Daftar barang yang tercatat di sistem inventaris.</p>
              </div>

              <button className="button button-primary" onClick={bukaTambah}>
                + Tambah Barang
              </button>
            </div>

            <div className="table-tools">
              <input
                className="search-input"
                type="search"
                value={pencarian}
                onChange={(e) => setPencarian(e.target.value)}
                placeholder="Cari nama atau kategori barang..."
                aria-label="Cari barang"
              />

              <button
                className="button button-secondary"
                onClick={ambilBarang}
                disabled={loading}
              >
                Muat ulang
              </button>

              <span className="result-count">
                {barangTerfilter.length} data
              </span>
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Nama Barang</th>
                    <th>Kategori</th>
                    <th>Stok</th>
                    <th>Harga Satuan</th>
                    <th>Nilai Stok</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="empty-state">
                        Memuat data...
                      </td>
                    </tr>
                  ) : barangTerfilter.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="empty-state">
                        {pencarian
                          ? "Data yang dicari tidak ditemukan."
                          : "Belum ada barang. Klik Tambah Barang untuk memulai."}
                      </td>
                    </tr>
                  ) : (
                    barangTerfilter.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td className="item-name">{item.nama}</td>
                        <td>{item.kategori}</td>
                        <td>
                          <span
                            className={
                              Number(item.stok) <= 5
                                ? "stock-low"
                                : "stock-normal"
                            }
                          >
                            {item.stok}
                          </span>
                        </td>
                        <td>{formatRupiah(item.harga)}</td>
                        <td>
                          {formatRupiah(Number(item.stok) * Number(item.harga))}
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="text-button edit-action"
                              onClick={() => bukaEdit(item)}
                            >
                              Edit
                            </button>
                            <button
                              className="text-button delete-action"
                              onClick={() => hapusBarang(item)}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-bottom">
              Menampilkan {barangTerfilter.length} dari {barang.length} barang
            </div>
          </section>

          <footer className="footer">Manajemen Barang</footer>
        </div>
      </section>
    </main>
  );
}
