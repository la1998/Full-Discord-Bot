import React, { useEffect, useState } from 'react';
import { fetchDiscordRoles } from '../services/api';

export default function RoleSelector() {
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDiscordRoles()
      .then(data => {
        if (Array.isArray(data.roles)) {
          setRoles(data.roles);
        } else {
          setError('Ungültige Daten vom Server erhalten.');
        }
      })
      .catch(err => setError('Fehler beim Laden der Rollen: ' + err.message));
  }, []);

  const handleChange = (e) => {
    const selectedId = e.target.value;
    setSelectedRoleId(selectedId);
    const selectedRole = roles.find(role => role.id === selectedId);
    console.log('🔁 Ausgewählte Rolle:', selectedRole); // enthält id + name
    // Hier kannst du die Rolle weiterverwenden / speichern
  };

  if (error) return <div>❌ Fehler: {error}</div>;
  if (!roles || roles.length === 0) return <div>🔄 Lade Rollen...</div>;

  return (
    <div>
      <h2>🎮 Rollen Auswahl</h2>
      <select value={selectedRoleId} onChange={handleChange}>
        <option value="">-- Wähle eine Rolle --</option>
        {roles.map(role => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
    </div>
  );
}