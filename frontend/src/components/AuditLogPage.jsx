import React, { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';

export default function AuditLogPage({ auth }) {
  const [logs, setLogs] = useState([]);
  const [days, setDays] = useState(7);
  const [error, setError] = useState(null);

  const csvHeaders = [
    { label: 'Zeitpunkt', key: 'timestamp' },
    { label: 'Typ', key: 'type' },
    { label: 'Aktion', key: 'message' },
    { label: 'User', key: 'username' },
  ];

  useEffect(() => {
    fetch(`/api/auditlog?days=${days}`, {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error('Fehler beim Laden der Logs');
        return res.json();
      })
      .then(data => setLogs(data))
      .catch(err => {
        console.error(err);
        setError('Fehler beim Laden der Logs');
      });
  }, [days]);

  return (
    <div style={{ paddingTop: '1em' }}>
      <h2>📜 Audit Log</h2>
      <p style={{ color: '#666' }}>Aktivitätsprotokoll der letzten Tage</p>

      <label>
        📆 Zeige Einträge der letzten{' '}
        <input
          type="number"
          value={days}
          min="1"
          onChange={(e) => setDays(parseInt(e.target.value))}
          style={{ width: '60px', margin: '0 0.5em' }}
        />
        Tage
      </label>

      <div style={{ marginTop: '1em' }}>
        <CSVLink
          data={logs}
          headers={csvHeaders}
          filename={`audit-log-${days}tage.csv`}
          target="_blank"
          style={{ textDecoration: 'none', backgroundColor: '#4caf50', color: 'white', padding: '0.5em 1em', borderRadius: '4px' }}
        >
          📥 CSV Exportieren
        </CSVLink>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1em' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Zeitpunkt</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Typ</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Aktion</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>User</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={index}>
              <td style={{ padding: '0.5em 0' }}>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.type}</td>
              <td>{log.message}</td>
              <td>{log.username}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
