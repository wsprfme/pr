import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import api, { fileUrl } from "../api.js";

export default function BookForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    author: "",
    year: new Date().getFullYear(),
    category_id: "",
    stock: 1,
  });
  const [cover, setCover] = useState(null);
  const [coverUrl, setCoverUrl] = useState("");
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/categories").then((res) => {
      setCategories(res.data.data);
      if (!isEdit && res.data.data.length > 0) {
        setForm((f) => ({ ...f, category_id: res.data.data[0].id }));
      }
    });

    if (isEdit) {
      api.get(`/books/${id}`)
        .then((res) => {
          setForm(res.data.data);
          setCoverUrl(res.data.data.cover ? fileUrl(res.data.data.cover) : "");
        })
        .catch(() => setError("Gagal memuat data buku"));
    }
  }, [id]);

  function update(field, val) {
    setForm({ ...form, [field]: val });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setError("");
    setSaving(true);

    const data = new FormData();
    data.append("title", form.title);
    data.append("author", form.author);
    data.append("year", form.year);
    data.append("category_id", form.category_id);
    data.append("stock", form.stock);
    if (cover) data.append("cover", cover);

    try {
      if (isEdit) {
        data.append("_method", "PUT");
        await api.post(`/books/${id}`, data);
      } else {
        await api.post("/books", data);
      }
      navigate("/books");
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {});
      else setError(err.response?.data?.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header"><h1>{isEdit ? "Edit Buku" : "Tambah Buku"}</h1></div>

      {error && <div className="alert">{error}</div>}

      <form className="card" onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
        {isEdit && form.code && (
          <div className="form-group">
            <label>Kode Buku</label>
            <input value={form.code} disabled />
          </div>
        )}

        <div className="form-group">
          <label>Judul</label>
          <input value={form.title} onChange={(e) => update("title", e.target.value)} required />
          {errors.title && <div className="error">{errors.title[0]}</div>}
        </div>

        <div className="form-group">
          <label>Penulis</label>
          <input value={form.author} onChange={(e) => update("author", e.target.value)} required />
          {errors.author && <div className="error">{errors.author[0]}</div>}
        </div>

        <div className="form-group">
          <label>Tahun Terbit</label>
          <input type="number" value={form.year} onChange={(e) => update("year", e.target.value)} required />
          {errors.year && <div className="error">{errors.year[0]}</div>}
        </div>

        <div className="form-group">
          <label>Kategori</label>
          <select value={form.category_id} onChange={(e) => update("category_id", e.target.value)} required>
            <option value="">-- Pilih Kategori --</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.category_id && <div className="error">{errors.category_id[0]}</div>}
        </div>

        <div className="form-group">
          <label>Stok</label>
          <input type="number" min="0" value={form.stock} onChange={(e) => update("stock", e.target.value)} required />
          {errors.stock && <div className="error">{errors.stock[0]}</div>}
        </div>

        <div className="form-group">
          <label>Cover Buku (gambar)</label>
          <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files[0])} />
          {coverUrl && !cover && (
            <div style={{ marginTop: 8 }}>
              <img src={coverUrl} alt="" className="cover cover-lg" />
            </div>
          )}
          {errors.cover && <div className="error">{errors.cover[0]}</div>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
          <button type="button" className="btn" onClick={() => navigate("/books")}>Batal</button>
        </div>
      </form>
    </div>
  );
}
