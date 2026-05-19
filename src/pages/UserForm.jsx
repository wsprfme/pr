import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../api.js";

export default function UserForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/users/${id}`)
        .then((res) => setForm({ ...res.data.data, password: "" }))
        .catch(() => setError("Gagal memuat data user"));
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
    try {
      if (isEdit) await api.put(`/users/${id}`, form);
      else await api.post("/users", form);
      navigate("/users");
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {});
      else setError(err.response?.data?.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header"><h1>{isEdit ? "Edit User" : "Tambah User"}</h1></div>

      {error && <div className="alert">{error}</div>}

      <form className="card" onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
        <div className="form-group">
          <label>Nama</label>
          <input value={form.name} onChange={(e) => update("name", e.target.value)} required />
          {errors.name && <div className="error">{errors.name[0]}</div>}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
          {errors.email && <div className="error">{errors.email[0]}</div>}
        </div>

        <div className="form-group">
          <label>Role</label>
          <select value={form.role} onChange={(e) => update("role", e.target.value)}>
            <option value="member">Member</option>
            <option value="petugas">Petugas</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && <div className="error">{errors.role[0]}</div>}
        </div>

        <div className="form-group">
          <label>Password {isEdit && <small>(kosongkan jika tidak diganti)</small>}</label>
          <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} />
          {errors.password && <div className="error">{errors.password[0]}</div>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
          <button type="button" className="btn" onClick={() => navigate("/users")}>Batal</button>
        </div>
      </form>
    </div>
  );
}
