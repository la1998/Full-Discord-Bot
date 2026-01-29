import React, { useEffect, useState } from 'react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState([]);
  const [error, setError] = useState(null);
  const [savingKey, setSavingKey] = useState(null);

  useEffect(() => {
    fetch('/api/admin/settings', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(setSettings)
      .catch(err => {
        console.error(err);
        setError('Fehler beim Laden der Einstellungen');
      });
  }, []);

  const handleChange = (index, value) => {
    const updated = [...settings];
    updated[index].value = value;
    setSettings(updated);
  };

  const handleSave = async (key, value) => {
    setSavingKey(key);
    try {
      const res = await fetch(`/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ value })
      });
      if (!res.ok) throw new Error('Speichern fehlgeschlagen');
    } catch (err) {
      console.error(err);
      alert('Fehler beim Speichern');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div style={{ paddingTop: '1em' }}>
      <h2>⚙️ Admin Einstellungen</h2>
      <p style={{ color: '#666' }}>Systemweite Konfiguration (z. B. Wartungsmodus, Log-Level, etc.)</p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {settings.length === 0 && !error && (
        <p style={{ color: 'gray' }}>Keine Einstellungen gefunden.</p>
      )}

      {settings.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1em' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>🔑 Schlüssel</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>📝 Wert</th>
              <th style={{ borderBottom: '1px solid #ccc' }}></th>
            </tr>
          </thead>
          <tbody>
            {settings.map((s, index) => (
              <tr key={s.key}>
                <td style={{ padding: '0.5em 0' }}>{s.key}</td>
                <td>
                  <input
                    type="text"
                    value={s.value}
                    onChange={(e) => handleChange(index, e.target.value)}
                    style={{ width: '100%' }}
                  />
                </td>
                <td>
                  <button onClick={() => handleSave(s.key, s.value)} disabled={savingKey === s.key}>
                    💾 Speichern
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
