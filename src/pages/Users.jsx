import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../api.js";
import Pagination from "../components/Pagination.jsx";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api.get("/users", { params: { search, page } })
      .then((res) => {
        setUsers(res.data.data);
        setMeta(res.data);
      })
      .catch((err) => setError(err.response?.data?.message || "Gagal memuat"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, page]);

  async function handleDelete(id) {
    if (!confirm("Hapus user ini?")) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus");
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Manajemen Users</h1>
        <Link to="/users/create" className="btn btn-primary">Tambah User</Link>
      </div>

      <div className="toolbar">
        <input
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <div className="loading">Memuat...</div>
      ) : users.length === 0 ? (
        <div className="empty">Belum ada user</div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id}>
                    <td>{(meta.from || 0) + i}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                    <td>
                      <div className="actions">
                        <Link to={`/users/${u.id}/edit`} className="btn btn-sm">Edit</Link>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>Hapus</button>
                      </div>
                    </td>
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
