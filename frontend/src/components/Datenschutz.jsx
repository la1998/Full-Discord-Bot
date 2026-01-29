import React from 'react';

export default function Datenschutz() {
  return (
    <div style={{ padding: '2em' }}>
      <h2>📄 Datenschutzerklärung</h2>
      <p>Dieses Webinterface verarbeitet personenbezogene Daten ausschließlich zum Zweck der Nutzung der angebotenen Funktionen im Discord-Dashboard.</p>
      <h3>Welche Daten werden verarbeitet?</h3>
      <ul>
        <li>Deine Discord-Benutzer-ID, Benutzername und Discriminator</li>
        <li>Deine Rollen auf dem verbundenen Server</li>
        <li>Optional: deine Aktionen im Webinterface (z. B. wenn du Panels erstellst)</li>
      </ul>
      <h3>Wofür werden diese Daten verwendet?</h3>
      <ul>
        <li>Zur Authentifizierung (Login via Discord OAuth2)</li>
        <li>Zur Berechtigungsprüfung (z. B. Zugriff nur für Administratoren oder „Botmaster“)</li>
        <li>Zur Protokollierung deiner Aktionen im Auditlog (max. 20 Einträge)</li>
      </ul>
      <h3>Speicherdauer:</h3>
      <p>Login-Daten nur während der Sitzung (Session Cookie). Auditlog-Einträge: max. 20, älteste werden automatisch gelöscht.</p>
      <h3>Speicherort:</h3>
      <p>Nur auf dem Server, lokal in der Datenbank. Keine Weitergabe an Dritte.</p>
      <h3>Verantwortlicher:</h3>
      <p>Der Betreiber dieses Dashboards (z. B. der Server-Administrator).</p>
      <p>Bei Fragen oder Widerspruch wende dich an den Server-Admin.</p>
    </div>
  );
}