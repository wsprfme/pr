import { useEffect, useState } from "react";
import api, { formatRupiah } from "../api.js";

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    Promise.all([
      api.get("/reports/summary"),
      api.get("/borrowings", { params: { per_page: 100 } }),
    ])
      .then(([r1, r2]) => {
        setSummary(r1.data.data);
        setBorrowings(r2.data.data);
      })
      .catch((err) => setError(err.response?.data?.message || "Gagal memuat"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Memuat...</div>;
  if (error) return <div className="alert">{error}</div>;

  const onBorrow = borrowings.filter((b) => b.status === "borrowed");
  const overdue = onBorrow.filter((b) => b.due_date < today);

  return (
    <div>
      <div className="page-header"><h1>Laporan Perpustakaan</h1></div>

      <div className="stats">
        <div className="stat-card">
          <div className="label">Total Buku</div>
          <div className="value">{summary.total_books}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total User</div>
          <div className="value">{summary.total_users}</div>
        </div>
        <div className="stat-card success">
          <div className="label">Sedang Dipinjam</div>
          <div className="value">{summary.borrowed}</div>
        </div>
        <div className="stat-card danger">
          <div className="label">Terlambat</div>
          <div className="value">{summary.overdue}</div>
        </div>
        <div className="stat-card">
          <div className="label">Sudah Kembali</div>
          <div className="value">{summary.returned}</div>
        </div>
        <div className="stat-card danger">
          <div className="label">Total Denda</div>
          <div className="value" style={{ fontSize: 18 }}>{formatRupiah(summary.total_fine)}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Buku Terlambat ({overdue.length})</h3>
        {overdue.length === 0 ? (
          <div className="empty">Tidak ada peminjaman terlambat</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Peminjam</th>
                  <th>Buku</th>
                  <th>Tgl Pinjam</th>
                  <th>Jatuh Tempo</th>
                </tr>
              </thead>
              <tbody>
                {overdue.map((b, i) => (
                  <tr key={b.id}>
                    <td>{i + 1}</td>
                    <td>{b.user?.name}</td>
                    <td>{b.book?.title}</td>
                    <td>{b.borrow_date}</td>
                    <td>{b.due_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Sedang Dipinjam ({onBorrow.length})</h3>
        {onBorrow.length === 0 ? (
          <div className="empty">Tidak ada buku yang sedang dipinjam</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Peminjam</th>
                  <th>Buku</th>
                  <th>Tgl Pinjam</th>
                  <th>Jatuh Tempo</th>
                </tr>
              </thead>
              <tbody>
                {onBorrow.map((b, i) => (
                  <tr key={b.id}>
                    <td>{i + 1}</td>
                    <td>{b.user?.name}</td>
                    <td>{b.book?.title}</td>
                    <td>{b.borrow_date}</td>
                    <td>{b.due_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
