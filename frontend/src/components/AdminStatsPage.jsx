import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CSVLink } from 'react-csv';

export default function AdminStatsPage({ auth }) {
  const [stats, setStats] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth.user) return;

    fetch('/api/stats', {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error('Fehler beim Laden der Statistik');
        return res.json();
      })
      .then(setStats)
      .catch(err => {
        console.error(err);
        setError('Fehler beim Laden der Statistik');
      });
  }, [auth.user]);

  const filteredStats = stats.filter(r =>
    r.label.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ paddingTop: '1em' }}>
      <h2>📊 Admin Statistik</h2>
      <p style={{ color: '#666' }}>Verteilung der Rollen im System</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input
        type="text"
        placeholder="🔍 Nach Rolle filtern..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: '1em', padding: '0.5em', width: '100%', maxWidth: '300px' }}
      />

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={filteredStats} layout="vertical" margin={{ left: 80 }}>
          <XAxis type="number" allowDecimals={false} />
          <YAxis dataKey="label" type="category" width={150} />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <CSVLink
        data={filteredStats}
        filename="rollen-statistik.csv"
        target="_blank"
        style={{ marginTop: '1em', display: 'inline-block', textDecoration: 'none', backgroundColor: '#4caf50', color: 'white', padding: '0.5em 1em', borderRadius: '4px' }}
      >
        📥 CSV Exportieren
      </CSVLink>

      <table style={{ width: '100%', marginTop: '2em', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Rolle</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Vergebene Nutzer</th>
          </tr>
        </thead>
        <tbody>
          {filteredStats.map((r) => (
            <tr key={r.roleId}>
              <td style={{ padding: '0.5em 0' }}>{r.label}</td>
              <td style={{ textAlign: 'center' }}>{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
