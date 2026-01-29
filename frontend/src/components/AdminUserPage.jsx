import React, { useEffect, useState } from 'react';

export default function AdminUserPage({ auth }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const availableRoles = ['user', 'admin', 'botmaster'];

  useEffect(() => {
    fetch('/api/admin/users', {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error('Fehler beim Laden der Nutzer');
        return res.json();
      })
      .then(setUsers)
      .catch(err => {
        console.error(err);
        setError('Fehler beim Laden der Nutzer');
      });
  }, []);

  const updateRole = async (userId, role) => {
    try {
      await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role })
      });
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
    } catch (err) {
      console.error(err);
      alert('Fehler beim Aktualisieren der Rolle');
    }
  };

  return (
    <div style={{ paddingTop: '1em' }}>
      <h2>👥 Benutzerverwaltung</h2>
      <p style={{ color: '#666' }}>Verwalte Benutzerrollen im System</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table style={{ width: '100%', marginTop: '1em', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Benutzername</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Rolle</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Aktion</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => updateRole(user.id, e.target.value)}
                >
                  {availableRoles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </td>
              <td>✅</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
