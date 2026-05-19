import { useEffect, useState } from "react";
import api, { isAdmin } from "../api.js";

export default function Categories() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const admin = isAdmin();

  function load() {
    setLoading(true);
    api.get("/categories")
      .then((res) => setItems(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Gagal memuat"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.post("/categories", { name });
      setName("");
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal");
    }
  }

  async function handleUpdate(id) {
    try {
      await api.put(`/categories/${id}`, { name: editName });
      setEditId(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus kategori ini?")) return;
    try {
      await api.delete(`/categories/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus");
    }
  }

  return (
    <div>
      <div className="page-header"><h1>Kategori Buku</h1></div>

      {error && <div className="alert">{error}</div>}

      {admin && (
        <form className="card" onSubmit={handleAdd} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Nama Kategori</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Misal: Novel" />
          </div>
          <button type="submit" className="btn btn-primary">Tambah</button>
        </form>
      )}

      {loading ? (
        <div className="loading">Memuat...</div>
      ) : items.length === 0 ? (
        <div className="empty">Belum ada kategori</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nama</th>
                {admin && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((c, i) => (
                <tr key={c.id}>
                  <td>{i + 1}</td>
                  <td>
                    {editId === c.id ? (
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    ) : c.name}
                  </td>
                  {admin && (
                    <td>
                      <div className="actions">
                        {editId === c.id ? (
                          <>
                            <button className="btn btn-sm btn-success" onClick={() => handleUpdate(c.id)}>Simpan</button>
                            <button className="btn btn-sm" onClick={() => setEditId(null)}>Batal</button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-sm" onClick={() => { setEditId(c.id); setEditName(c.name); }}>Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Hapus</button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
