import { useEffect, useState } from "react";
import api, { formatRupiah, isAdmin, isStaff, isMember } from "../api.js";
import Pagination from "../components/Pagination.jsx";

export default function Borrowings() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    user_id: "",
    book_id: "",
    borrow_date: new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const admin = isAdmin();
  const staff = isStaff();
  const member = isMember();

  function load() {
    setLoading(true);
    api.get("/borrowings", { params: { search, status, page } })
      .then((res) => {
        setItems(res.data.data);
        setMeta(res.data);
      })
      .catch((err) => setError(err.response?.data?.message || "Gagal memuat"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (admin) api.get("/users", { params: { per_page: 100 } }).then((r) => setUsers(r.data.data));
    api.get("/books", { params: { per_page: 100 } }).then((r) => setBooks(r.data.data));
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, status, page]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { book_id: form.book_id, borrow_date: form.borrow_date };
      if (staff) payload.user_id = form.user_id;
      await api.post("/borrowings", payload);
      setShowForm(false);
      setForm({ user_id: "", book_id: "", borrow_date: today });
      load();
      api.get("/books", { params: { per_page: 100 } }).then((r) => setBooks(r.data.data));
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menambah peminjaman");
    } finally {
      setSaving(false);
    }
  }

  async function handleReturn(id) {
    if (!confirm("Tandai buku ini sudah dikembalikan?")) return;
    try {
      await api.put(`/borrowings/${id}`, { status: "returned" });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus data peminjaman ini?")) return;
    try {
      await api.delete(`/borrowings/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal");
    }
  }

  function isOverdue(b) {
    return b.status === "borrowed" && b.due_date < today;
  }

  return (
    <div>
      <div className="page-header">
        <h1>{member ? "Pinjaman Saya" : "Peminjaman Buku"}</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
        </button>
      </div>

      {error && <div className="alert">{error}</div>}

      {showForm && (
        <form className="card" onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
          {staff && (
            <div className="form-group">
              <label>Peminjam</label>
              <select value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} required>
                <option value="">-- Pilih User --</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
          )}
          <div className="form-group">
            <label>Buku</label>
            <select value={form.book_id} onChange={(e) => setForm({ ...form, book_id: e.target.value })} required>
              <option value="">-- Pilih Buku --</option>
              {books.map((b) => (
                <option key={b.id} value={b.id} disabled={b.stock < 1}>
                  {b.code} - {b.title} (stok: {b.stock})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Tanggal Pinjam</label>
            <input type="date" value={form.borrow_date} onChange={(e) => setForm({ ...form, borrow_date: e.target.value })} required />
            <small style={{ color: "#888" }}>Jatuh tempo otomatis: 7 hari setelah tanggal pinjam</small>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
            <button type="button" className="btn" onClick={() => setShowForm(false)}>Batal</button>
          </div>
        </form>
      )}

      <div className="toolbar">
        <input
          placeholder={member ? "Cari judul buku..." : "Cari nama peminjam atau judul buku..."}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Semua Status</option>
          <option value="borrowed">Dipinjam</option>
          <option value="returned">Dikembalikan</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Memuat...</div>
      ) : items.length === 0 ? (
        <div className="empty">Belum ada peminjaman</div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  {!member && <th>Peminjam</th>}
                  <th>Buku</th>
                  <th>Tgl Pinjam</th>
                  <th>Jatuh Tempo</th>
                  <th>Tgl Kembali</th>
                  <th>Status</th>
                  <th>Denda</th>
                  {staff && <th>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((b, i) => (
                  <tr key={b.id}>
                    <td>{(meta.from || 0) + i}</td>
                    {!member && <td>{b.user?.name}</td>}
                    <td>{b.book?.title}</td>
                    <td>{b.borrow_date}</td>
                    <td>{b.due_date}</td>
                    <td>{b.return_date || "-"}</td>
                    <td>
                      {isOverdue(b) ? (
                        <span className="badge badge-overdue">Terlambat</span>
                      ) : (
                        <span className={`badge badge-${b.status}`}>
                          {b.status === "borrowed" ? "Dipinjam" : "Dikembalikan"}
                        </span>
                      )}
                    </td>
                    <td>{b.fine > 0 ? formatRupiah(b.fine) : "-"}</td>
                    {staff && (
                      <td>
                        <div className="actions">
                          {b.status === "borrowed" && (
                            <button className="btn btn-sm btn-success" onClick={() => handleReturn(b.id)}>
                              Kembalikan
                            </button>
                          )}
                          {admin && (
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b.id)}>
                              Hapus
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={meta} onChange={setPage} />
        </>
      )}
    </div>
  );
}
