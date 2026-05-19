import { useEffect, useState } from "react";
import { Link } from "react-router";
import api, { formatRupiah, getUser } from "../api.js";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const role = user?.role;
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const url = role === "member" ? "/dashboard/me" : "/reports/summary";
    api.get(url)
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Memuat...</div>;
  if (!data) return null;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <span className={`badge badge-${role}`}>{role}</span>
      </div>

      {role === "admin" && (
        <div className="stats">
          <div className="stat-card">
            <div className="label">Total Users</div>
            <div className="value">{data.total_users}</div>
          </div>
          <div className="stat-card">
            <div className="label">Total Buku</div>
            <div className="value">{data.total_books}</div>
          </div>
          <div className="stat-card">
            <div className="label">Total Kategori</div>
            <div className="value">{data.total_categories}</div>
          </div>
          <div className="stat-card">
            <div className="label">Sedang Dipinjam</div>
            <div className="value">{data.borrowed}</div>
          </div>
          <div className="stat-card">
            <div className="label">Terlambat</div>
            <div className="value">{data.overdue}</div>
          </div>
          <div className="stat-card">
            <div className="label">Total Denda</div>
            <div className="value" style={{ fontSize: 18 }}>{formatRupiah(data.total_fine)}</div>
          </div>
        </div>
      )}

      {role === "petugas" && (
        <div className="stats">
          <div className="stat-card">
            <div className="label">Sedang Dipinjam</div>
            <div className="value">{data.borrowed}</div>
          </div>
          <div className="stat-card">
            <div className="label">Terlambat</div>
            <div className="value">{data.overdue}</div>
          </div>
          <div className="stat-card">
            <div className="label">Sudah Dikembalikan</div>
            <div className="value">{data.returned}</div>
          </div>
          <div className="stat-card">
            <div className="label">Total Buku</div>
            <div className="value">{data.total_books}</div>
          </div>
        </div>
      )}

      {role === "member" && (
        <>
          <div className="stats">
            <div className="stat-card">
              <div className="label">Sedang Dipinjam</div>
              <div className="value">{data.total_borrowed}</div>
            </div>
            <div className="stat-card">
              <div className="label">Terlambat</div>
              <div className="value">{data.total_overdue}</div>
            </div>
            <div className="stat-card">
              <div className="label">Total Riwayat</div>
              <div className="value">{data.total_history}</div>
            </div>
            <div className="stat-card">
              <div className="label">Total Denda</div>
              <div className="value" style={{ fontSize: 18 }}>{formatRupiah(data.total_fine)}</div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <h3>Buku Yang Sedang Saya Pinjam</h3>
            </div>

            {data.borrowed.length === 0 ? (
              <div className="empty">Tidak ada buku yang sedang Anda pinjam</div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Judul Buku</th>
                      <th>Tgl Pinjam</th>
                      <th>Jatuh Tempo</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.borrowed.map((b, i) => (
                      <tr key={b.id}>
                        <td>{i + 1}</td>
                        <td>{b.book?.title}</td>
                        <td>{b.borrow_date}</td>
                        <td>{b.due_date}</td>
                        <td>
                          {b.due_date < today
                            ? <span className="badge badge-overdue">Terlambat</span>
                            : <span className="badge badge-borrowed">Dipinjam</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
