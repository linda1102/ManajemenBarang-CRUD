"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ChartNoAxesColumnIncreasing,
  TriangleAlert,
  Search,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Monitor,
  Armchair,
  BookOpen,
  PackageCheck,
  CircleDollarSign,
  ClipboardList,
  ChevronRight,
  Filter,
  Warehouse,
  Tag,
  CheckCircle2,
  AlertCircle,
  PackageX,
} from "lucide-react";

import Image from "next/image";

type Barang = {
  id: number;
  nama: string;
  kategori: string;
  stok: number;
  harga: number | string;
};

type FormBarang = {
  nama: string;
  kategori: string;
  stok: string;
  harga: string;
};

type ApiResponse<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type MenuAktif =
  | "dashboard"
  | "data-barang"
  | "analisis-stok"
  | "semua-barang"
  | "stok-menipis";

const formAwal: FormBarang = {
  nama: "",
  kategori: "",
  stok: "",
  harga: "",
};

const warnaGrafik = [
  "#4269a5",
  "#e9b653",
  "#6eaa8b",
  "#8c80c8",
  "#df8c70",
  "#66a6bd",
  "#a6adbb",
  "#d47f9c",
];

export default function Home() {
  const [barang, setBarang] = useState<Barang[]>([]);
  const [form, setForm] = useState<FormBarang>({ ...formAwal });
  const [editId, setEditId] = useState<number | null>(null);
  const [formBuka, setFormBuka] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hapusId, setHapusId] = useState<number | null>(null);
  const [pencarian, setPencarian] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [filterStok, setFilterStok] = useState(false);
  const [menuAktif, setMenuAktif] = useState<MenuAktif>("dashboard");
  const [pesan, setPesan] = useState("");
  const [error, setError] = useState("");

  const ambilBarang = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/barang", {
        method: "GET",
        cache: "no-store",
      });

      const teks = await response.text();
      let result: ApiResponse<Barang[]>;

      try {
        result = JSON.parse(teks);
      } catch {
        throw new Error(
          `Respons API tidak valid (${response.status}). Periksa terminal Next.js.`,
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || `Gagal mengambil data (${response.status}).`,
        );
      }

      if (!Array.isArray(result.data)) {
        throw new Error(
          "Format data barang tidak sesuai. Periksa respons GET /api/barang.",
        );
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
  }, []);

  useEffect(() => {
    void ambilBarang();
  }, [ambilBarang]);

  function formatRupiah(harga: number | string) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(harga) || 0);
  }

  function formatAngka(angka: number) {
    return angka.toLocaleString("id-ID");
  }

  function pilihMenu(menu: MenuAktif) {
    setMenuAktif(menu);

    if (menu === "semua-barang") {
      setFilterKategori("Semua");
      setFilterStok(false);
    }

    if (menu === "stok-menipis") {
      setFilterKategori("Semua");
      setFilterStok(true);
    }

    if (menu === "data-barang") {
      setFilterStok(false);
    }
  }

  function bukaTambah() {
    setForm({ ...formAwal });
    setEditId(null);
    setFormBuka(true);
    setPesan("");
    setError("");

    window.setTimeout(() => {
      document
        .getElementById("form-barang")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
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

    window.setTimeout(() => {
      document
        .getElementById("form-barang")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function tutupForm() {
    if (saving) return;

    setFormBuka(false);
    setForm({ ...formAwal });
    setEditId(null);
    setError("");
  }

  async function simpanBarang(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (saving) return;

    const nama = form.nama.trim();
    const kategori = form.kategori.trim();
    const stok = Number(form.stok);
    const harga = Number(form.harga);

    if (!nama || !kategori || form.stok === "" || form.harga === "") {
      setError("Semua data barang wajib diisi.");
      return;
    }

    if (!Number.isSafeInteger(stok) || stok < 0) {
      setError("Stok harus berupa bilangan bulat minimal 0.");
      return;
    }

    if (!Number.isFinite(harga) || harga < 0) {
      setError("Harga harus berupa angka minimal 0.");
      return;
    }

    setSaving(true);
    setPesan("");
    setError("");

    try {
      const sedangEdit = editId !== null;
      const url = sedangEdit ? `/api/barang/${editId}` : "/api/barang";

      const response = await fetch(url, {
        method: sedangEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nama, kategori, stok, harga }),
      });

      const teks = await response.text();
      let result: ApiResponse;

      try {
        result = JSON.parse(teks);
      } catch {
        throw new Error(
          `Respons API tidak valid (${response.status}). Periksa terminal Next.js.`,
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Gagal ${sedangEdit ? "mengubah" : "menambahkan"} barang (${response.status}).`,
        );
      }

      setPesan(
        result.message ||
          (sedangEdit
            ? "Data barang berhasil diperbarui."
            : "Barang berhasil ditambahkan."),
      );

      setFormBuka(false);
      setForm({ ...formAwal });
      setEditId(null);

      await ambilBarang();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan barang.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function hapusBarang(item: Barang) {
    const yakin = window.confirm(
      `Yakin ingin menghapus barang "${item.nama}"?`,
    );

    if (!yakin || hapusId !== null) return;

    setHapusId(item.id);
    setPesan("");
    setError("");

    try {
      const response = await fetch(`/api/barang/${item.id}`, {
        method: "DELETE",
      });

      const teks = await response.text();
      let result: ApiResponse;

      try {
        result = JSON.parse(teks);
      } catch {
        throw new Error(`Respons API tidak valid (${response.status}).`);
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || `Gagal menghapus barang (${response.status}).`,
        );
      }

      setPesan(result.message || "Barang berhasil dihapus.");
      await ambilBarang();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghapus barang.",
      );
    } finally {
      setHapusId(null);
    }
  }

  const totalStok = barang.reduce(
    (total, item) => total + Number(item.stok || 0),
    0,
  );

  const totalNilai = barang.reduce(
    (total, item) => total + Number(item.stok || 0) * Number(item.harga || 0),
    0,
  );

  const stokMenipis = barang.filter(
    (item) => Number(item.stok) > 0 && Number(item.stok) <= 5,
  ).length;

  const stokHabis = barang.filter((item) => Number(item.stok) === 0).length;

  const kategoriBarang = Array.from(
    new Set(barang.map((item) => item.kategori)),
  );

  const stokPerKategori = kategoriBarang
    .map((kategori) => {
      const jumlah = barang
        .filter((item) => item.kategori === kategori)
        .reduce((total, item) => total + Number(item.stok || 0), 0);

      return {
        kategori,
        jumlah,
        persen: totalStok > 0 ? (jumlah / totalStok) * 100 : 0,
      };
    })
    .sort((a, b) => b.jumlah - a.jumlah);

  const barangTerfilter = barang.filter((item) => {
    const kata = pencarian.toLowerCase();

    const cocokPencarian =
      item.nama.toLowerCase().includes(kata) ||
      item.kategori.toLowerCase().includes(kata);

    const cocokKategori =
      filterKategori === "Semua" || item.kategori === filterKategori;

    const stok = Number(item.stok);
    const cocokStok = !filterStok || stok <= 5;

    return cocokPencarian && cocokKategori && cocokStok;
  });

  function ikonKategori(kategori: string) {
    const teks = kategori.toLowerCase();

    if (
      teks.includes("elektronik") ||
      teks.includes("komputer") ||
      teks.includes("laptop")
    ) {
      return Monitor;
    }

    if (
      teks.includes("buku") ||
      teks.includes("atk") ||
      teks.includes("alat tulis")
    ) {
      return BookOpen;
    }

    if (
      teks.includes("mebel") ||
      teks.includes("furnitur") ||
      teks.includes("perabot")
    ) {
      return Armchair;
    }

    return Package;
  }

  function statusStok(stok: number) {
    if (stok === 0) {
      return {
        teks: "Habis",
        kelas: "status-habis",
        ikon: PackageX,
      };
    }

    if (stok <= 5) {
      return {
        teks: "Menipis",
        kelas: "status-menipis",
        ikon: AlertCircle,
      };
    }

    return {
      teks: "Tersedia",
      kelas: "status-aman",
      ikon: CheckCircle2,
    };
  }

  return (
    <main className="dashboard-layout">
      <aside className="sidebar">
        <a
          href="#dashboard"
          className="brand"
          onClick={() => pilihMenu("dashboard")}
        >
          <div className="brand-logo">
            <Warehouse size={22} strokeWidth={2.2} />
          </div>
          <div className="brand-text">
            <strong>Stockwise</strong>
            <span>Inventory Management</span>
          </div>
        </a>

        <div className="sidebar-label">MENU UTAMA</div>

        <nav className="sidebar-nav">
          <a
            href="#dashboard"
            className={`nav-link ${menuAktif === "dashboard" ? "active" : ""}`}
            onClick={() => pilihMenu("dashboard")}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </a>

          <a
            href="#data-barang"
            className={`nav-link ${menuAktif === "data-barang" ? "active" : ""}`}
            onClick={() => pilihMenu("data-barang")}
          >
            <Package size={18} />
            <span>Data Barang</span>
            <span className="nav-count">{barang.length}</span>
          </a>

          <a
            href="#analisis-stok"
            className={`nav-link ${menuAktif === "analisis-stok" ? "active" : ""}`}
            onClick={() => pilihMenu("analisis-stok")}
          >
            <ChartNoAxesColumnIncreasing size={18} />
            <span>Analisis Stok</span>
          </a>
        </nav>

        <div className="sidebar-label sidebar-label-second">PERSEDIAAN</div>

        <nav className="sidebar-nav">
          <a
            href="#data-barang"
            className={`nav-link ${menuAktif === "semua-barang" ? "active" : ""}`}
            onClick={() => pilihMenu("semua-barang")}
          >
            <ClipboardList size={18} />
            <span>Semua Barang</span>
          </a>

          <a
            href="#data-barang"
            className={`nav-link ${menuAktif === "stok-menipis" ? "active" : ""}`}
            onClick={() => pilihMenu("stok-menipis")}
          >
            <TriangleAlert size={18} />
            <span>Stok Menipis</span>
            <span className="nav-count warning-count">
              {stokMenipis + stokHabis}
            </span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-bottom-icon">
            <PackageCheck size={19} />
          </div>
          <div className="sidebar-bottom-text">
            <strong>Sistem Inventaris</strong>
            <span>Kelola stok lebih mudah</span>
          </div>
          <span className="online-dot" />
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="mobile-brand">
            <div className="brand-logo">
              <Warehouse size={20} />
            </div>
            <strong>Stockwise</strong>
          </div>

          <div className="topbar-heading">
            <span className="breadcrumb">Halaman / Dashboard</span>
            <h1>Dashboard</h1>
          </div>

          <div className="topbar-actions">
            <label className="global-search">
              <Search size={17} />
              <input
                type="search"
                placeholder="Cari barang..."
                value={pencarian}
                onChange={(e) => setPencarian(e.target.value)}
              />
            </label>

            <button
              type="button"
              className="topbar-icon"
              onClick={() => void ambilBarang()}
              disabled={loading}
              aria-label="Muat ulang data"
              title="Muat ulang data"
            >
              <RefreshCw size={18} className={loading ? "spin-icon" : ""} />
            </button>

            <div className="account-label">
              <div className="account-avatar">
                <Image
                  src="/images/profile.jfif"
                  alt="Foto profil administrator"
                  width={40}
                  height={40}
                  className="profile-image"
                  unoptimized
                />
              </div>

              <div className="account-info">
                <strong>Administrator</strong>
                <span>Pengelola inventaris</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content" id="dashboard">
          <div className="welcome-row">
            <div>
              <h2>Ringkasan Inventaris</h2>
              <p>Pantau kondisi dan ketersediaan barang dalam satu halaman.</p>
            </div>

            <button
              type="button"
              className="button button-primary"
              onClick={bukaTambah}
            >
              <Plus size={17} />
              Tambah Barang
            </button>
          </div>

          {pesan && (
            <div className="alert alert-success" role="status">
              <CheckCircle2 size={18} />
              <span>{pesan}</span>
              <button
                type="button"
                onClick={() => setPesan("")}
                aria-label="Tutup pesan"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {error && (
            <div className="alert alert-error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button type="button" onClick={() => void ambilBarang()}>
                Coba lagi
              </button>
            </div>
          )}

          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon icon-blue">
                  <Package size={20} />
                </span>
                <span className="stat-caption">Jenis barang</span>
              </div>
              <strong className="stat-number">
                {formatAngka(barang.length)}
              </strong>
              <div className="stat-bottom">
                <span className="stat-description">Total barang terdaftar</span>
                <span className="stat-mini-icon blue-mini">
                  <Boxes size={15} />
                </span>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon icon-yellow">
                  <Boxes size={20} />
                </span>
                <span className="stat-caption">Total stok</span>
              </div>
              <strong className="stat-number">{formatAngka(totalStok)}</strong>
              <div className="stat-bottom">
                <span className="stat-description">Unit tersedia</span>
                <span className="stat-mini-icon yellow-mini">
                  <PackageCheck size={15} />
                </span>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon icon-green">
                  <CircleDollarSign size={20} />
                </span>
                <span className="stat-caption">Nilai persediaan</span>
              </div>
              <strong className="stat-number stat-currency">
                {formatRupiah(totalNilai)}
              </strong>
              <div className="stat-bottom">
                <span className="stat-description">Perkiraan nilai stok</span>
                <span className="stat-mini-icon green-mini">
                  <ChartNoAxesColumnIncreasing size={15} />
                </span>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon icon-red">
                  <TriangleAlert size={20} />
                </span>
                <span className="stat-caption">Perlu diperiksa</span>
              </div>
              <strong className="stat-number">
                {formatAngka(stokMenipis + stokHabis)}
              </strong>
              <div className="stat-bottom">
                <span className="stat-description">
                  {stokHabis} habis · {stokMenipis} menipis
                </span>
                <span className="stat-mini-icon red-mini">
                  <AlertCircle size={15} />
                </span>
              </div>
            </article>
          </section>

          {formBuka && (
            <section className="form-panel" id="form-barang">
              <div className="panel-heading">
                <div className="panel-title-icon">
                  <span className="stat-icon icon-blue">
                    {editId === null ? (
                      <Package size={20} />
                    ) : (
                      <Pencil size={19} />
                    )}
                  </span>
                  <div>
                    <h2>{editId === null ? "Tambah Barang" : "Edit Barang"}</h2>
                    <p>
                      {editId === null
                        ? "Isi informasi barang yang ingin ditambahkan."
                        : `Ubah informasi barang ID #${editId}.`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="icon-button"
                  onClick={tutupForm}
                  disabled={saving}
                  aria-label="Tutup formulir"
                >
                  <X size={19} />
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
                      placeholder="Contoh: Laptop Lenovo"
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
                    Jumlah stok
                    <input
                      required
                      type="number"
                      min="0"
                      step="1"
                      value={form.stok}
                      onChange={(e) =>
                        setForm({ ...form, stok: e.target.value })
                      }
                      placeholder="Masukkan jumlah stok"
                    />
                  </label>

                  <label>
                    Harga per unit (Rp)
                    <input
                      required
                      type="number"
                      min="0"
                      step="any"
                      value={form.harga}
                      onChange={(e) =>
                        setForm({ ...form, harga: e.target.value })
                      }
                      placeholder="Masukkan harga"
                    />
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={tutupForm}
                    disabled={saving}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="button button-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <RefreshCw size={16} className="spin-icon" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        {editId === null ? "Simpan Barang" : "Simpan Perubahan"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="analytics-grid" id="analisis-stok">
            <article className="dashboard-panel category-panel">
              <div className="panel-heading">
                <div>
                  <h2>Komposisi Stok</h2>
                  <p>Persentase unit berdasarkan kategori.</p>
                </div>
                <span className="panel-icon">
                  <ChartNoAxesColumnIncreasing size={19} />
                </span>
              </div>

              {loading ? (
                <div className="chart-empty">Memuat data stok...</div>
              ) : stokPerKategori.length === 0 ? (
                <div className="chart-empty">
                  <Package size={30} />
                  <strong>Belum ada data stok</strong>
                  <span>Tambahkan barang untuk melihat grafik.</span>
                </div>
              ) : totalStok === 0 ? (
                <div className="chart-empty">
                  <Boxes size={30} />
                  <strong>Stok masih kosong</strong>
                  <span>Grafik akan muncul saat stok tersedia.</span>
                </div>
              ) : (
                <div className="category-chart">
                  <div className="chart-summary">
                    <div>
                      <span>Total unit barang</span>
                      <strong>{formatAngka(totalStok)}</strong>
                    </div>
                    <span className="chart-summary-tag">
                      {kategoriBarang.length} kategori
                    </span>
                  </div>

                  <div className="category-bars">
                    {stokPerKategori.map((item, index) => (
                      <div className="category-bar-item" key={item.kategori}>
                        <div className="category-bar-heading">
                          <div className="category-bar-name">
                            <span
                              className="legend-dot"
                              style={{
                                backgroundColor:
                                  warnaGrafik[index % warnaGrafik.length],
                              }}
                            />
                            <span title={item.kategori}>{item.kategori}</span>
                          </div>
                          <strong>{Math.round(item.persen)}%</strong>
                        </div>

                        <div
                          className="progress-track"
                          role="progressbar"
                          aria-label={`Persentase stok kategori ${item.kategori}`}
                          aria-valuenow={Math.round(item.persen)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className="progress-fill"
                            style={{
                              width: `${item.persen}%`,
                              backgroundColor:
                                warnaGrafik[index % warnaGrafik.length],
                            }}
                          />
                        </div>

                        <span className="category-unit">
                          {formatAngka(item.jumlah)} unit
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>

            <article className="dashboard-panel stock-panel">
              <div className="panel-heading">
                <div>
                  <h2>Kondisi Persediaan</h2>
                  <p>Status stok seluruh barang.</p>
                </div>
                <span className="panel-icon">
                  <ClipboardList size={19} />
                </span>
              </div>

              <div className="stock-condition-list">
                <div className="condition-item">
                  <span className="condition-icon condition-green">
                    <CheckCircle2 size={20} />
                  </span>
                  <div className="condition-info">
                    <strong>Stok aman</strong>
                    <span>Lebih dari 5 unit</span>
                  </div>
                  <strong className="condition-number">
                    {barang.filter((item) => Number(item.stok) > 5).length}
                  </strong>
                </div>

                <div className="condition-item">
                  <span className="condition-icon condition-yellow">
                    <TriangleAlert size={20} />
                  </span>
                  <div className="condition-info">
                    <strong>Stok menipis</strong>
                    <span>1 sampai 5 unit</span>
                  </div>
                  <strong className="condition-number">{stokMenipis}</strong>
                </div>

                <div className="condition-item">
                  <span className="condition-icon condition-red">
                    <PackageX size={20} />
                  </span>
                  <div className="condition-info">
                    <strong>Stok habis</strong>
                    <span>Tidak ada unit tersedia</span>
                  </div>
                  <strong className="condition-number">{stokHabis}</strong>
                </div>
              </div>

              <div className="stock-panel-footer">
                <PackageCheck size={17} />
                <span>
                  Total {barang.length} jenis barang tercatat dalam sistem.
                </span>
              </div>
            </article>
          </section>

          <section className="dashboard-panel inventory-panel" id="data-barang">
            <div className="panel-heading inventory-heading">
              <div>
                <h2>Daftar Barang</h2>
                <p>Lihat dan kelola semua barang yang tersimpan.</p>
              </div>

              <button
                type="button"
                className="button button-primary"
                onClick={bukaTambah}
              >
                <Plus size={17} />
                Tambah Barang
              </button>
            </div>

            <div className="inventory-toolbar">
              <label className="table-search">
                <Search size={17} />
                <input
                  type="search"
                  value={pencarian}
                  onChange={(e) => setPencarian(e.target.value)}
                  placeholder="Cari nama atau kategori..."
                  aria-label="Cari barang"
                />
              </label>

              <label className="filter-select">
                <Filter size={16} />
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  aria-label="Filter kategori"
                >
                  <option value="Semua">Semua kategori</option>
                  {kategoriBarang.map((kategori) => (
                    <option key={kategori} value={kategori}>
                      {kategori}
                    </option>
                  ))}
                </select>
              </label>

              {filterStok && (
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => {
                    setFilterStok(false);
                    if (menuAktif === "stok-menipis") {
                      setMenuAktif("semua-barang");
                    }
                  }}
                >
                  Tampilkan semua
                  <X size={15} />
                </button>
              )}

              <button
                type="button"
                className="button button-secondary refresh-button"
                onClick={() => void ambilBarang()}
                disabled={loading}
              >
                <RefreshCw size={15} className={loading ? "spin-icon" : ""} />
                Muat ulang
              </button>
            </div>

            {filterStok && (
              <p className="inventory-count">
                Filter aktif: stok menipis dan habis.
              </p>
            )}

            <div className="inventory-count">
              Menampilkan <strong>{barangTerfilter.length}</strong> dari{" "}
              <strong>{barang.length}</strong> barang
            </div>

            <div className="table-scroll">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>BARANG</th>
                    <th>KATEGORI</th>
                    <th>STOK</th>
                    <th>PERSENTASE</th>
                    <th>HARGA SATUAN</th>
                    <th>NILAI STOK</th>
                    <th>STATUS</th>
                    <th>AKSI</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="empty-state">
                        <RefreshCw size={20} className="spin-icon" />
                        <span>Memuat data barang...</span>
                      </td>
                    </tr>
                  ) : barangTerfilter.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="empty-state">
                        <Package size={30} />
                        <strong>
                          {pencarian || filterKategori !== "Semua" || filterStok
                            ? "Barang tidak ditemukan"
                            : "Belum ada barang"}
                        </strong>
                        <span>
                          {pencarian || filterKategori !== "Semua" || filterStok
                            ? "Coba ubah kata pencarian atau filter."
                            : "Tambahkan barang untuk mulai mengisi inventaris."}
                        </span>
                      </td>
                    </tr>
                  ) : (
                    barangTerfilter.map((item) => {
                      const IconKategori = ikonKategori(item.kategori);
                      const status = statusStok(Number(item.stok));
                      const IconStatus = status.ikon;
                      const persen =
                        totalStok > 0
                          ? (Number(item.stok) / totalStok) * 100
                          : 0;

                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="product-cell">
                              <div className="product-icon">
                                <IconKategori size={19} />
                              </div>
                              <div className="product-details">
                                <strong>{item.nama}</strong>
                                <span>ID barang #{item.id}</span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="category-chip">
                              <Tag size={12} />
                              {item.kategori}
                            </span>
                          </td>

                          <td>
                            <strong className="stock-quantity">
                              {formatAngka(Number(item.stok))}
                            </strong>
                            <span className="stock-unit"> unit</span>
                          </td>

                          <td>
                            <div className="table-progress">
                              <span>{persen.toFixed(1)}%</span>
                              <div className="mini-progress-track">
                                <div
                                  className="mini-progress-fill"
                                  style={{
                                    width: `${persen}%`,
                                    backgroundColor:
                                      Number(item.stok) === 0
                                        ? "#d3d9e3"
                                        : "#527bb5",
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          <td>{formatRupiah(item.harga)}</td>

                          <td className="value-cell">
                            {formatRupiah(
                              Number(item.stok) * Number(item.harga),
                            )}
                          </td>

                          <td>
                            <span className={`status-chip ${status.kelas}`}>
                              <IconStatus size={13} />
                              {status.teks}
                            </span>
                          </td>

                          <td>
                            <div className="row-actions">
                              <button
                                type="button"
                                className="action-button edit-action"
                                onClick={() => bukaEdit(item)}
                                disabled={saving || hapusId !== null}
                                aria-label={`Edit ${item.nama}`}
                                title="Edit barang"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                className="action-button delete-action"
                                onClick={() => void hapusBarang(item)}
                                disabled={hapusId !== null || saving}
                                aria-label={`Hapus ${item.nama}`}
                                title="Hapus barang"
                              >
                                {hapusId === item.id ? (
                                  <RefreshCw size={16} className="spin-icon" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>
                <Boxes size={15} />
                Data persediaan barang
              </span>
              <a href="#dashboard">
                Kembali ke atas <ChevronRight size={15} />
              </a>
            </div>
          </section>

          <footer className="footer">
            <span>Stockwise</span>
            <span>Sistem Manajemen Persediaan</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
