import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import AdminUserPage from './AdminUserPage';
import AdminStatsPage from './AdminStatsPage';
import AdminSettingsPage from './AdminSettingsPage';
import AuditLogPage from './AuditLogPage';

export default function AdminDashboard({ auth }) {
  const allowedRoles = ['admin', 'superadmin', 'botmaster'];
  const isAllowed = auth?.isAdmin || auth?.isBotmaster || allowedRoles.includes(auth?.role);

  if (!auth || !isAllowed) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex' }}>
      <aside style={{ width: '220px', paddingRight: '1.5em', borderRight: '1px solid #ccc' }}>
        <h3>⚙️ Admin-Menü</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><Link to="/admin/settings">⚙️ Einstellungen</Link></li>
          <li><Link to="/admin/users">👥 Benutzerverwaltung</Link></li>
          <li><Link to="/admin/stats">📊 Statistik</Link></li>
          <li><Link to="/admin/logs">🧾 Audit Log</Link></li>
        </ul>
      </aside>

      <main style={{ flex: 1, paddingLeft: '2em' }}>
        <Routes>
          <Route path="/users" element={<AdminUserPage auth={auth} />} />
          <Route path="/stats" element={<AdminStatsPage auth={auth} />} />
          <Route path="/settings" element={<AdminSettingsPage auth={auth} />} />
          <Route path="/logs" element={<AuditLogPage auth={auth} />} />
          <Route path="*" element={<Navigate to="/admin/settings" replace />} />
        </Routes>
      </main>
    </div>
  );
}
