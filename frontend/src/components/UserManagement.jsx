
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function UserManagement({ auth }) {
  const [users, setUsers] = useState([]);
  const [newUserId, setNewUserId] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState(null);

  const fetchUsers = () => {
    fetch('/api/admin/users', { credentials: 'include' })
      .then(res => res.json())
      .then(setUsers)
      .catch(err => {
        console.error(err);
        setError('Fehler beim Laden der Benutzerliste');
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setError(null);
    if (!newUserId || !newUsername || newUserId.length < 5 || newUsername.length < 3) {
      setError('Bitte gültige Discord-ID und Username eingeben.');
      return;
    }

    fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        discordId: newUserId,
        username: newUsername
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Fehler beim Hinzufügen');
        return res.json();
      })
      .then(() => {
        setNewUserId('');
        setNewUsername('');
        fetchUsers();
      })
      .catch(err => {
        console.error(err);
        setError('Fehler beim Hinzufügen des Benutzers');
      });
  };

  const handleDelete = (id) => {
    fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
      .then(() => fetchUsers())
      .catch(err => {
        console.error(err);
        setError('Fehler beim Löschen des Benutzers');
      });
  };

  return (
    <div style={{ display: 'flex' }}>
      <aside style={{ width: '220px', paddingRight: '1.5em', borderRight: '1px solid #ccc' }}>
        <nav>
          <h3>⚙️ Admin-Menü</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><Link to="/admin/users">👥 Benutzerverwaltung</Link></li>
            <li><Link to="/admin/stats">📈 Erweiterte Statistik</Link></li>
            <li><Link to="/admin/logs">🧾 Audit Log</Link></li>
          </ul>
        </nav>
      </aside>

      <div style={{ flex: 1, paddingLeft: '2em' }}>
        <h2>👥 Benutzerverwaltung</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <input
          type="text"
          placeholder="Discord User ID"
          value={newUserId}
          onChange={e => setNewUserId(e.target.value)}
          style={{ marginRight: '1em', padding: '0.5em' }}
        />
        <input
          type="text"
          placeholder="Discord Username (z. B. Max#1234)"
          value={newUsername}
          onChange={e => setNewUsername(e.target.value)}
          style={{ marginRight: '1em', padding: '0.5em' }}
        />
        <button onClick={handleAdd}>➕ Hinzufügen</button>

        <table style={{ width: '100%', marginTop: '2em', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Discord ID</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Username</th>
              <th style={{ borderBottom: '1px solid #ccc' }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.discordId}>
                <td>{u.discordId}</td>
                <td>{u.username}</td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => handleDelete(u.discordId)}>🗑️ Entfernen</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
