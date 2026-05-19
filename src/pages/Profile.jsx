import { useEffect, useState } from "react";
import api from "../api.js";

export default function Profile() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [pwd, setPwd] = useState({ current_password: "", new_password: "" });
  const [errors, setErrors] = useState({});
  const [pwdErrors, setPwdErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");

  useEffect(() => {
    api.get("/profile").then((res) => {
      setForm({ name: res.data.data.name, email: res.data.data.email });
    });
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setErrors({});
    setMsg("");
    try {
      const res = await api.put("/profile", form);
      localStorage.setItem("user", JSON.stringify(res.data.data));
      setMsg("Profil berhasil diupdate");
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {});
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setPwdErrors({});
    setPwdMsg("");
    try {
      await api.put("/profile/password", pwd);
      setPwdMsg("Password berhasil diubah");
      setPwd({ current_password: "", new_password: "" });
    } catch (err) {
      if (err.response?.status === 422) setPwdErrors(err.response.data.errors || {});
    }
  }

  return (
    <div>
      <div className="page-header"><h1>Profil Saya</h1></div>

      <form className="card" onSubmit={saveProfile} style={{ maxWidth: 480 }}>
        <h3 style={{ marginBottom: 12 }}>Data Diri</h3>
        {msg && <div className="alert-success">{msg}</div>}

        <div className="form-group">
          <label>Nama</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          {errors.name && <div className="error">{errors.name[0]}</div>}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          {errors.email && <div className="error">{errors.email[0]}</div>}
        </div>

        <button className="btn btn-primary">Simpan</button>
      </form>

      <form className="card" onSubmit={savePassword} style={{ maxWidth: 480 }}>
        <h3 style={{ marginBottom: 12 }}>Ganti Password</h3>
        {pwdMsg && <div className="alert-success">{pwdMsg}</div>}

        <div className="form-group">
          <label>Password Lama</label>
          <input
            type="password"
            value={pwd.current_password}
            onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })}
            required
          />
          {pwdErrors.current_password && <div className="error">{pwdErrors.current_password[0]}</div>}
        </div>

        <div className="form-group">
          <label>Password Baru</label>
          <input
            type="password"
            value={pwd.new_password}
            onChange={(e) => setPwd({ ...pwd, new_password: e.target.value })}
            required
          />
          {pwdErrors.new_password && <div className="error">{pwdErrors.new_password[0]}</div>}
        </div>

        <button className="btn btn-primary">Ubah Password</button>
      </form>
    </div>
  );
}
