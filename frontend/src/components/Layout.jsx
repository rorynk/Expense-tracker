import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          Ledger<span>.</span>
        </div>
        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/expenses" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Expenses
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          {user?.name}
          <button onClick={logout}>Log out</button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
};

export default Layout;
