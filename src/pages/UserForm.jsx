import { useEffect, useRef, useState } from "react";
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
  const [createdMember, setCreatedMember] = useState(null);

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
      if (isEdit) {
        await api.put(`/users/${id}`, form);
        navigate("/users");
      } else {
        const res = await api.post("/users", form);
        const newUser = res.data.data;
        if (newUser.role === "member") {
          setCreatedMember({
            ...newUser,
            password_plain: form.password,
          });
        } else {
          navigate("/users");
        }
      }
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

      {createdMember && (
        <MemberCardModal
          member={createdMember}
          onClose={() => {
            setCreatedMember(null);
            navigate("/users");
          }}
        />
      )}
    </div>
  );
}

function MemberCardModal({ member, onClose }) {
  const cardRef = useRef(null);
  const memberId = String(member.id || "").padStart(5, "0");
  const issuedAt = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  function handlePrint() {
    window.print();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head no-print">
          <h3>User Berhasil Dibuat</h3>
          <button className="close-btn-x" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="alert-success no-print" style={{ marginBottom: 14 }}>
            Akun member <strong>{member.name}</strong> berhasil dibuat. Cetak kartu keanggotaan di bawah ini.
          </div>

          <div className="member-card-wrap" ref={cardRef}>
            <div className="member-card">
              <div className="member-card-header">
                <div>
                  <div className="mc-title">PERPUSTAKAAN</div>
                  <div className="mc-sub">Kartu Anggota</div>
                </div>
                <div className="mc-badge">MEMBER</div>
              </div>

              <div className="member-card-body">
                <div className="mc-row">
                  <span className="mc-label">No. Anggota</span>
                  <span className="mc-value">M-{memberId}</span>
                </div>
                <div className="mc-row">
                  <span className="mc-label">Nama</span>
                  <span className="mc-value">{member.name}</span>
                </div>
                <div className="mc-row">
                  <span className="mc-label">Email</span>
                  <span className="mc-value">{member.email}</span>
                </div>
                <div className="mc-row">
                  <span className="mc-label">Username</span>
                  <span className="mc-value">{member.email}</span>
                </div>
                <div className="mc-row">
                  <span className="mc-label">Password</span>
                  <span className="mc-value mc-mono">{member.password_plain}</span>
                </div>
                <div className="mc-row">
                  <span className="mc-label">Terbit</span>
                  <span className="mc-value">{issuedAt}</span>
                </div>
              </div>

              <div className="member-card-footer">
                Simpan kartu ini baik-baik. Tunjukkan saat meminjam buku di perpustakaan.
              </div>
            </div>
          </div>
        </div>

        <div className="modal-foot no-print">
          <button className="btn" onClick={onClose}>Tutup</button>
          <button className="btn btn-primary" onClick={handlePrint}>Cetak Kartu</button>
        </div>
      </div>
    </div>
  );
}
