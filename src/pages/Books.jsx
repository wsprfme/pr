import { useEffect, useState } from "react";
import { Link } from "react-router";
import api, { fileUrl, isAdmin } from "../api.js";
import Pagination from "../components/Pagination.jsx";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sort, setSort] = useState("id");
  const [dir, setDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const admin = isAdmin();

  function load() {
    setLoading(true);
    const params = { search, category_id: categoryId, sort, dir, page };
    api.get("/books", { params })
      .then((res) => {
        setBooks(res.data.data);
        setMeta(res.data);
      })
      .catch((err) => setError(err.response?.data?.message || "Gagal memuat"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, categoryId, sort, dir, page]);

  function handleSort(col) {
    if (sort === col) setDir(dir === "asc" ? "desc" : "asc");
    else { setSort(col); setDir("asc"); }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus buku ini?")) return;
    try {
      await api.delete(`/books/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus");
    }
  }

  function arrow(col) {
    if (sort !== col) return "";
    return dir === "asc" ? " ▲" : " ▼";
  }

  return (
    <div>
      <div className="page-header">
        <h1>Manajemen Buku</h1>
        {admin && <Link to="/books/create" className="btn btn-primary">Tambah Buku</Link>}
      </div>

      <div className="toolbar">
        <input
          placeholder="Cari kode, judul, atau penulis..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}>
          <option value="">Semua Kategori</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <div className="loading">Memuat...</div>
      ) : books.length === 0 ? (
        <div className="empty">Tidak ada buku ditemukan</div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cover</th>
                  <th className="sortable" onClick={() => handleSort("code")}>Kode{arrow("code")}</th>
                  <th className="sortable" onClick={() => handleSort("title")}>Judul{arrow("title")}</th>
                  <th className="sortable" onClick={() => handleSort("author")}>Penulis{arrow("author")}</th>
                  <th className="sortable" onClick={() => handleSort("year")}>Tahun{arrow("year")}</th>
                  <th>Kategori</th>
                  <th className="sortable" onClick={() => handleSort("stock")}>Stok{arrow("stock")}</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b, i) => (
                  <tr key={b.id}>
                    <td>{(meta.from || 0) + i}</td>
                    <td>
                      {b.cover
                        ? <img src={fileUrl(b.cover)} alt="" className="cover" />
                        : <div className="cover" />}
                    </td>
                    <td>{b.code}</td>
                    <td>{b.title}</td>
                    <td>{b.author}</td>
                    <td>{b.year}</td>
                    <td>{b.category?.name || "-"}</td>
                    <td>{b.stock}</td>
                    <td>
                      <div className="actions">
                        <Link to={`/books/${b.id}`} className="btn btn-sm">Detail</Link>
                        {admin && <>
                          <Link to={`/books/${b.id}/edit`} className="btn btn-sm">Edit</Link>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b.id)}>Hapus</button>
                        </>}
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
