import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import api, { fileUrl } from "../api.js";

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/books/${id}`)
      .then((res) => setBook(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Gagal memuat"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Memuat...</div>;
  if (error) return <div className="alert">{error}</div>;
  if (!book) return null;

  return (
    <div>
      <div className="page-header">
        <h1>Detail Buku</h1>
        <Link to="/books" className="btn">Kembali</Link>
      </div>

      <div className="card" style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {book.cover
          ? <img src={fileUrl(book.cover)} alt="" className="cover cover-lg" />
          : <div className="cover cover-lg" />}
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2>{book.title}</h2>
          <p style={{ color: "#666", marginBottom: 12 }}>oleh {book.author}</p>
          <p><b>Kode:</b> {book.code}</p>
          <p><b>Tahun:</b> {book.year}</p>
          <p><b>Kategori:</b> {book.category?.name || "-"}</p>
          <p><b>Stok:</b> {book.stock}</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Riwayat Peminjaman</h3>
        {book.borrowings?.length === 0 ? (
          <div className="empty">Belum pernah dipinjam</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Peminjam</th>
                  <th>Tgl Pinjam</th>
                  <th>Tgl Kembali</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {book.borrowings.map((b, i) => (
                  <tr key={b.id}>
                    <td>{i + 1}</td>
                    <td>{b.user?.name}</td>
                    <td>{b.borrow_date}</td>
                    <td>{b.return_date || "-"}</td>
                    <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
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
