import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CSVLink } from 'react-csv';

export default function StatisticsPage({ auth }) {
  const [stats, setStats] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (!auth.user) return;

    fetch(`/api/stats?days=${days}`, {
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
  }, [auth.user, days]);

  if (!auth.user) {
    return <p style={{ color: 'gray' }}>🔐 Login erforderlich, um die Statistik zu sehen.</p>;
  }

  const filteredStats = stats.filter(r =>
    r.label.toLowerCase().includes(filter.toLowerCase())
  );

  const csvData = filteredStats.map(row => ({
    Rolle: row.label,
    Nutzer: row.count
  }));

  return (
    <div>
      <h2>📊 Rollenstatistik</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '1em', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1em' }}>
        <input
          type="text"
          placeholder="🔍 Nach Rolle filtern..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '0.5em', flex: '1', minWidth: '200px' }}
        />
        <select value={days} onChange={e => setDays(Number(e.target.value))}>
          <option value={1}>Letzter Tag</option>
          <option value={7}>Letzte 7 Tage</option>
          <option value={30}>Letzte 30 Tage</option>
          <option value={365}>Letztes Jahr</option>
        </select>
        <CSVLink data={csvData} filename={`rollenstatistik.csv`}>
          📥 Als CSV exportieren
        </CSVLink>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={filteredStats} layout="vertical" margin={{ left: 80 }}>
          <XAxis type="number" allowDecimals={false} />
          <YAxis dataKey="label" type="category" width={150} />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

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
