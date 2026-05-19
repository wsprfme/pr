import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import api, { getUser, isAdmin, isStaff, isMember } from "../api.js";

export default function Layout() {
  const navigate = useNavigate();
  const user = getUser();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    try { await api.post("/logout"); } catch (e) {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function close() { setOpen(false); }

  return (
    <div className="layout">
      <div className="topbar">
        <button className="menu-btn" onClick={() => setOpen(true)}>☰</button>
        <h2>📚 SmartLibrary</h2>
      </div>

      <aside className={"sidebar " + (open ? "open" : "")}>
        <div className="sidebar-head">
          <h2>📚 SmartLibrary</h2>
          <button className="close-btn" onClick={close}>×</button>
        </div>
        <nav onClick={close}>
          <NavLink to="/dashboard">Dashboard</NavLink>

          {isMember() ? (
            <>
              <NavLink to="/borrowings">Pinjaman Saya</NavLink>
              <NavLink to="/profile">Profil</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/books">Buku</NavLink>
              <NavLink to="/categories">Kategori</NavLink>
              <NavLink to="/borrowings">Peminjaman</NavLink>
              {isStaff() && <NavLink to="/reports">Laporan</NavLink>}
              {isAdmin() && <NavLink to="/users">Users</NavLink>}
              <NavLink to="/profile">Profil</NavLink>
            </>
          )}
        </nav>
        <div className="user-info">
          {user?.name} <br />
          <span className={`badge badge-${user?.role}`}>{user?.role}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>

      {open && <div className="backdrop" onClick={close}></div>}

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
